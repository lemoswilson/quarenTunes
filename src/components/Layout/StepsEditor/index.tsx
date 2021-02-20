import React, { useRef } from 'react';
import Plus from '../Icons/Plus';
import Minus from '../Icons/Minus';
import styles from './style.module.scss';

interface StepsEditor {
    increase: (inputRef: React.RefObject<HTMLInputElement>) => void;
    decrease: (inputRef: React.RefObject<HTMLInputElement>) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
    step: number;
}

const StepsEditor: React.FC<StepsEditor> = ({ increase, decrease, onSubmit, className, step }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const onBlur = (event: React.FormEvent<HTMLFormElement>): void => {
        const input = event.currentTarget.getElementsByTagName('input')[0]
        input.value = String(step);
    }

    return (
        <div className={`${styles.box} ${className}`}>
            <Minus onClick={() => decrease(inputRef)}></Minus>
            <form onSubmit={onSubmit} onBlur={onBlur} className={styles.display}>
                <input ref={inputRef} defaultValue={step} type="text" />
            </form>
            <Plus onClick={() => increase(inputRef)}></Plus>
        </div>
    )
}

export default StepsEditor;