import React from 'react';
import styles from './slider.module.scss';
import { indicatorProps } from './index';

const Slider: React.FC<indicatorProps> = ({ captureStart, indicatorData, label, wheelMove }) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.text}>{label}</div>
            <div className={styles.indicatorWrapper}>
                <div style={{ height: indicatorData }} className={styles.value}></div>
            </div>
        </div>
    )
}

export default Slider;
