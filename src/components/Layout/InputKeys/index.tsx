import React, { useState } from 'react';
import styles from './style.module.scss'
import Keyboard from './Keyboard';
import PrevNext from '../PrevNext';

interface InputKeys {
    // keyState: { [key: string]: boolean },
    keyState: boolean[],
}


const InputKeys: React.FC<InputKeys> = ({ keyState }) => {
    const [range, setRange] = useState(4)

    const increaseRange = () => {
        if (range < 9)
            setRange((state) => state + 1);
    }

    const decreaseRange = () => {
        if (range > 0)
            setRange((state) => state - 1);
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.range}>
                <div className={styles.prev}>
                    <PrevNext boxClass={styles.boxWrapper} className={styles.button} direction='previous' onClick={decreaseRange} width='80%' height='80%' />
                </div>
                <div className={styles.display}>
                    <span className={styles.span}>{`C${range - 1}-C${range}`}</span>
                </div>
                <div className={styles.next}>
                    <PrevNext boxClass={styles.boxWrapper} className={styles.button} direction='next' onClick={increaseRange} width='80%' height='80%' />
                </div>
            </div>
            <div className={styles.keys}>
                <Keyboard keyState={keyState.slice(range * 12, (range * 12) + 25)} className={styles.svg}></Keyboard>
            </div>
        </div>
    )
}

export default InputKeys;