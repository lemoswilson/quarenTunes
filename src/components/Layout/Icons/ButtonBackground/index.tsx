import styles from './buttonBackground.module.scss';
import React from 'react';

interface ButtonBackground {
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    small?: boolean;
    smallCircle?: boolean;
}

const ButtonBackground: React.FC<ButtonBackground> = ({ className, children, onClick, small, smallCircle }) => {

    const s = small ? styles.transportBox : null;
    const size = "1rem";
    const sty = smallCircle ? { borderRadius: '50%', width: size, height: size } : {};

    return (
        <div style={sty} onClick={onClick} className={`${styles.box} ${className} ${s}`}>
            {children}
        </div>
    )
}

export default ButtonBackground;