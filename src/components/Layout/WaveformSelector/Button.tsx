import React from 'react';
import styles from './button.module.scss';

const Button: React.FC<{ selected: boolean }> = ({ selected }) => {
    const color = selected ? "#f1b7c9" : "#d5dbdb";

    return (
        <svg className={styles.svg} height={'0.75rem'} width={'0.75rem'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="9.55 10.65 12 12" preserveAspectRatio={'xMaxYMid slice'}>
            <title>redButton</title>
            <g style={{ isolation: "isolate" }}>
                <g>
                    <g>
                        <circle cx="15.6" cy="16.65" r="5.12" style={{ fill: "#fff" }} />
                    </g>
                    <circle cx="15.6" cy="16.65" r="3.6" style={{ fill: color }} />
                </g>
            </g>
        </svg>

    )
};

export default Button;