import React, { useState, useRef, useEffect } from 'react';
import styles from './style.module.scss';
import Polygon from './Polygon';

interface Dropdown {
    keys: string[];
    selected: string;
    select: any;
    lookup: (key: string) => string;
}
const Dropdown: React.FC<Dropdown> = ({ keys, select, selected, lookup }) => {
    const [isOpen, toggleState] = useState(false);
    const [renderCount, increaseCounter] = useState(0)
    const vw = window.innerWidth;

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

    const optionsList = <div className={styles.list}>
        {keys.map(key => {
            return (<div className={styles.row} key={key} onClick={() => select(key)}>
                <div className={styles.hh}></div>
                <div className={styles.text}>{lookup(key)}</div>
                <div className={styles.hh}></div>
            </div>)
        })}
    </div>

    return (
        <div onClick={openClose} className={state}>
            <div className={styles.selected}>
                <div className={styles.whitespace}></div>
                <div className={styles.text}>{lookup(selected)}</div>
                <div className={styles.arrow}><Polygon className={polygonState} /></div>
            </div>
            {isOpen ? optionsList : null}
        </div>
    )
}

export default Dropdown;