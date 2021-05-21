import React from 'react';
import styles from './style.module.scss';
import ButtonBackground from '../ButtonBackground';

interface Play {
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    className?: string;
}


const PlaySVG: React.FC = () => {
    return (
        <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 18 18">
            <defs>
                {/* <style>.cls-1{isolation:isolate;}.cls-2{opacity:0.5;mix-blend-mode:multiply;}.cls-3{fill:#d4d4d4;}</style> */}
            </defs>
            <title>Play</title>
            {/* <g class="cls-1"> */}
            <g style={{isolation: 'isolate'}}>
                <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                        <g id="Transport">
                            <g id="Play">
                                <image style={{opacity: 0.5, mixBlendMode: 'multiply'}} width="18" height="18" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAACXBIWXMAAAsSAAALEgHS3X78AAABaklEQVQ4T63Uz2sTYRDG8c9uxLYeChV7EA/SCoIXPeSmJ///7FUQxFpoKaTiz9qYpMl6eGfIdkk0ogPDvDA73/d5d+Z9q7Ztda1pmgqGw+HtxBZWJSwgNarItenbgqu2bRM0wE54jTlmEZe2gN6JWGMX9/FAAV7jK75hgnnTNL+FVqPRqFKgBzjGs4D+wAXO8bELtUFpV9mOouopnkTBBT6E96GzpmmWXWAdMdXdwyGO8AKv8Dr8JZ7jsaJ8D4PsPitlCcwm7Af0UFH7EI8iHuCt0umFOHIflsC6Ax3gbnh+O8EnqyOvVZaW85U7TgNwhe8RbzUiC/uwlD5Vdp0qCs6VJrwLP4v83AbYMpJXGONzgE5xYtXRS2X+rrHodjNhLW6U3c5i/TOKT62ftcWmOVtG8Rhv8F75P+M1kI23IO9mdyT2IzdRbsEfIWldZTN8UQB57BtbQNL6T1B6jsdfvWtV/3H8F6v9R/sFZGm5AsafDCwAAAAASUVORK5CYII="/>
                                <polygon className={styles.color} points="12.02 7.11 3.45 11.39 3.45 2.82 12.02 7.11"/>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    )
}

const Play: React.FC<Play> = ({ onClick, className }) => {

    return (
        <ButtonBackground className={`${styles.hov} ${className}`} onClick={onClick} small={true} >
            <PlaySVG />
        </ButtonBackground>
    )
}

export default Play;