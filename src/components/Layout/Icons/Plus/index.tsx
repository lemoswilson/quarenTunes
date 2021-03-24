import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';
import mais from '../../../../assets/plus.svg';

interface Plus {
    className?: string;
    width?: string | number;
    height?: string | number;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}



const Plus: React.FC<Plus> = ({ className, onClick, width, height }) => {

    const w = width ? width : '100%';
    const h = height ? height : '100%';

    return (
        <ButtonBackground onClick={onClick} className={`${className} ${styles.hover}`}>
            <img className={styles.svg} src={mais} alt='plus' width={width} height={height} />
        </ButtonBackground>
    )
}

export default Plus;