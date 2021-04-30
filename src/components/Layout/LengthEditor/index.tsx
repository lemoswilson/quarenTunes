import React, { useEffect, useRef } from 'react';
import styles from './style.module.scss';
import Plus from '../../Layout/Icons/Plus';
import Minus from '../../Layout/Icons/Minus';

interface LegnthEditorProps {
    increase: () => void;
    decrease: () => void;
    label: string;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
    length: number | string;
    disabled: boolean,
}

const LengthEditor: React.FC<LegnthEditorProps> = ({
    decrease,
    increase,
    label,
    onSubmit,
    className,
    length,
    disabled,
    children,
}) => {

    const onBlur = (event: React.FocusEvent<HTMLFormElement>) => {
        const input = event.currentTarget.getElementsByTagName('input')[0]
        input.value = String(length);
    }

    useEffect(() => {
        if (inputRef.current) {
            // console.log('just updated, length is now', length);
            inputRef.current.value = String(length);
        }

    }, [length])

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
                        <input ref={inputRef} disabled={disabled} type={"text"} defaultValue={length} placeholder={String(length)} />
                    </form>
                </div>
            </div>
            <div className={styles.increase}><Plus onClick={increase} /></div>
        </div>
    )
}

export default LengthEditor;