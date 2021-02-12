import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';
import minus from '../../../../assets/minus.svg';

interface Minus {
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}



const Minus: React.FC<Minus> = ({ className, onClick }) => {
    return (
        <ButtonBackground onClick={onClick} className={`${className} ${styles.hover}`}>
            <img className={styles.svg} src={minus} alt='plus' width='100%' height='100%' />
        </ButtonBackground>
    )
}

export default Minus;