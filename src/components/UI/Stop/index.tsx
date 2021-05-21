import React from 'react';
import styles from './style.module.scss';
import ButtonBackground from '../ButtonBackground';
import S from '../../../assets/stop.svg';

interface Stop {
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    className?: string;
}

const Stop: React.FC<Stop> = ({ onClick, className }) => {

    return (
        <ButtonBackground className={`${styles.hov} ${className}`} onClick={onClick} small={true} >
            <img className={styles.img} src={S} alt='play' width='57%' height='57%' />
        </ButtonBackground>
    )
}

export default Stop;