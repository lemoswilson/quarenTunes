import React, { MouseEvent } from 'react';
import styles from './style.module.scss';

interface DrumRackFileProps {
    onClick: (e: MouseEvent) => void
    tabIndex: number,
}

const DrumRackFile: React.FC<DrumRackFileProps> = ({ onClick, tabIndex }) => {
    return (
        <div tabIndex={tabIndex} onClick={onClick} className={styles.wrapper}>
            <div className={styles.text}></div>
        </div>
    )
}

export default DrumRackFile;