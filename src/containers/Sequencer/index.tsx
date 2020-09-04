import React, { useEffect, useContext, FunctionComponent, useState, MutableRefObject, ChangeEvent, useRef, KeyboardEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import triggCtx from '../../context/triggState';
import triggEmitter, { triggEventTypes } from '../../lib/triggEmitter';
import Tone from '../../lib/tone';
import {
    addInstrumentToSequencer,
    addPattern,
    changePage,
    changePatternLength,
    changeTrackLength,
    deleteEvents,
    goToActive,
    parameterLock,
    removeInstrumentFromSequencer,
    removePattern,
    Sequencer,
    selectPattern,
    selectStep,
    setNote,
    setNoteLength,
    setNoteLengthPlayback,
    duplicatePattern,
    setOffset,
    setPatternNoteLength,
    setPlaybackInput,
    setVelocity,
    toggleOverride,
    toggleRecordingQuantization,
    changePatternName,
} from '../../store/Sequencer';
import usePrevious from '../../hooks/usePrevious';
import to16n, { to16string } from '../Arranger'
import { RootState } from '../../App';
import { arrangerMode } from '../../store/Arranger';
import { setPatternTrackVelocity } from '../../store/Sequencer/actions';


const Sequencer: FunctionComponent = () => {
    const triggRef = useContext(triggCtx);
    const dispatch = useDispatch()

    const isPlaying = useSelector(
        (state: RootState) => state.transport.isPlaying
    );

    const sequencer = useSelector(
        (state: RootState) => state.sequencer
    );

    const previousPlaying = usePrevious(isPlaying);

    const arrangerMode = useSelector(
        (state: RootState) => state.arranger.mode
    );

    const counter = useSelector(
        (state: RootState) => state.sequencer.counter
    )

    const isFollowing = useSelector(
        (state: RootState) => state.arranger.following
    );

    const activePage = useSelector(
        (state: RootState) => state.sequencer.patterns[activePattern].tracks[selectedTrack].page
    );

    const activePageRef = useRef(activePage);

    const activePattern = useSelector(
        (state: RootState) => state.sequencer.activePattern
    );

    // **** Preciso atualizar a ref com o useEffect;
    const activePatternRef = useRef(activePattern);

    const selectedTrack = useSelector(
        (state: RootState) => state.track.selectedTrack
    );

    const selected = useSelector(
        (state: RootState) => state.sequencer.patterns[activePattern].tracks[selectedTrack].selected
    );

    const selectedRef = useRef(selected);

    const selLen = useSelector(
        (state: RootState) => state.sequencer.patterns[activePattern].tracks[selectedTrack].noteLength
    );

    const patternTrackVelocity = useSelector(
        (state: RootState) => state.sequencer.patterns[activePattern].tracks[selectedTrack].velocity
    );

    const selLenRef = useRef(selLen);

    const trackCount = useSelector(
        (state: RootState) => state.track.trackCount
    );

    const activePatternObj = useSelector(
        (state: RootState) => state.sequencer.patterns[activePattern]
    );

    const patternAmount = useSelector(
        (state: RootState) =>
            Object.keys(state.sequencer.patterns).length
    );

    // lifecycle actions 
    useEffect(() => {
        activePatternRef.current = activePattern;
    }, [activePattern]);

    useEffect(() => {
        selectedRef.current = selected
    }, [selected]);

    useEffect(() => {
        selLenRef.current = selLen;
    }, [selLen]);

    useEffect(() => {
        activePageRef.current = activePage;
    }, [activePage]);

    const remPattern = (): void => {
        dispatch(removePattern(activePattern))
        triggEmitter.emit(triggEventTypes.REMOVE_PATTERN, { pattern: activePattern });
    };

    const dupPattern = (): void => {
        triggEmitter.emit(triggEventTypes.DUPLICATE_PATTERN, { pattern: activePattern })
        dispatch(duplicatePattern(activePattern));
    };

    const tOverride = (): void => {
        dispatch(toggleOverride());
    };

    const tRecordingQuntization = (): void => {
        dispatch(toggleRecordingQuantization());
    };

    const adPattern = (): void => {
        triggEmitter.emit(triggEventTypes.ADD_PATTERN, { pattern: counter })
        dispatch(addPattern());
    };

    const chgTrackLength = (
        newLength: number,
        Ref: MutableRefObject<HTMLInputElement>
    ): void => {
        if (newLength <= 64 && newLength >= 1) {
            triggRef.current[activePattern][selectedTrack].loopEnd = to16string(newLength);
            dispatch(changeTrackLength(activePattern, selectedTrack, newLength));
        }
    };

    const chgPatternLength = (
        newLength: number,
        ref: MutableRefObject<HTMLInputElement>
    ): void => {
        if (newLength >= 1) {
            if (arrangerMode === "pattern") {
                Tone.Transport.loopEnd = to16string(newLength);
            }
            dispatch(changePatternLength(activePattern, newLength))
        }
    };

    const selPattern = (e: ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        let nextPattern: number = e.currentTarget.valueAsNumber;
        let loopEnd = sequencer.patterns[nextPattern].patternLength;

        if (Tone.Transport.state === "started") {

            [...Array(trackCount).keys()].forEach(track => {
                triggRef.current[activePattern][track].stop(0);
                triggRef.current[nextPattern][track].start(0)

                Tone.Transport.scheduleOnce(() => {
                    Tone.Transport.loopEnd = to16string(loopEnd);
                    triggRef.current[activePatternRef.current][track].mute = true;
                    triggRef.current[nextPattern][track].mute = false;
                }, 0);
            });
            Tone.Transport.scheduleOnce((time) => {
                Tone.Draw.schedule(() => {
                    dispatch(selectPattern(nextPattern));
                }, time)
            }, 0);

        } else {
            [...Array(trackCount).keys()].forEach(track => {
                triggRef.current[activePattern][track].stop();
            });
            dispatch(selectPattern(nextPattern));
        }

    };

    const chgPatternName = (name: string): void => {
        dispatch(changePatternName(activePattern, name));
    };

    const chgPage = (pageIndex: number): void => {
        dispatch(changePage(activePattern, selectedTrack, pageIndex));
    };

    const sOffSet = (direction: number): void => {
        selectedRef.current.forEach(step => {
            let eVent = { ...activePatternObj.tracks[selectedTrack].events[step] };
            let currOffset: number = eVent.offset;
            let pastEventTime = {
                '16n': step,
                '128n': currOffset
            };
            if ((direction > 0 && currOffset + direction <= 128)
                || (direction < 0 && currOffset + direction >= -128)) {
                let off: number = currOffset + direction;
                let newEventTime = {
                    '16n': step,
                    '128n': off,
                };
                triggRef.current[activePattern][selectedTrack].remove(pastEventTime);
                triggRef.current[activePattern][selectedTrack].at(newEventTime, eVent)
                dispatch(setOffset(activePattern, selectedTrack, step, off));
            }
        })
    };

    const sNote = (note: string[]): void => {
        selectedRef.current.forEach(s => {
            let e = { ...activePatternObj.tracks[selectedTrack].events[s] };
            let time = {
                '16n': s,
                '128n': e.offset,
            }
            e.note = note ? note : null;
            triggRef.current[activePattern][selectedTrack].at(time, e);
            dispatch(setNote(activePattern, selectedTrack, note, s));
        });
    };

    const sPatternNoteLength = (length: number | string) => {
        dispatch(setPatternNoteLength(activePattern, length, selectedTrack));
    };

    const sNoteLength = (noteLength: number | string): void => {
        selectedRef.current.forEach(step => {
            let e = { ...activePatternObj.tracks[selectedTrack].events[step] }
            let time = {
                '16n': step,
                '128n': e.offset,
            }
            e.length = noteLength ? noteLength : undefined;
            triggRef.current[activePattern][selectedTrack].at(time, e)
            dispatch(setNoteLength(activePattern, selectedTrack, noteLength, step))
        });
    };

    const delEvents = (): void => {
        if (selectedRef.current.length >= 1) {
            selectedRef.current.forEach(s => {
                let e = { ...activePatternObj.tracks[selectedTrack].events[s] }
                let time = {
                    '16n': s,
                    '128n': e.offset,
                }
                triggRef.current[activePattern][selectedTrack].remove(time);
                dispatch(deleteEvents(activePattern, selectedTrack, s));
            });
        }
    };

    const sVelocity = (velocity: number): void => {
        selectedRef.current.forEach(s => {
            let e = { ...activePatternObj.tracks[selectedTrack].events[s] };
            let time = {
                '16n': s,
                '128n': e.offset,
            };
            e.velocity = velocity;
            triggRef.current[activePattern][selectedTrack].at(time, e);
            dispatch(setVelocity(activePattern, selectedTrack, s, velocity));
        });
    };

    const sPatternTrackVelocity = (velocity: number): void => {
        dispatch(setPatternTrackVelocity(activePattern, selectedTrack, velocity));
    };

    const selStep = (index: number): void => {
        dispatch(selectStep(activePattern, selectedTrack, index));
    };


    interface keyDict {
        [key: string]: number
    }

    const keyDict: keyDict = {
        a: 0,
        s: 1,
        d: 2,
        f: 3,
        g: 4,
        h: 5,
        j: 6,
        k: 7,
        l: 8,
        z: 9,
        x: 10,
        c: 11,
        v: 12,
        b: 13,
        n: 14,
        m: 15
    };

    function keydown(e: KeyboardEvent<Document>): void {
        let char: string = String.fromCharCode(e.keyCode).toLowerCase();
        // colocar o condicional pra ver se não tem foco em um input box
        if (Object.keys(keyDict).includes(char)) {
            if (e.repeat) { return }
            let n: number = keyDict[char]
            let index: number = (activePageRef.current + 1) * keyDict[char];
            if (index <= selLen) {
                dispatch(selectStep(activePattern, selectedTrack, index));
            }
        } else if (e.keyCode === 37 && selectedRef.current.length >= 1) {
            e.shiftKey ? sOffSet(-10) : sOffSet(-1);
        } else if (e.keyCode === 39 && selectedRef.current.length >= 1) {
            e.shiftKey ? sOffSet(10) : sOffSet(1);
        } else if (e.keyCode === 46 || e.keyCode === 8) {
            delEvents();
        }
    };

    function keyup(e: KeyboardEvent<Document>): void {
        let char = String.fromCharCode(e.keyCode).toLowerCase();
        // colocar o condicional pra ver se não tem foco em um input box
        if (Object.keys(keyDict).includes(char)) {
            if (e.repeat) { return }
            let index = (activePageRef.current + 1) * keyDict[char];
            if (index <= selLenRef.current) {
                selStep(index);
            }
        }
    };

    return (
        <div></div>
    )
}

export default Sequencer;