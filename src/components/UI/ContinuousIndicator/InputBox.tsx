import React, { FormEvent, MutableRefObject, useEffect, useRef } from 'react';
import styles from './inputBox.module.scss';

interface InputBoxProps {
    onSubmit: (e: FormEvent) => void;
    onBlur: (e: FormEvent) => void;
    value: string | number,
}

const InputBox: React.FC<InputBoxProps> = ({
    onBlur,
    onSubmit,
    value
}) => {
    const inputRef: MutableRefObject<HTMLInputElement | null> = useRef(null)

    useEffect(() => {
        inputRef.current?.addEventListener('keydown', onKeyDown) 
        return () => {
            inputRef.current?.removeEventListener('keydown', onKeyDown) 
        }
    }, [])

    function onKeyDown(this: HTMLInputElement, e: KeyboardEvent){
       e.stopPropagation()
       if (e.key === 'Escape') {
           this.blur()
       }
    }
    return(
    <form onSubmit={onSubmit} onBlur={onBlur} className={styles.form}>
        <input 
        autoFocus 
        ref={inputRef}
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        onFocus={e => e.currentTarget.select()} 
        step={'any'} 
        className={styles.input} 
        // ref={inputRef} 
        type='number' 
        defaultValue={value}></input>
    </form>
    )
}

export default InputBox;