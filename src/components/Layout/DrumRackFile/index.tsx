import React, { MouseEvent } from 'react';
import styles from './style.module.scss';

interface DrumRackFileProps {
    onClick: (e: MouseEvent) => void
}

const DrumRackFile: React.FC<DrumRackFileProps> = ({ onClick }) => {
    return (
        <div onClick={onClick} className={styles.wrapper}>
            <div className={styles.text}></div>
        </div>
    )
}

export default DrumRackFile;