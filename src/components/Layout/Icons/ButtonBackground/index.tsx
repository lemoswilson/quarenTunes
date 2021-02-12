import styles from './buttonBackground.module.scss';
import React from 'react';

interface ButtonBackground {
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const ButtonBackground: React.FC<ButtonBackground> = ({ className, children, onClick }) => {

    return (
        <div onClick={onClick} className={`${styles.box} ${className}`}>
            {children}
        </div>
    )
}

export default ButtonBackground;