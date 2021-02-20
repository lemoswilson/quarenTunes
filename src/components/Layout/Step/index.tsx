import React from 'react';
import styles from './style.module.scss';
import Lights from './Lights';

interface StepLayout {
    onTime: boolean;
    selected: boolean;
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const StepLayout: React.FC<StepLayout> = ({ onTime, selected, onClick }) => {

    const selectedStyle = selected ? styles.selected : null;
    return (
        <div className={styles.box}>
            <div className={styles.outer}>
                <div onClick={onClick} className={`${styles.inner} ${selectedStyle}`}></div>
            </div>
            <div className={styles.wrapper}>
                <Lights active={onTime}></Lights>
            </div>
        </div>
    )
}

export default StepLayout;