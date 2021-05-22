import React, { useEffect, useRef } from 'react';
import styles from './style.module.scss';
import Plus from '../Plus';
import Minus from '../Minus';

interface LegnthEditorProps {
    increase: () => void;
    decrease: () => void;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    label: string;
    className?: string;
    value: number | string;
    disabled: boolean,
}

const NumberEditor: React.FC<LegnthEditorProps> = ({
    decrease,
    increase,
    label,
    onSubmit,
    className,
    value,
    disabled,
    children,
}) => {

    const onBlur = (event: React.FocusEvent<HTMLFormElement>) => {
        const input = event.currentTarget.getElementsByTagName('input')[0]
        input.value = String(value);
    }


    function keydown(this: HTMLInputElement, e: KeyboardEvent){
        e.stopPropagation()
        if (e.key === 'Escape') this.blur()
    }

    useEffect(() => {
        const inp = ref_input.current
        inp?.addEventListener('keydown', keydown)

        return () => {
            inp?.removeEventListener('keydown', keydown)
        }

    }, [])

    useEffect(() => {

        if (ref_input.current) {
            ref_input.current.value = String(value);
        }

    }, [value])

    const ref_input = useRef<HTMLInputElement>(null);

    return (
        <div className={styles.wrapper}>
            <div className={styles.label}>
                <div className={styles.box}>{label}</div>
            </div>
            <div className={styles.decrease}>{!disabled ? <Minus onClick={decrease} /> : null}</div>
            <div className={styles.display}>
                <div className={styles.box}>
                    <form onBlur={onBlur} onSubmit={onSubmit} className={styles.text}>
                        <input 
                            ref={ref_input} 
                            disabled={disabled} 
                            type={"text"} 
                            defaultValue={value} 
                            placeholder={String(value)}
                        />
                    </form>
                </div>
            </div>
            <div className={styles.increase}>{!disabled ? <Plus onClick={increase} /> : null }</div>
        </div>
    )
}

export default NumberEditor;