import React, {
    useEffect,
    useContext,
    FunctionComponent,
    useState,
    MutableRefObject,
    ChangeEvent,
    useRef,
    KeyboardEvent as kEvent,
    useCallback, RefObject, MouseEvent
} from 'react';
import useQuickRef from '../../hooks/useQuickRef';
import usePrevious from '../../hooks/usePrevious';
import { useSelector, useDispatch } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import {
    addPattern,
    changePage,
    changePatternLength,
    changeTrackLength,
    deleteEvents,
    removePattern,
    Sequencer as SequencerType,
    selectPattern,
    selectStep,
    setNote,
    setNoteLength,
    duplicatePattern,
    setOffset,
    setPatternNoteLength,
    setVelocity,
    toggleOverride,
    toggleRecordingQuantization,
    changePatternName,
} from '../../store/Sequencer';
import { incDecOffset, incDecPatLength, incDecTrackLength, incDecStepVelocity, renamePattern, setPatternTrackVelocity, incDecPTVelocity, cycleSteps } from '../../store/Sequencer/actions';
import { noteOff, noteOn, upOctaveKey, downOctaveKey, keyDict, noteDict, numberNoteDict } from '../../store/MidiInput';

import triggCtx from '../../context/triggState';

import { bisect, startEndRange, timeObjFromEvent } from '../../lib/utility';
// import Tone from '../../lib/tone';
// import * as Tone from 'tone';
import triggEmitter, { triggEventTypes } from '../../lib/triggEmitter';
import MenuEmitter, { menuEmitterEventTypes } from '../../lib/MenuEmitter';
import DropdownEmitter, { dropdownEventTypes } from '../../lib/dropdownEmitter';

import StepSequencer from '../../components/StepSequencer';
import Patterns from '../../components/Patterns/Patterns';
import Playground from '../../components/Layout/Playground';
import InputKeys from '../../components/Layout/InputKeys';

import { bbsFromSixteenth } from '../Arranger'
import { RootState } from '../Xolombrisx';

import styles from './style.module.scss';
import { xolombrisxInstruments } from '../../store/Track';

import toneRefsContext from '../../context/toneRefsContext';
import ToneContext from '../../context/ToneContext';
import menuContext from '../../context/MenuContext';
import dropdownContext from '../../context/DropdownContext';

const Sequencer: FunctionComponent = () => {
    const triggRef = useContext(triggCtx);
    const toneRefs = useContext(toneRefsContext);
    const dispatch = useDispatch()
    const newPatternRef = useRef(false);
    const Tone = useContext(ToneContext);
    const [isNote, setIsNote] = useState(false)

    const isPlaying = useSelector((state: RootState) => state.transport.present.isPlaying);
    const sequencer = useSelector((state: RootState) => state.sequencer.present);
    const previousPlaying = usePrevious(isPlaying);
    const arrangerMode = useSelector((state: RootState) => state.arranger.present.mode);
    const counter = useSelector((state: RootState) => state.sequencer.present.counter);
    const isFollowing = useSelector((state: RootState) => state.arranger.present.following);
    const trackCount = useSelector((state: RootState) => state.track.present.trackCount)
    const patternAmount = useSelector((state: RootState) => Object.keys(state.sequencer.present.patterns).length)
    const MenuContext = useContext(menuContext);
    const DropdownContext = useContext(dropdownContext);

    const activePattern = useSelector((state: RootState) => state.sequencer.present.activePattern);
    const activePatternRef = useRef(activePattern);
    useEffect(() => { activePatternRef.current = activePattern }, [activePattern])


    const selectedTrack = useSelector((state: RootState) => state.track.present.selectedTrack)
    const selectedTrackRef = useRef(selectedTrack);
    useEffect(() => {
        selectedTrackRef.current = selectedTrack
    }, [selectedTrack])

    const selected = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].selected);
    const selectedRef = useRef(selected);
    const selectedInstrument = useSelector((state: RootState) => state.track.present.tracks[selectedTrack].instrument)
    useEffect(() => { selectedRef.current = selected }, [selected])

    // const selLen = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].noteLength);
    const selLen = selected.length
    const patternTrackVelocity = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].velocity);
    const selLenRef = useRef(selLen);
    useEffect(() => { selLenRef.current = selLen }, [selLen])

    const activePage = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].page);
    const activePageRef = useRef(activePage);
    useEffect(() => { activePageRef.current = activePage }, [activePage])

    const keyboardRange = useSelector((state: RootState) => state.midi.onboardRange);
    const keyboardRangeRef = useRef(keyboardRange)
    useEffect(() => { keyboardRangeRef.current = keyboardRange }, [keyboardRange])

    const patterns = useSelector((state: RootState) => state.sequencer.present.patterns);

    const patternLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].patternLength)
    const patternNoteLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].noteLength)
    const trackLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].length)

    const trackLengthRef = useRef(trackLength)
    useEffect(() => {
        trackLengthRef.current = trackLength;
    }, [trackLength])

    const events = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].events);
    const activePatternObj = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern])
    const selectedDevice = useSelector((state: RootState) => {
        if (state.track.present.tracks[selectedTrack].midi.device
            && state.track.present.tracks[selectedTrack].midi.channel
        ) return state.track.present.tracks[selectedTrack].midi.device
        else return undefined;
    })

    const keys = useSelector((state: RootState) => {
        // if (selectedDevice) {
        //     return state.midi.devices[selectedDevice]
        // }
        return state.midi.devices.onboardKey;
    });


    const dispatchRemovePattern = (): void => {
        dispatch(removePattern(activePattern))
        triggEmitter.emit(triggEventTypes.REMOVE_PATTERN, { pattern: activePattern });
    };

    const dispatchDuplicatePattern = (): void => {
        triggEmitter.emit(triggEventTypes.DUPLICATE_PATTERN, { pattern: activePattern })
        dispatch(duplicatePattern(activePattern));
    };

    const dispatchToggleOverride = (): void => {
        dispatch(toggleOverride());
    };

    const dispatchToggleRecordingQuantization = (): void => {
        dispatch(toggleRecordingQuantization());
    };

    const dispatchAddPattern = useCallback(() => {
        triggEmitter.emit(triggEventTypes.ADD_PATTERN, { pattern: counter })
        dispatch(addPattern());
        newPatternRef.current = true;
    }, [
        dispatch,
        counter
    ]);

    const dispatchChangeTrackLength = (
        newLength: number,
    ): void => {
        if (newLength <= 64 && newLength >= 1) {
            const nl = bbsFromSixteenth(newLength)
            triggRef.current[activePattern][selectedTrack].instrument.loopEnd = nl;
            let i = 0;
            // while (i < 4) {
            while (i < triggRef.current[activePattern][selectedTrack].effects.length) {
                triggRef.current[activePattern][selectedTrack].effects[i].loopEnd = nl;
                i++
            }
            dispatch(changeTrackLength(activePattern, selectedTrack, newLength));
        }
    };

    useEffect(() => {
        if (arrangerMode === "pattern") {
            Tone.Transport.loopEnd = patternLength;
        }
    }, [arrangerMode, patternLength])

    const dispatchChangePatternLength = useCallback((
        newLength: number
    ): void => {
        if (newLength >= 1) {
            dispatch(changePatternLength(activePattern, newLength))
        }
    }, [activePattern, dispatch]);

    const dispatchIncDecPatLength = useCallback((
        amount: number
    ) => {
        dispatch(incDecPatLength(amount, activePattern))
    }, [activePattern, dispatch])

    const dispatchIncDecTrackLength = useCallback((
        amount: number
    ) => {
        dispatch(incDecTrackLength(amount, activePattern, selectedTrack))
    }, [activePattern, dispatch, selectedTrack])

    // const dispatchSelectPattern = (e: ChangeEvent<HTMLInputElement>): void => {
    const dispatchSelectPattern = (key: string): void => {
        // e.preventDefault();
        // let nextPattern: number = e.currentTarget.valueAsNumber;
        let nextPattern: number = Number(key);
        let loopEnd = sequencer.patterns[nextPattern].patternLength;

        if (Tone.Transport.state === "started" && arrangerMode === 'pattern') {

            [...Array(trackCount).keys()].forEach(track => {
                triggRef.current[activePattern][track].instrument.stop(0);
                triggRef.current[nextPattern][track].instrument.start(0)
                const l = triggRef.current[activePattern][track].effects.length
                for (let j = 0; j < l; j++) {
                    triggRef.current[activePattern][track].effects[j].stop(0);
                    triggRef.current[nextPattern][track].effects[j].start(0)
                }

                Tone.Transport.scheduleOnce(() => {
                    Tone.Transport.loopEnd = bbsFromSixteenth(loopEnd);
                    triggRef.current[activePatternRef.current][track].instrument.mute = true;
                    triggRef.current[nextPattern][track].instrument.mute = false;
                    const l = triggRef.current[activePattern][track].effects.length
                    for (let j = 0; j < l; j++) {
                        triggRef.current[activePatternRef.current][track].effects[j].mute = true;
                        triggRef.current[nextPattern][track].effects[j].mute = false;
                    }

                }, 0);
            });
            Tone.Transport.scheduleOnce((time) => {
                Tone.Draw.schedule(() => {
                    dispatch(selectPattern(nextPattern));
                }, time)
            }, 0);
            return
        }
        if (arrangerMode === 'pattern') {
            [...Array(trackCount).keys()].forEach(track => {
                triggRef.current[activePattern][track].instrument.stop();
                const l = triggRef.current[activePattern][track].effects.length
                for (let j = 0; j < l; j++) {
                    triggRef.current[activePattern][track].effects[j].stop();
                }
            });
        }
        dispatch(selectPattern(nextPattern));
    };

    const dispatchChangePatternName = useCallback((name: string): void => {
        dispatch(
            changePatternName(
                activePattern,
                name
            )
        );
    }, [activePattern, dispatch]);

    const dispatchChangePage = useCallback((pageIndex: number): void => {
        dispatch(
            changePage(
                activePattern,
                selectedTrack,
                pageIndex
            )
        );
    }, [dispatch, activePattern, selectedTrack]);

    const pageClickHandler = useCallback((e: MouseEvent, pageIndex: number): void => {
        if (e.shiftKey) {
            console.log('should be mimicking and dispatching select steps')
            mimicSelectedFromTo(activePageRef.current, pageIndex)
        } else {
            dispatchChangePage(pageIndex)
        }
    }, [dispatchChangePage, activePageRef])

    const mimicSelectedFromTo = (from: number, to: number) => {
        if (from === to) return;

        const v: number[] = []
        const r = [from * 16, from * 16 + 15]
        selectedRef.current.forEach(i => {
            if (i >= r[0] && i <= r[1]) v.push(i - 16*from);
        })
        v.forEach(value => {
            dispatch(selectStep(activePatternRef.current, selectedTrackRef.current, to*16 + value))
        })
    }

    const dispatchSetOffset = (direction: number): void => {
        selectedRef.current.forEach(step => {
            let offset = activePatternObj.tracks[selectedTrack].events[step].offset;
            // let eVent = { ...activePatternObj.tracks[selectedTrack].events[step] };
            // let currOffset: number = eVent.offset ? eVent.offset : 0;
            let currOffset = offset ? offset : 0;
            if ((direction > 0 && currOffset + direction <= 128)
                || (direction < 0 && currOffset + direction >= -128)) {
                let off: number = currOffset + direction;
                dispatch(
                    setOffset(
                        activePattern,
                        selectedTrack,
                        step,
                        off
                    )
                );
            }
        })
    };

    const dispatchSetNote = (note: string): void => {
        selectedRef.current.forEach(s => {
            dispatch(
                setNote(
                    activePattern,
                    selectedTrack,
                    note,
                    s
                )
            );
        });
    };

    const dispatchSetPatternNoteLength = (length: string) => {
        const d = length === '###PT' ? undefined : length
        if (selected.length === 0) {
            dispatch(
                setPatternNoteLength(
                    activePattern,
                    d,
                    selectedTrack
                )
            );
        } else {
            dispatchSetNoteLength(d)
        }
    };

    const dispatchSetNoteLength = (noteLength: number | string | undefined): void => {
        selectedRef.current.forEach(step => {
            dispatch(
                setNoteLength(
                    activePattern,
                    selectedTrack,
                    noteLength ? noteLength : 0,
                    step
                )
            );
        });
    };

    const dispatchDeleteEvents = (): void => {
        if (selectedRef.current.length >= 1) {
            selectedRef.current.forEach(s => {
                let e = { ...activePatternObj.tracks[selectedTrack].events[s] }
                let time = timeObjFromEvent(s, e)
                triggRef.current[activePattern][selectedTrack].instrument.remove(time);
                const l = triggRef.current[activePattern][selectedTrack].effects.length
                for (let j = 0; j < l; j++) {
                    triggRef.current[activePattern][selectedTrack].effects[j].remove(time);
                }
                dispatch(
                    deleteEvents(
                        activePattern,
                        selectedTrack,
                        s
                    )
                );
            });
        }
    };

    const dispatchSetVelocity = (velocity: number): void => {
        selectedRef.current.forEach(s => {
            dispatch(
                setVelocity(
                    activePattern,
                    selectedTrack,
                    s,
                    velocity
                )
            );
        });
    };

    const dispatchSetPatternTrackVelocity = (velocity: number): void => {
        dispatch(
            setPatternTrackVelocity(
                activePattern,
                selectedTrack,
                velocity
            )
        );
    };

    const dispatchSelectStep = (index: number): void => {
        dispatch(
            selectStep(
                activePattern,
                selectedTrack,
                index
            )
        );
    };

    const dispatchIncDecStepVelocity = (amount: number): void => {
        // if (selected.length > 0) {
            selected.forEach(step => {
                dispatch(
                    incDecStepVelocity(
                        amount, 
                        activePattern, 
                        selectedTrack, 
                        step
                    )
                )
            })
        // }
        // } else {
        //     dispatch(
        //         incDecVelocity(amount, activePattern, selectedTrack, -1)
        //     )
        // }
    }

    const dispatchIncDecPTVelocity = (amount: number): void => {
        dispatch(incDecPTVelocity(
            amount,
            activePattern,
            selectedTrack,
        )) 
    }

    const dispatchIncDecOffset = (amount: number): void => {
        selectedRef.current.forEach(step => {
            dispatch(
                incDecOffset(amount, activePattern, selectedTrack, step)
            )
        })
    }

    // keyboard shortcuts event listeners
    // activate when finished testing keyboard

    useEffect(() => {
        document.addEventListener('keydown', keydown)
        document.addEventListener('keydown', keyup)

        return () => {
            document.removeEventListener('keydown', keydown)
            document.removeEventListener('keydown', keyup)
        }
    }, [])


    const dispatchUpOctaveKey = () => { dispatch(upOctaveKey()) };
    const dispatchDownOctaveKey = () => { dispatch(downOctaveKey()) };

    type keyFunctionsType = typeof dispatchUpOctaveKey | typeof dispatchDownOctaveKey

    const keyFunctions: { [f: string]: keyFunctionsType } = {
        '1': dispatchUpOctaveKey,
        '0': dispatchDownOctaveKey
    }

    // sequencer keyboard shortcuts 
    function keydown(this: Document, e: KeyboardEvent): void {
        let char: string = e.key.toLowerCase();
        const target = 
        console.log('keydown, char is:', char)
        // colocar o condicional pra ver se não tem foco em um input box
        // passar todas as input refs pra um context
        // e checar com hasFocus?
        if (!e.shiftKey && Object.keys(keyDict).includes(char)) {
            console.log('dictionary includes key')
            if (e.repeat) { return }
            let n: number = keyDict[char]
            let index: number = (activePageRef.current + 1) * keyDict[char];
            if (index <= trackLength) {
                dispatch(selectStep(activePatternRef.current, selectedTrackRef.current, index));
            }
        } else if (char === 'arrowleft' && selectedRef.current.length >= 1) {
            e.shiftKey ? dispatchIncDecOffset(-10) : dispatchIncDecOffset(-1);
        } else if (char === 'arrowright' && selectedRef.current.length >= 1) {
            e.shiftKey ? dispatchIncDecOffset(10) : dispatchIncDecOffset(1);
        } else if (char === 'delete' || e.key.toLowerCase() === 'backspace') {
            dispatchDeleteEvents();
        } else if (keyFunctions[char]) {
            keyFunctions[char]()
        } else if (!e.shiftKey && numberNoteDict[noteDict[char]]) {
            const noteName = numberNoteDict[noteDict[char]] + String(keyboardRangeRef.current)
            console.log('notename', noteName);
        } else if (!e.shiftKey && char === '`') {
            setIsNote(state => !state)
        } else if (!e.shiftKey && char === 'escape') {
            if (MenuContext.current.length > 0) {
                MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
            } else if (Object.keys(DropdownContext.current).length > 0) {
                DropdownEmitter.emit(dropdownEventTypes.ESCAPE, {})
            } else if (selectedRef.current.length > 0) {
                dispatch(selectStep(activePatternRef.current, selectedTrackRef.current, -1))
            }
        } 
        // else if (e.shiftKey && char === 'c') {
        //     dispatch(cycleSteps(
        //         -1, 
        //         activePatternRef.current,
        //         selectedTrackRef.current,
        //         e.ctrlKey ? [activePageRef.current*16, finalStep()] : [0, trackLengthRef.current - 1] 
        //         ))
        // } else if (e.shiftKey && char === 'v') {
        //     dispatch(cycleSteps(
        //         1, 
        //         activePatternRef.current,
        //         selectedTrackRef.current,
        //         e.ctrlKey ? [activePageRef.current*16, finalStep()] : [0, trackLengthRef.current - 1] 
        //     ))
        // }
    };

    function keyup(e: KeyboardEvent): void {
        let char = e.key.toLowerCase();
        // colocar o condicional pra ver se não tem foco em um input box
        // if (Object.keys(keyDict).includes(char)) {
        //     if (e.repeat) { return }
        //     let index = (activePageRef.current + 1) * keyDict[char];
        //     if (index <= selLenRef.current) {
        //         dispatchSelectStep(index);
        //     }
        // }
    };

    function keyboardOnClick(noteName: string): void {
        if (Tone.context.state !== "running") {
            Tone.start()
            Tone.context.resume();
            // Tone.context.latencyHint
            // Tone.context.latencyHint = "playback";
            // Tone.context.lookAhead = 0;
        }
        // toneRefs?.current[selectedTrack].instrument?.triggerAttackRelease('C3', '16n')
        if (selectedRef.current.length > 0) {
            dispatchSetNote(noteName);
        } else if (typeof patternNoteLength === 'string') {
            if (selectedInstrument === xolombrisxInstruments.NOISESYNTH) {
                // toneRefs?.current[selectedTrack].instrument?.triggerAttackRelease(patternNoteLength, patternNoteLength, activePatternObj.tracks[selectedTrack].velocity)
                let t: any = toneRefs?.current[selectedTrack].instrument
                t.triggerAttackRelease(patternNoteLength, undefined, activePatternObj.tracks[selectedTrack].velocity)
            } else if (selectedInstrument === xolombrisxInstruments.PLUCKSYNTH) {
                toneRefs?.current[selectedTrack].instrument?.triggerAttackRelease(patternNoteLength, patternNoteLength, undefined, activePatternObj.tracks[selectedTrack].velocity/127)
            } else if (selectedInstrument === xolombrisxInstruments.FMSYNTH || selectedInstrument === xolombrisxInstruments.AMSYNTH) {
                toneRefs?.current[selectedTrack].instrument?.triggerAttackRelease(noteName, patternNoteLength, undefined, activePatternObj.tracks[selectedTrack].velocity/127)
            } else {
                toneRefs?.current[selectedTrack].instrument?.triggerAttackRelease(noteName, patternNoteLength, undefined, activePatternObj.tracks[selectedTrack].velocity/127)
            }
        }
    }

    // const finalStep = () => {
    //     if ((activePageRef.current === 0 && trackLengthRef.current <= 16)
    //         || (activePageRef.current === 1 && trackLengthRef.current <= 32)
    //         || (activePageRef.current === 2 && trackLengthRef.current <= 48)
    //         || (activePageRef.current === 3 && trackLengthRef.current <= 64)
    //     ) {
    //         return trackLengthRef.current - 1
    //     } else if (activePageRef.current === 1 && trackLengthRef.current > 32) {
    //         return 31
    //     } else if (activePageRef.current === 2 && trackLengthRef.current > 48) {
    //         return 47
    //     } else {
    //         return 15
    //     }
    // };

    const lookup = (key: string) => {
        if (patterns[Number(key)]) return patterns[Number(key)].name;
        else return ''
    }

    const dispatchRenamePattern = (name: string) => {
        dispatch(renamePattern(activePattern, name));
    };

    useEffect(() => {
        if (newPatternRef.current) {
            const patternNumbers = Object.keys(patterns).map(k => Number(k))
            const maxn = Math.max(...patternNumbers);
            newPatternRef.current = false;
            dispatch(selectPattern(Math.max(...patternNumbers)))
        }
    }, [patternAmount, dispatch, patterns])

    return (
        <div className={styles.bottom}>
            <div className={styles.arrangerColumn}>
                <div className={styles.patterns}>
                    <Patterns
                        renamePattern={dispatchRenamePattern}
                        incDecOffset={dispatchIncDecOffset}
                        note={isNote}
                        // incDecVelocity={dispatchIncDecStepVelocity}
                        incDecVelocity={{
                            patternTrack: dispatchIncDecPTVelocity,
                            step: dispatchIncDecStepVelocity,
                        }}
                        incDecPatLength={dispatchIncDecPatLength}
                        incDecTrackLength={dispatchIncDecTrackLength}
                        activePattern={activePattern}
                        addPattern={dispatchAddPattern}
                        changePatternLength={dispatchChangePatternLength}
                        changeTrackLength={dispatchChangeTrackLength}
                        events={events}
                        patternLength={patternLength}
                        patternTrackVelocity={patternTrackVelocity}
                        removePattern={dispatchRemovePattern}
                        selectPattern={dispatchSelectPattern}
                        selected={selected}
                        patterns={patterns}
                        // selected={[1, 4]}
                        // setNoteLength={dispatchSetNoteLength}
                        trackLength={trackLength}
                    ></Patterns>
                </div>
            </div>
            <div className={styles.sequencerColumn}>
                <div className={styles.box}>
                    <div className={styles.border}>
                        <div className={styles.stepSequencer}>
                            <StepSequencer
                                // finalStep={finalStep}
                                selectStep={dispatchSelectStep}
                                // changePage={dispatchChangePage}
                                changePage={pageClickHandler}
                                activePattern={activePattern}
                                events={events}
                                length={trackLength}
                                page={activePage}
                                selected={selected}
                                selectedTrack={selectedTrack}
                            ></StepSequencer>
                        </div>
                        <div className={styles.keyInput}>
                            <InputKeys
                                setNoteLength={dispatchSetNoteLength}
                                setPatternNoteLength={dispatchSetPatternNoteLength}
                                patternNoteLength={patternNoteLength}
                                selected={selected}
                                events={events}
                                keyState={keys}
                                noteCallback={keyboardOnClick}
                                setNote={dispatchSetNote}>
                            </InputKeys>
                        </div>
                    </div>
                    {/* <Playground></Playground> */}
                </div>
            </div>
        </div>
        // <div>


        // </div>
    )
}

export default Sequencer;