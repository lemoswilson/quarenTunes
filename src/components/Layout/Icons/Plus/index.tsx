import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';
import mais from '../../../../assets/plus.svg';

interface Plus {
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}



const Plus: React.FC<Plus> = ({ className, onClick }) => {
    return (
        <ButtonBackground onClick={onClick} className={`${className} ${styles.hover}`}>
            <img className={styles.svg} src={mais} alt='plus' width='100%' height='100%' />
        </ButtonBackground>
    )
}

export default Plus;