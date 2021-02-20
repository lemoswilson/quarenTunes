import React from 'react';
import styles from './style.module.scss'

interface Keyboard {
    pressed: { [key: string]: boolean },
}

const Keyboard: React.FC<Keyboard> = ({ pressed }) => {
    return (
        <div className={styles.joaozinho}></div>
    )
}

export default Keyboard;