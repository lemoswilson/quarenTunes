import React, { useState, useRef, useEffect, useCallback, MutableRefObject } from 'react';
import regular from './style.module.scss';
import smalls from './small.module.scss';
import Polygon from './Polygon';
import usePrevious from '../../../hooks/lifecycle/usePrevious';
import dropdownEmitter, { dropdownEventTypes } from '../../../lib/Emitters/dropdownEmitter';

interface Dropdown {
    keyValue: string[][],
    selected: string;
    select: (key: string) => void;
    className?: string;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    value: string,
    small?: boolean;
    renamable?: boolean;
    forceClose?: boolean;
    dropdownId: string,
    // ref: MutableRefObject<() => void>
}

interface DropdownList {
    styles: {[key: string]: string},
    selectAndToggle: (key: string) => void,
    keyValue: string,
    name: string,
}

const DropdownList: React.FC<DropdownList> = ({styles, selectAndToggle, keyValue, name}) => {
    const divRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
    const [isHover, setHover] = useState(false);

    function isOverflow(element: HTMLDivElement | null) {
        return (
            element 
            && element.offsetWidth < element.scrollWidth
            && isHover
        )
    }

    function onMouseOver() {
        setHover(true);
    }

    function onMouseOut() {
        setHover(false);
    }

    const shouldExtend = isOverflow(divRef.current) ? styles.extend : ''

    return (
        <div className={styles.row} onClick={() => { selectAndToggle(keyValue) }}>
            <div className={styles.hh}></div>
            <div 
                ref={divRef} 
                className={`${styles.text} ${shouldExtend}`}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
            >
                {name}
            </div>
            <div className={styles.hh}></div>
        </div>
    )
    // )
}

const Dropdown: React.FC<Dropdown> = ({
    keyValue,
    select,
    selected,
    className,
    value,
    onSubmit,
    renamable,
    small,
    forceClose,
    dropdownId
}) => {
    const [Open, toggleState] = useState(false);
    const [off, setOff] = useState(false);
    const [renderCount, increaseCounter] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null);
    const [clicked, setClick] = useState(false);
    const clickedRef = useRef(false)
    const previousOpen = usePrevious(Open)
    const name = keyValue.filter(([key, value], idx, _) => key === selected)[1];

    const styles = small ? smalls : regular

    // const styleToggle = Open
    //     ? `${styles.closed} ${styles.animate}`
    //     : !Open && renderCount > 0 && (!forceClose || clickedRef.current)
    //         ? `${styles.closed} ${styles.off}`
    //         : styles.closed

    // const polygonToggleStyle = Open
    // ? `${styles.turnOpen}`
    // : !Open && renderCount > 0 && (!forceClose || clickedRef.current)
    //     ? `${styles.turnClose}`
    //     : '';

    const styleToggle = Open
    ? `${styles.closed} ${styles.animate}`
    : off
        ? `${styles.closed} ${styles.off}`
        : styles.closed

    const polygonToggleStyle = Open
    ? `${styles.turnOpen}`
    : off
        ? `${styles.turnClose}`
        : '';




    const openClose = () => {
        if (renderCount === 0) {
            increaseCounter(1);
        }
        // setClick(!Open);
        if (!Open) {
            // clickedRef.current = true
            setClick(true)
            dropdownEmitter.emit(dropdownEventTypes.ESCAPE, {})
            dropdownEmitter.emit(dropdownEventTypes.OPEN, { id: dropdownId, openClose: () => { toggleState(state => !state) } })
        } else {
            setOff(true)
            setTimeout(() => {
                setOff(false);
            }, 220);
            dropdownEmitter.emit(dropdownEventTypes.REMOVE, { id: dropdownId })
        }

        toggleState(!Open)
        // setClick(true)

    }

    const selectAndToggle = (key: string) => {
        select(key);
        openClose();
    }

    const onBlur = (event: React.FocusEvent<HTMLFormElement>) => {
        const input = event.currentTarget.getElementsByTagName('input')[0]
        input.value = value;
    }

    const defaultValue = useCallback(() => {
        const f = keyValue.find(k => k[0] === selected)
        if (f) {
            return f[1]
        } else return selected
    }, [selected, name]);

    useEffect(() => {
        if (inputRef.current) {
            console.log('should be setting new value to dropdown');
            inputRef.current.value = value;
        }
    }, [value])

    useEffect(() => {
        if (previousOpen && !Open) {
            // clickedRef.current = false;
            setClick(false)
        }

    }, [Open])

    useEffect(() => {
        inputRef.current?.addEventListener('keydown', onKeyDown) 
        return () => {
            inputRef.current?.removeEventListener('keydown', onKeyDown) 
        }
    }, [])

    function onKeyDown(this: HTMLInputElement, e: KeyboardEvent){
       e.stopPropagation()
       if (e.key === 'Escape') {
           this.blur()
       }
    }


    const optionsList = <div className={styles.list}>
        {keyValue.map(([key, name], idx, arr) => {
            return (
                <DropdownList 
                    key={key} 
                    keyValue={key} 
                    name={name}
                    selectAndToggle={selectAndToggle}
                    styles={styles}
                />
                // <div className={styles.row} key={key} onClick={() => { selectAndToggle(key) }}>
                //     <div className={styles.hh}></div>
                //     <div className={styles.text}>{name}</div>
                //     <div className={styles.hh}></div>
                // </div>
            )
        })}
    </div>


    const form = renamable
        ? (
            <form onBlur={onBlur} onSubmit={onSubmit} className={styles.text}>
                <input 
                ref={inputRef} 
                // defaultValue={defaultValue()} 
                // onKeyDown={(e) => {e.preventDefault(); e.stopPropagation()}}
                // onKeyUp={(e) => {e.preventDefault(); e.stopPropagation()}}
                type='text' 
                placeholder={defaultValue()} />
            </form>
        ) : (
            <form className={styles.text}>
                <input 
                readOnly={true} 
                ref={inputRef} 
                value={defaultValue()} 
                type='text' 
                placeholder={defaultValue()}/>
            </form>
        )

    return (
        <div className={`${styleToggle} ${className}`}>
            <div className={styles.selected}>
                <div className={styles.whitespace}></div>
                {form}
                <div onClick={openClose} className={styles.arrow}>
                    <Polygon className={polygonToggleStyle} />
                </div>
            </div>
            {Open ? optionsList : null}
        </div>
    )
}

export default Dropdown;