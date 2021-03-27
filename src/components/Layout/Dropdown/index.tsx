import React, { useState, useRef, useEffect, useCallback } from 'react';
import regular from './style.module.scss';
import smalls from './small.module.scss';
import Polygon from './Polygon';

interface Dropdown {
    keys: string[];
    keyValue: string[][],
    selected: string;
    select: (key: string) => void;
    lookup: (key: string) => string;
    className?: string;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    small?: boolean;
    renamable?: boolean;
}

const Dropdown: React.FC<Dropdown> = ({
    keys,
    keyValue,
    select,
    selected,
    lookup,
    className,
    onSubmit,
    renamable,
    small
}) => {
    const [isOpen, toggleState] = useState(false);
    const [renderCount, increaseCounter] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null);

    const styles = small ? smalls : regular

    const styleToggle = isOpen
        ? `${styles.closed} ${styles.animate}`
        : !isOpen && renderCount > 0
            ? `${styles.closed} ${styles.off}`
            : styles.closed

    const polygonToggleStyle = isOpen
        ? `${styles.turnOpen}`
        : !isOpen && renderCount > 0
            ? `${styles.turnClose}`
            : '';

    const openClose = () => {
        if (renderCount === 0) {
            increaseCounter(1);
        }
        toggleState(!isOpen)
    }

    const selectAndToggle = (key: string) => {
        select(key);
        if (inputRef.current) {
            inputRef.current.value = lookup(key);
        }
        openClose();
    }

    const onBlur = (event: React.FocusEvent<HTMLFormElement>) => {
        const input = event.currentTarget.getElementsByTagName('input')[0]
        input.value = lookup(selected);
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = defaultValue();
        }
    }, [selected])

    const optionsList = <div className={styles.list}>
        {/* {keys.map(key => {
            return (<div className={styles.row} key={key} onClick={() => { selectAndToggle(key) }}>
                <div className={styles.hh}></div>
                <div className={styles.text}>{lookup(key)}</div>
                <div className={styles.hh}></div>
            </div>)
        })} */}
        {keyValue.map(([key, name], idx, arr) => {
            return (
                <div className={styles.row} key={key} onClick={() => { selectAndToggle(key) }}>
                    <div className={styles.hh}></div>
                    <div className={styles.text}>{name}</div>
                    <div className={styles.hh}></div>
                </div>)
        })}
    </div>

    const defaultValue = () => {
        const f = keyValue.find(k => k[0] === selected)
        if (f) {
            return f[1]
        } else return ''
    }

    const form = renamable
        ? (
            <form onBlur={onBlur} onSubmit={onSubmit} className={styles.text}>
                {/* <input ref={inputRef} defaultValue={lookup(selected)} type='text' placeholder={lookup(selected)} /> */}
                <input ref={inputRef} defaultValue={defaultValue()} type='text' placeholder={lookup(selected)} />
            </form>
        ) : (
            <form className={styles.text}>
                {/* <input readOnly={true} ref={inputRef} value={lookup(selected)} type='text' placeholder={lookup(selected)} /> */}
                <input readOnly={true} ref={inputRef} value={defaultValue()} type='text' placeholder={lookup(selected)} />
            </form>
        )

    return (
        <div className={`${styleToggle} ${className}`}>
            <div className={styles.selected}>
                <div className={styles.whitespace}></div>
                {form}
                {/* <form onBlur={onBlur} onSubmit={onSubmit} className={styles.text}>
                    <input ref={inputRef} defaultValue={lookup(selected)} type='text' placeholder={lookup(selected)} />
                </form> */}
                <div onClick={openClose} className={styles.arrow}><Polygon className={polygonToggleStyle} /></div>
            </div>
            {isOpen ? optionsList : null}
        </div>
    )
}

export default Dropdown;