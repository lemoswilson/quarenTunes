import React, { useState, useEffect } from 'react';

import { range as withRange } from '../../../lib/utility';

import Keyboard from './Keyboard';
import PrevNext from '../PrevNext';
import Dropdown from '../Dropdown';

import styles from './style.module.scss'

import { numberToNote, blackOrWhite } from '../../../store/MidiInput';
import toneRefEmitter, { trackEventTypes, ExtractTrackPayload } from '../../../lib/toneRefsEmitter';

import { subdivisionOptions } from '../../../containers/Track/defaults';

import { event } from '../../../store/Sequencer/'

interface InputKeys {
    // keyState: { [key: string]: boolean },
    keyState: boolean[],
    noteCallback: (noteName: string) => void,
    setNoteLength: (noteLength: string) => void,
    setPatternNoteLength: (noteLength: string) => void,
    setNote: (note: string) => void,
    patternNoteLength: string | number,
    selected: number[],
    events: event[]
}


const InputKeys: React.FC<InputKeys> = ({
    keyState,
    noteCallback,
    setNoteLength,
    setNote,
    setPatternNoteLength,
    events,
    patternNoteLength,
    selected,
}) => {
    const initObj: { [noteNumber: number]: boolean } = {};
    [...Array(128).keys()].forEach((val, idx, arr) => { initObj[idx] = false })
    const onStyleWhite = { fill: "#e2cea7" }
    const offStyleWhite = { fill: "#fff" };
    const onStyleBlack = { fill: "#a7bbe2" };
    const offStyleBlack = { fill: '#d4d4d4' };
    const [range, setRange] = useState(4)
    const [keyDownMouse, setMouseNote] = useState(initObj)
    const callbacksDown = withRange(25, range * 12).map(noteNumber => {
        return () => {
            noteCallback(numberToNote(noteNumber));
            setMouseNote((state) => {
                return {
                    ...state,
                    [noteNumber]: true,
                }
            })
        }
    })

    const keyStyles = withRange(25, range * 12).map((noteNumber, idx, arr) => {
        const bl = blackOrWhite(idx);
        if (bl > 0) {
            if (keyDownMouse[noteNumber] || keyState[noteNumber]) {
                return onStyleWhite
            } else return offStyleWhite
        } else {
            if (keyDownMouse[noteNumber] || keyState[noteNumber]) {
                return onStyleBlack
            } else return offStyleBlack
        }
    })

    useEffect(() => {
        function setMouseCallback() { setMouseNote(initObj) }
        document.addEventListener('mouseup', setMouseCallback)
        return () => {
            document.removeEventListener('mouseup', setMouseCallback)
        }
    }, [])


    const increaseRange = () => {
        if (range < 9)
            setRange((state) => state + 1);
    }

    const decreaseRange = () => {
        if (range > 0)
            setRange((state) => state - 1);
    }

    const selectedNoteLength =
        selected.length >= 1 && selected.map(id => events[id].instrument.length).every((val, i, arr) => val === arr[0])
            ? events[selected[0]].instrument.length
            : selected.length === 0
                ? patternNoteLength
                : '*'


    return (
        <div className={styles.wrapper}>
            {/* <div onClick={justEmit} className={styles.wrapper}> */}
            <div className={styles.topWrapper}>
                <div className={styles.range}>
                    <div className={styles.prev}>
                        <PrevNext boxClass={styles.boxWrapper} className={styles.button} direction='previous' onClick={decreaseRange} width='80%' height='80%' />
                    </div>
                    <div className={styles.display}>
                        <span className={styles.span}>{`C${range - 1}-C${range}`}</span>
                    </div>
                    <div className={styles.next}>
                        <PrevNext boxClass={styles.boxWrapper} className={styles.button} direction='next' onClick={increaseRange} width='80%' height='80%' />
                    </div>
                </div>
                <div className={styles.noteLength}>
                    <div className={styles.text}>
                        <span className={styles.move}>Note Length</span>
                    </div>
                    <div className={styles.select}>
                        <Dropdown renamable={false} keyValue={subdivisionOptions.map(value => [value, value])} small={true} onSubmit={() => { }} className={''} selected={String(selectedNoteLength)} lookup={(key) => key} keys={subdivisionOptions} select={(length) => { setPatternNoteLength(length) }}></Dropdown>
                        {/* dropdown here */}
                    </div>
                </div>
            </div>
            <div className={styles.keys}>
                <Keyboard className={styles.svg} callbacksDown={callbacksDown} keyStyles={keyStyles} ></Keyboard>
            </div>
        </div>
    )
}

export default InputKeys;