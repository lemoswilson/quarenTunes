import React, { useRef, useState } from 'react';
import Dropdrown from './Dropdown'
import styles from './Playground.module.scss';
// import ButtonBackground from './Icons/ButtonBackground';
import Save from './Icons/Save';
import TrashCan from './Icons/TrashCan';
import Plus from './Icons/Plus';
import Minus from './Icons/Minus';
import PrevNext from '../Layout/PrevNext';
import Stop from '../Layout/Stop';
import Play from '../Layout/Play';
import Record from '../Layout/Record';
import StepsEditor from '../Layout/StepsEditor';
import StepLayout from '../Layout/Step';
import Keyboard from '../Layout/Keyboard';

const Playground: React.FC = () => {
    const [selected, select] = useState('1')
    const Options = useRef(['1', '2', '3', '4'])
    const [counter, setCounter] = useState(16);
    const [stepState, setStepState] = useState(true);

    const lookup = (key: string) => {
        switch (key) {
            case '1':
                return 'pastel';
            case '2':
                return 'macarrão';
            case '3':
                return 'abobrinha';
            case '4':
                return 'mandioca';
            default:
                return 'jamaica';
        }
    }

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        setCounter(Number(input.value));
        // do shit
    }

    const increase = (inputRef: React.RefObject<HTMLInputElement>) => {
        setCounter((state) => {
            if (inputRef.current) {
                inputRef.current.value = String(state + 1);
            }
            return state + 1
        })
    }

    const decrease = (inputRef: React.RefObject<HTMLInputElement>) => {
        setCounter((state) => {
            if (inputRef.current) {
                inputRef.current.value = String(state - 1);
            }
            return state - 1
        })
    }

    const toggleStepState = () => {
        setStepState((state) => !state);
    };

    return (
        <div className={styles.box}>
            {/* <StepLayout onClick={toggleStepState} onTime={true} selected={stepState}></StepLayout> */}
            {/* <StepLayout onTime={ toggleStepState} selected={false}></StepLayout> */}
            {/* <StepsEditor
                    decrease={decrease}
                    increase={increase}
                    onSubmit={onSubmit}
                    step={counter}
                ></StepsEditor> */}
            {/* <Stop className={styles.mamao} onClick={() => { }}></Stop> */}
            {/* <Play className={styles.estopin} onClick={() => { }}></Play> */}
            {/* <Record className={styles.estopin} onClick={() => { }}></Record> */}
            {/* <PrevNext onClick={() => { }} direction='next'></PrevNext> */}
            {/* <Dropdrown onSubmit={onSubmit} className={styles.mamao} selected={selected} lookup={lookup} keys={Options.current} select={select}></Dropdrown> */}
            {/* <Plus className={styles.mamao}></Plus>
                <Minus className={styles.estopin}></Minus> */}
            {/* <Save className={styles.estopin}></Save> */}
            {/* <TrashCan className={styles.estopin}></TrashCan> */}
        </div>
    )
}

export default Playground;