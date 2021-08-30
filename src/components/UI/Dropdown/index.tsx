import React, { useState, useRef, useEffect, useCallback, MutableRefObject, ChangeEvent } from 'react';
import regular from './style.module.scss';
import smalls from './small.module.scss';
import Polygon from './Polygon';
import dropdownEmitter, { dropdownEventTypes, ExtractDropdownPayload } from '../../../lib/Emitters/dropdownEmitter';
import useQuickRef from '../../../hooks/lifecycle/useQuickRef';

interface Dropdown {
    select: (key: string) => void;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    keyValue?: string[][];
    dontDrop?: boolean;
    selected: string;
    className?: string;
    value: string;
    small?: boolean;
    renamable?: boolean;
    forceClose?: boolean;
    save?: {func: (input: HTMLInputElement) => void, fxIndex?: number, trackIndex: number, fetchList: () => void, },
    dropdownId: string;
}

interface DropdownList {
    styles: {[key: string]: string},
    selectAndToggle: (key: string) => void,
    keyValue: string,
    name: string,
}

const DropdownList: React.FC<DropdownList> = ({styles, selectAndToggle, keyValue, name, }) => {
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
    select,
    onSubmit,
    keyValue,
    selected,
    className,
    value,
    dontDrop,
    renamable,
    save,
    small,
    dropdownId
}) => {
    const [Open, setState] = useState(false);
    const [off, setOff] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const name = keyValue?.filter(([key, value], idx, _) => key === selected)[1];
    const ref_save = useQuickRef(save);

    const styles = small ? smalls : regular

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
        if (!Open) {
            if (save)
                save.fetchList();
            
            dropdownEmitter.emit(dropdownEventTypes.ESCAPE, {})
            dropdownEmitter.emit(dropdownEventTypes.OPEN, { id: dropdownId, openClose: () => { setState(state => !state) } })
        } else {
            setOff(true)
            setTimeout(() => {
                setOff(false);
            }, 220);
            dropdownEmitter.emit(dropdownEventTypes.REMOVE, { id: dropdownId })
        }

        setState(!Open)

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
        const f = keyValue?.find(k => k[0] === selected)
        if (f) {
            return f[1]
        } else return selected
    }, [selected, name]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = value;
        }
    }, [value])

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
        {keyValue?.map(([key, name], idx, arr) => {
            return (
                <DropdownList 
                    key={key} 
                    keyValue={key} 
                    name={name}
                    selectAndToggle={selectAndToggle}
                    styles={styles}
                />
            )
        })}
    </div>


    const form = renamable
        ? (
            <form onBlur={onBlur} onSubmit={onSubmit} className={styles.text}>
                <input 
                ref={inputRef} 
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
                {  !dontDrop ?
                    <div onClick={openClose} className={styles.arrow}>
                        <Polygon className={polygonToggleStyle} />
                    </div>
                    : null
                }
            </div>
            {Open ? optionsList : null}
        </div>
    )
}

export default Dropdown;