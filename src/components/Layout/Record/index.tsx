import React from 'react';
import styles from './style.module.scss';
import ButtonBackground from '../Icons/ButtonBackground';
import R from '../../../assets/record.svg';

interface Record {
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    className?: string;
}

const Record: React.FC<Record> = ({ onClick, className }) => {

    return (
        <ButtonBackground className={`${styles.hov} ${className}`} onClick={onClick} small={true} >
            <img className={styles.img} src={R} alt='play' width='65%' height='65%' />
        </ButtonBackground>
    )
}

export default Record;