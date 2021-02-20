import React from 'react';
import styles from './style.module.scss';
import Arrow from '../../../assets/arrow.svg';

interface PrevNext {
    direction: 'previous' | 'next';
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const PrevNext: React.FC<PrevNext> = ({ direction, onClick }) => {

    const d = direction === "next" ? styles.right : null;

    return (
        <div onClick={onClick} className={`${styles.box} ${d}`}>
            <img className={styles.arrow} src={Arrow} alt={direction} width='100%' height='100%' />
        </div>
    )
}

export default PrevNext;