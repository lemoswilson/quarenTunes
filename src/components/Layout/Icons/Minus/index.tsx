import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';
import minus from '../../../../assets/minus.svg';

interface Minus {
    // width?: string | number;
    // height?: string | number;
    className?: string;
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    small?: boolean;
}



const Minus: React.FC<Minus> = ({ className, onClick, small }) => {

    const sty = small ? { marginLeft: '0.075rem', marginTop: '0.08rem' } : {};

    return (
        <ButtonBackground smallCircle={small} onClick={onClick} className={`${className} ${styles.hover}`}>
            <img style={sty} className={styles.svg} src={minus} alt='plus' width={'100%'} height={"100%"} />
        </ButtonBackground>
    )
}

export default Minus;