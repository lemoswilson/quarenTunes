import React, { useEffect, useRef } from 'react';
import styles from './style.module.scss';

interface BPMSelectorProps {
    increaseDecrease: (amount: number) => void;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
    bpm: number;
    disabled: boolean,
}

const BPMSelector: React.FC<BPMSelectorProps> = ({
    bpm,
    increaseDecrease,
    disabled,
    onSubmit,
}) => {

    const onBlur = (event: React.FocusEvent<HTMLFormElement>) => {
        const input = event.currentTarget.getElementsByTagName('input')[0]
        input.value = String(bpm);
    }


    function keydown(this: HTMLInputElement, e: KeyboardEvent){
        e.stopPropagation()

        if (e.key === 'Escape') this.blur()

        if (e.key.toLowerCase() === 'arrowdown')
            increaseDecrease(e.shiftKey ? -10 : -1) 
        if (e.key.toLowerCase() === 'arrowup')
            increaseDecrease(e.shiftKey ? 10 : 1)

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
            ref_input.current.value = String(bpm);

        }

    }, [bpm])

    const ref_input = useRef<HTMLInputElement>(null);



    return (
        <div className={styles.box}>
            <form onBlur={onBlur} onSubmit={onSubmit} className={styles.text}>
                <input 
                    ref={ref_input} 
                    disabled={disabled} 
                    type={"text"} 
                    defaultValue={bpm} 
                    placeholder={String(bpm)}
                />
            </form>
            <div className={styles.bpm}>
                BPM
            </div>
        </div>
    )

}

export default BPMSelector;