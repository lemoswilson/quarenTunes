import React, { useEffect, useRef } from 'react';
import styles from './style.module.scss';

interface Props {
    value: number;
    updateValue: (value: number) => void;
    increaseDecrease: (value: number) => void;
}

const NumberBox: React.FC<Props> = ({ value, updateValue, increaseDecrease }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = String(value)
        }
    }, [value])

    const selectEventOnBlur = (event: React.FocusEvent<HTMLFormElement>) => {
        const input = event.currentTarget.getElementsByTagName('input')[0]
        input.value = String(value);
    }

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        const v = Number(input.value)
        if (v >= 1 && v <= 100) {
            updateValue(v)
        } else {
            input.value = String(value);
        }
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        const char = event.key;
        console.log('char is ', char);
        if (char.toLowerCase() === 'arrowdown') {
            console.log('should be dispatching increaseDecrase, decrase')
            increaseDecrease(-1)
        } else if (char.toLowerCase() === 'arrowup') {
            console.log('should be dispatching increaseDecrase, increase')
            increaseDecrease(1)
        }
    }

    return (
        <div className={styles.box}>
            <form onBlur={selectEventOnBlur} className={styles.form} onSubmit={onSubmit}>
                <input onKeyDown={onKeyDown} ref={inputRef} className={styles.input} type="number" defaultValue={value} />
            </form>
        </div>
    )
}

export default NumberBox;