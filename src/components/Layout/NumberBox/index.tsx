import React from 'react';
import styles from './style.module.scss';

interface Props {
    value: number;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

}

const NumberBox: React.FC<Props> = ({ onSubmit, value }) => {
    return (
        <div className={styles.box}>
            <form className={styles.form} onSubmit={onSubmit}>
                <input className={styles.input} type="number" />
            </form>
        </div>
    )
}

export default NumberBox;