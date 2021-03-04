import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
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
import InputKeys from './InputKeys';
import { useSelector } from 'react-redux';
import { RootState } from '../../containers/Xolombrisx';
import { noteOn, noteOff, noteDict, numberToNote, upOctaveKey, downOctaveKey } from '../../store/MidiInput';

const Playground: React.FC = () => {
    const [selected, select] = useState('1')
    const Options = useRef(['1', '2', '3', '4'])
    const [counter, setCounter] = useState(16);
    const [stepState, setStepState] = useState(true);
    const keys = useSelector((state: RootState) => state.midi.devices.onboardKey);
    const range = useSelector((state: RootState) => state.midi.onboardRange);
    const keyboardRangeRef = useRef(range)
    useEffect(() => { keyboardRangeRef.current = range }, [range])
    const dispatch = useDispatch();

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

    useEffect(() => {
        document.addEventListener('keydown', instrumentKeyDown);
        document.addEventListener('keyup', instrumentKeyUp);
        return () => {
            document.removeEventListener('keydown', instrumentKeyDown);
            document.removeEventListener('keyup', instrumentKeyUp);
        }
    }, [])

    const instrumentKeyDown = useCallback(function dd(this: Document, ev: KeyboardEvent) {
        if (ev.repeat) { return }
        console.log('keydown');
        const key = ev.key.toLowerCase()
        if (Object.keys(noteDict).includes(key)) {
            const noteNumber = noteDict[key] + (keyboardRangeRef.current * 12)
            const noteName = numberToNote(noteNumber);
            if (noteNumber < 127) {
                dispatch(noteOn([noteNumber], 'onboardKey'));
            }
        }
    }, [keyboardRangeRef, dispatch, noteOn])

    const instrumentKeyUp = useCallback(function dd(this: Document, ev: KeyboardEvent) {
        const key = ev.key.toLowerCase()
        console.log('key', key);
        if (Object.keys(noteDict).includes(key)) {
            const noteNumber = noteDict[key] + (keyboardRangeRef.current * 12)
            const noteName = numberToNote(noteNumber);
            if (noteNumber <= 127) {
                console.log('keyup', 'notenumber', noteNumber);
                const time = Date.now() / 1000;
                dispatch(noteOff([noteNumber], 'onboardKey'));
            }
        } else if (Object.keys(keyFunctions).includes(key)) {
            keyFunctions[key]()
        }
    }, [keyboardRangeRef, dispatch, noteOn])

    const dispatchUpOctaveKey = () => { dispatch(upOctaveKey()) };
    const dispatchDownOctaveKey = () => { dispatch(downOctaveKey()) };

    type keyFunctionsType = typeof dispatchUpOctaveKey | typeof dispatchDownOctaveKey

    const keyFunctions: { [f: string]: keyFunctionsType } = {
        '1': dispatchUpOctaveKey,
        '0': dispatchDownOctaveKey
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
            <InputKeys keyState={keys}></InputKeys>
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