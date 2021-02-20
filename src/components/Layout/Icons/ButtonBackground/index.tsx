import styles from './buttonBackground.module.scss';
import React from 'react';

interface ButtonBackground {
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    small?: boolean;
}

const ButtonBackground: React.FC<ButtonBackground> = ({ className, children, onClick, small }) => {

    const s = small ? styles.transportBox : null;

    return (
        <div onClick={onClick} className={`${styles.box} ${className} ${s}`}>
            {children}
        </div>
    )
}

export default ButtonBackground;