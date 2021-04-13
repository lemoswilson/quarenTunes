import React, { useState } from 'react';
import styles from './slider.module.scss';
import { indicatorProps } from './index';

// const Slider: React.FC<indicatorProps> = ({ captureStartDiv, indicatorData, label, wheelMove, className, unit, value, setDisplay, display }) => {
const Slider: React.FC<indicatorProps> = ({ captureStartDiv, indicatorData, label, className, unit, value, setDisplay, display, wheelMove }) => {
    const c = `${styles.wrapper} ${className}`;

    return (
        <div className={c} onWheel={wheelMove}>
            <div onClick={setDisplay} className={styles.text}>{display ? label : `${value} ${unit}`}</div>
            <div onPointerDown={captureStartDiv} className={styles.indicatorWrapper}>
                <div style={{ height: indicatorData }} className={styles.value}></div>
            </div>
        </div>
    )
}

export default Slider;
