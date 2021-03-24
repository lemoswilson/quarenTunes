import React, { useRef } from 'react';
import styles from './style.module.scss';
import Plus from '../../Layout/Icons/Plus';
import Minus from '../../Layout/Icons/Minus';

interface LegnthEditorProps {
    increase: () => void;
    decrease: () => void;
    label: string;
    onSubmit: () => void;
    className?: string;
    length: number;
}

const LengthEditor: React.FC<LegnthEditorProps> = ({
    decrease,
    increase,
    label,
    onSubmit,
    className,
    length
}) => {

    const onBlur = () => {

    }

    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={styles.wrapper}>
            <div className={styles.label}>
                <div className={styles.box}>{label}</div>
            </div>
            <div className={styles.decrease}><Minus onClick={decrease} /></div>
            <div className={styles.display}>
                <div className={styles.box}>
                    <form onBlur={onBlur} onSubmit={onSubmit} className={styles.text}>
                        <input type={"number"} defaultValue={length} placeholder={String(length)} />
                    </form>
                </div>
            </div>
            <div className={styles.increase}><Plus onClick={increase} /></div>
        </div>
    )
}

export default LengthEditor;