import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './style.module.scss';
import Polygon from './Polygon';

interface Dropdown {
    keys: string[];
    selected: string;
    select: any;
    lookup: (key: string) => string;
    className?: string;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}
const Dropdown: React.FC<Dropdown> = ({
    keys,
    select,
    selected,
    lookup,
    className,
    onSubmit
}) => {
    const [isOpen, toggleState] = useState(false);
    const [renderCount, increaseCounter] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null);

    const state = isOpen
        ? `${styles.closed} ${styles.animate}`
        : !isOpen && renderCount > 0
            ? `${styles.closed} ${styles.off}`
            : styles.closed

    const polygonState = isOpen
        ? `${styles.turnOpen}`
        : !isOpen && renderCount > 0
            ? `${styles.turnClose}`
            : '';

    const openClose = () => {
        if (renderCount == 0) {
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

    const optionsList = <div className={styles.list}>
        {keys.map(key => {
            return (<div className={styles.row} key={key} onClick={() => { selectAndToggle(key) }}>
                <div className={styles.hh}></div>
                <div className={styles.text}>{lookup(key)}</div>
                <div className={styles.hh}></div>
            </div>)
        })}
    </div>

    return (
        <div className={`${state} ${className}`}>
            <div className={styles.selected}>
                <div className={styles.whitespace}></div>
                <form onBlur={onBlur} onSubmit={onSubmit} className={styles.text}>
                    <input ref={inputRef} defaultValue={lookup(selected)} type='text' placeholder={lookup(selected)} />
                </form>
                <div onClick={openClose} className={styles.arrow}><Polygon className={polygonState} /></div>
            </div>
            {isOpen ? optionsList : null}
        </div>
    )
}

export default Dropdown;