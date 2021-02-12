import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';
import Trash from '../../../../assets/lixoso.svg';

interface TrashCan {
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}



const TrashCan: React.FC<TrashCan> = ({ className, onClick }) => {
    return (
        <ButtonBackground onClick={onClick} className={`${className} ${styles.hover}`}>
            <img className={styles.svg} src={Trash} alt='remove' width='150%' height='150%' />
        </ButtonBackground>
    )
}

export default TrashCan;