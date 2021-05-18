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
            ref_input.current.value = String(length);
        }

    }, [length])

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
                            defaultValue={length} 
                            placeholder={String(length)}
                        />
                    </form>
                </div>
            </div>
            <div className={styles.increase}>{!disabled ? <Plus onClick={increase} /> : null }</div>
        </div>
    )
}

export default LengthEditor;