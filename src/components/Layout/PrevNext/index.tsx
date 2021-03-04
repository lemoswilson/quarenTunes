import React from 'react';
import styles from './style.module.scss';
import Arrow from '../../../assets/arrow.svg';
import arrowNext from '../../../assets/arrowNext.svg';

interface PrevNext {
    direction: 'previous' | 'next';
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    width?: string | number;
    height?: string | number;
    className?: string;
    boxClass?: string;
}

const PrevNext: React.FC<PrevNext> = ({ direction, onClick, width, height, className, boxClass }) => {

    // const d = direction === "next" ? styles.right : null;
    const d = direction === 'next' ? arrowNext : Arrow;
    const w = width ? width : '100%'
    const h = height ? height : '100%'

    return (
        // <div onClick={onClick} className={`${styles.box} ${d}`}>
        //     <img className={styles.arrow} src={Arrow} alt={direction} width='100%' height='100%' />
        // </div>
        <div onClick={onClick} className={`${styles.box} ${boxClass}`}>
            <img className={`${styles.arrow} ${className}`} src={d} alt={direction} width={w} height={h} />
        </div>
    )
}

export default PrevNext;