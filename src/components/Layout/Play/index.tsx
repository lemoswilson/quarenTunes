import React from 'react';
import styles from './style.module.scss';
import Polygon from '../Dropdown/Polygon';
import ButtonBackground from '../Icons/ButtonBackground';
import P from '../../../assets/play.svg';

interface Play {
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    className?: string;
}

// const PlaySVG: React.FC = () => {
//     return (

//     )
// }

const Play: React.FC<Play> = ({ onClick, className }) => {

    return (
        <ButtonBackground className={`${styles.hov} ${className}`} onClick={onClick} small={true} >
            <img className={styles.img} src={P} alt='play' width='70%' height='70%' />
        </ButtonBackground>
    )
}

export default Play;