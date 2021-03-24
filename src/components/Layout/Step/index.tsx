import React from 'react';
import styles from './style.module.scss';
import Lights from './Lights';

interface StepLayout {
    onTime: boolean;
    selected: boolean;
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    className?: string;
}

const StepLayout: React.FC<StepLayout> = ({ onTime, selected, onClick, className }) => {

    const selectedStyle = selected ? styles.selected : null;
    return (
        <div className={`${styles.box} ${className}`}>
            <div className={styles.buttonWrapper}>
                <div className={styles.outer}>
                    <div onClick={onClick} className={`${styles.inner} `}></div>
                </div>
            </div>
            <div className={styles.wrapper}>
                <Lights className={styles.light} active={onTime}></Lights>
            </div>
        </div>
    )
}

export default StepLayout;