import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';
import minus from '../../../../assets/minus.svg';

interface Minus {
    width?: string | number;
    height?: string | number;
    className?: string;
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}



const Minus: React.FC<Minus> = ({ className, onClick, width, height }) => {

    const w = width ? width : '100%';
    const h = height ? height : '100%';

    return (
        <ButtonBackground onClick={onClick} className={`${className} ${styles.hover}`}>
            <img className={styles.svg} src={minus} alt='plus' width={width} height={height} />
        </ButtonBackground>
    )
}

export default Minus;