import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';
import mais from '../../../../assets/plus.svg';

interface Plus {
    className?: string;
    // width?: string | number;
    // height?: string | number;
    small?: boolean;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}



const Plus: React.FC<Plus> = ({ className, onClick, small }) => {

    const sty = small ? { marginLeft: '0.075rem', marginTop: '0.075rem' } : {};

    return (
        <ButtonBackground smallCircle={small} onClick={onClick} className={`${className} ${styles.hover}`}>
            <img style={sty} className={styles.svg} src={mais} alt='plus' width={'100%'} height={'100%'} />
        </ButtonBackground>
    )
}

export default Plus;