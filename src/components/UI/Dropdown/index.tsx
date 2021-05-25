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
    small?: boolean;
    renamable?: boolean;
    forceClose?: boolean;
    dropdownId: string,
    // ref: MutableRefObject<() => void>
}

const Dropdown: React.FC<Dropdown> = ({
    keyValue,
    select,
    selected,
    className,
    onSubmit,
    renamable,
    small,
    forceClose,
    dropdownId
}) => {
    const [Open, toggleState] = useState(false);
    const [renderCount, increaseCounter] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null);
    const [clicked, setClick] = useState(false);
    const clickedRef = useRef(false)
    const previousOpen = usePrevious(Open)

    const styles = small ? smalls : regular

    const styleToggle = Open
        ? `${styles.closed} ${styles.animate}`
        : !Open && renderCount > 0 && (!forceClose || clickedRef.current)
            ? `${styles.closed} ${styles.off}`
            : styles.closed

    const polygonToggleStyle = Open
        ? `${styles.turnOpen}`
        : !Open && renderCount > 0 && (!forceClose || clickedRef.current)
            ? `${styles.turnClose}`
            : '';

    const openClose = () => {
        if (renderCount === 0) {
            increaseCounter(1);
        }
        // setClick(!Open);
        if (!Open) {
            clickedRef.current = true
            dropdownEmitter.emit(dropdownEventTypes.ESCAPE, {})
            dropdownEmitter.emit(dropdownEventTypes.OPEN, { id: dropdownId, openClose: () => { toggleState(state => !state) } })
        } else {
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
        input.value = defaultValue();
    }

    const defaultValue = useCallback(() => {
        const f = keyValue.find(k => k[0] === selected)
        if (f) {
            return f[1]
        } else return selected
    }, [selected, keyValue])

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = defaultValue();
        }
    }, [selected, defaultValue])

    useEffect(() => {
        if (previousOpen && !Open) {
            clickedRef.current = false;
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
                <div className={styles.row} key={key} onClick={() => { selectAndToggle(key) }}>
                    <div className={styles.hh}></div>
                    <div className={styles.text}>{name}</div>
                    <div className={styles.hh}></div>
                </div>)
        })}
    </div>


    const form = renamable
        ? (
            <form onBlur={onBlur} onSubmit={onSubmit} className={styles.text}>
                <input 
                ref={inputRef} defaultValue={defaultValue()} 
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
                <div onClick={openClose} className={styles.arrow}><Polygon className={polygonToggleStyle} /></div>
            </div>
            {Open ? optionsList : null}
        </div>
    )
}

export default Dropdown;