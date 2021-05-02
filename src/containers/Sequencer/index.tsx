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
    deleteNotes, 
    deleteLocks,
    copyEvents,
    copyNotes,
    event,
} from '../../store/Sequencer';
import { incDecOffset, incDecPatLength, incDecTrackLength, incDecStepVelocity, renamePattern, setPatternTrackVelocity, incDecPTVelocity, cycleSteps } from '../../store/Sequencer/actions';
import { noteOff, noteOn, upOctaveKey, downOctaveKey, keyDict, noteDict, numberNoteDict } from '../../store/MidiInput';

import triggCtx from '../../context/triggState';

import { bisect, startEndRange, timeObjFromEvent } from '../../lib/utility';
import Tone from '../../lib/tone';
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

interface copySteps {
    steps: event[], 
    instrument?: xolombrisxInstruments
}

const Sequencer: FunctionComponent = () => {
    const ref_toneTriggObjCtx = useContext(triggCtx);
    const ref_toneTrkObjCtx = useContext(toneRefsContext);
    const dispatch = useDispatch()
    const ref_newPattern = useRef(false);
    const [isNote, setIsNote] = useState(false)

    const ref_copiedSteps = useRef<copySteps | null>(null)

    useEffect(() => {
        ref_copiedSteps.current = {
            steps: [],
            instrument: undefined,
        }
    }, [])

    function copySteps(newSteps: copySteps) {
        ref_copiedSteps.current = newSteps
    }


    // const [copiedSteps, copySteps] = useState<{steps: event[], instrument?: xolombrisxInstruments}>({
    //     steps: [],
    //     instrument: undefined,
    // })

    const isPlay = useSelector((state: RootState) => state.transport.present.isPlaying);
    const prev_isPlay = usePrevious(isPlay);
    const arrangerMode = useSelector((state: RootState) => state.arranger.present.mode);
    const counter = useSelector((state: RootState) => state.sequencer.present.counter);
    const isFollowing = useSelector((state: RootState) => state.arranger.present.following);
    const trackCount = useSelector((state: RootState) => state.track.present.trackCount)
    const pattAmount = useSelector((state: RootState) => Object.keys(state.sequencer.present.patterns).length)
    const MenuContext = useContext(menuContext);
    const DropdownContext = useContext(dropdownContext);

    const activePatt = useSelector((state: RootState) => state.sequencer.present.activePattern);
    const ref_activePatt = useRef(activePatt);
    useEffect(() => { ref_activePatt.current = activePatt }, [activePatt])


    const selectedTrk = useSelector((state: RootState) => state.track.present.selectedTrack)
    const ref_selectedTrk = useRef(selectedTrk);
    useEffect(() => {
        ref_selectedTrk.current = selectedTrk
    }, [selectedTrk])

    const voice = useSelector((state: RootState) => state.track.present.tracks[selectedTrk].instrument)
    const ref_voice = useRef(voice)
    useEffect(() => {
        ref_voice.current = voice
    }, [voice])

    const selectedSteps = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrk].selected);
    const ref_selectedSteps = useRef(selectedSteps);
    useEffect(() => { ref_selectedSteps.current = selectedSteps }, [selectedSteps])

    // const selectedStepsLen = selectedSteps.length
    // const ref_selectedStepsLen = useRef(selectedStepsLen);
    // useEffect(() => { ref_selectedStepsLen.current = selectedStepsLen }, [selectedStepsLen])


    const pattTrkVelocity = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrk].velocity);

    const activePage = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrk].page);
    const ref_activePage = useRef(activePage);
    useEffect(() => { ref_activePage.current = activePage }, [activePage])

    const keyboardRange = useSelector((state: RootState) => state.midi.onboardRange);
    const keyboardRangeRef = useRef(keyboardRange)
    useEffect(() => { keyboardRangeRef.current = keyboardRange }, [keyboardRange])

    const patterns = useSelector((state: RootState) => state.sequencer.present.patterns);

    const patternLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].patternLength)
    const patternNoteLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrk].noteLength)
    const trackLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrk].length)

    const trackLengthRef = useRef(trackLength)
    useEffect(() => {
        trackLengthRef.current = trackLength;
    }, [trackLength])

    const events = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrk].events);
    const eventsRef = useRef(events);

    useEffect(() => {
        eventsRef.current = events;
    }, [events])

    const activePatternObj = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt])

    const selectedDevice = useSelector((state: RootState) => {
        if (state.track.present.tracks[selectedTrk].midi.device
            && state.track.present.tracks[selectedTrk].midi.channel
        ) return state.track.present.tracks[selectedTrk].midi.device
        else return undefined;
    })

    // probably will have to change type
    const controller_keys = useSelector((state: RootState) => {
        // return selectedDevice ? state.midi.devices[selectedDevice] : false
        // if (selectedDevice) {
        //     return state.midi.devices[selectedDevice]
        // }
        return state.midi.devices.onboardKey;
    });


    const dispatchRemovePattern = (): void => {
        dispatch(removePattern(activePatt))
        triggEmitter.emit(triggEventTypes.REMOVE_PATTERN, { pattern: activePatt });
    };

    const dispatchDuplicatePattern = (): void => {
        triggEmitter.emit(triggEventTypes.DUPLICATE_PATTERN, { pattern: activePatt })
        dispatch(duplicatePattern(activePatt));
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
        ref_newPattern.current = true;
    }, [
        dispatch,
        counter
    ]);

    const dispatchChangeTrackLength = (
        newLength: number,
    ): void => {
        if (newLength <= 64 && newLength >= 1) {
            const nl = bbsFromSixteenth(newLength)
            ref_toneTriggObjCtx.current[activePatt][selectedTrk].instrument.loopEnd = nl;
            let i = 0;
            // while (i < 4) {
            while (i < ref_toneTriggObjCtx.current[activePatt][selectedTrk].effects.length) {
                ref_toneTriggObjCtx.current[activePatt][selectedTrk].effects[i].loopEnd = nl;
                i++
            }
            dispatch(changeTrackLength(activePatt, selectedTrk, newLength));
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
            dispatch(changePatternLength(activePatt, newLength))
        }
    }, [activePatt, dispatch]);

    const dispatchIncDecPatLength = useCallback((
        amount: number
    ) => {
        dispatch(incDecPatLength(amount, activePatt))
    }, [activePatt, dispatch])

    const dispatchIncDecTrackLength = useCallback((
        amount: number
    ) => {
        dispatch(incDecTrackLength(amount, activePatt, selectedTrk))
    }, [activePatt, dispatch, selectedTrk])

    // const dispatchSelectPattern = (e: ChangeEvent<HTMLInputElement>): void => {
    const dispatchSelectPattern = (key: string): void => {
        // e.preventDefault();
        // let nextPattern: number = e.currentTarget.valueAsNumber;
        let nextPattern: number = Number(key);
        let loopEnd = patterns[nextPattern].patternLength;

        if (Tone.Transport.state === "started" && arrangerMode === 'pattern') {

            [...Array(trackCount).keys()].forEach(track => {
                ref_toneTriggObjCtx.current[activePatt][track].instrument.stop(0);
                ref_toneTriggObjCtx.current[nextPattern][track].instrument.start(0)
                const l = ref_toneTriggObjCtx.current[activePatt][track].effects.length
                for (let j = 0; j < l; j++) {
                    ref_toneTriggObjCtx.current[activePatt][track].effects[j].stop(0);
                    ref_toneTriggObjCtx.current[nextPattern][track].effects[j].start(0)
                }

                Tone.Transport.scheduleOnce(() => {
                    Tone.Transport.loopEnd = bbsFromSixteenth(loopEnd);
                    ref_toneTriggObjCtx.current[ref_activePatt.current][track].instrument.mute = true;
                    ref_toneTriggObjCtx.current[nextPattern][track].instrument.mute = false;
                    const l = ref_toneTriggObjCtx.current[activePatt][track].effects.length
                    for (let j = 0; j < l; j++) {
                        ref_toneTriggObjCtx.current[ref_activePatt.current][track].effects[j].mute = true;
                        ref_toneTriggObjCtx.current[nextPattern][track].effects[j].mute = false;
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
                ref_toneTriggObjCtx.current[activePatt][track].instrument.stop();
                const l = ref_toneTriggObjCtx.current[activePatt][track].effects.length
                for (let j = 0; j < l; j++) {
                    ref_toneTriggObjCtx.current[activePatt][track].effects[j].stop();
                }
            });
        }
        dispatch(selectPattern(nextPattern));
    };

    const dispatchChangePatternName = useCallback((name: string): void => {
        dispatch(
            changePatternName(
                activePatt,
                name
            )
        );
    }, [activePatt, dispatch]);

    const dispatchChangePage = useCallback((pageIndex: number): void => {
        dispatch(
            changePage(
                activePatt,
                selectedTrk,
                pageIndex
            )
        );
    }, [dispatch, activePatt, selectedTrk]);

    const pageClickHandler = useCallback((e: MouseEvent, pageIndex: number): void => {
        if (e.shiftKey) {
            console.log('should be mimicking and dispatching select steps')
            mimicSelectedFromTo(ref_activePage.current, pageIndex)
        } else {
            dispatchChangePage(pageIndex)
        }
    }, [dispatchChangePage, ref_activePage])

    const mimicSelectedFromTo = (from: number, to: number) => {
        if (from === to) return;

        const v: number[] = []
        const r = [from * 16, from * 16 + 15]
        ref_selectedSteps.current.forEach(i => {
            if (i >= r[0] && i <= r[1]) v.push(i - 16*from);
        })
        v.forEach(value => {
            dispatch(selectStep(ref_activePatt.current, ref_selectedTrk.current, to*16 + value))
        })
    }

    const dispatchSetOffset = (offset: number): void => {
        ref_selectedSteps.current.forEach(step => {
                dispatch(
                    setOffset(
                        activePatt,
                        selectedTrk,
                        step,
                        offset
                    )
                );
            }
        )
    };

    const dispatchSetNote = (note: string): void => {
        ref_selectedSteps.current.forEach(s => {
            dispatch(
                setNote(
                    activePatt,
                    selectedTrk,
                    note,
                    s
                )
            );
        });
    };

    const dispatchSetPatternNoteLength = (length: string) => {
        const d = length === '###PT' ? undefined : length
        if (selectedSteps.length === 0) {
            dispatch(
                setPatternNoteLength(
                    activePatt,
                    d,
                    selectedTrk
                )
            );
        } else {
            dispatchSetNoteLength(d)
        }
    };

    const dispatchSetNoteLength = (noteLength: number | string | undefined): void => {
        ref_selectedSteps.current.forEach(step => {
            dispatch(
                setNoteLength(
                    activePatt,
                    selectedTrk,
                    noteLength ? noteLength : 0,
                    step
                )
            );
        });
    };

    const dispatchDeleteEvents = (): void => {
        if (ref_selectedSteps.current.length >= 1) {
            ref_selectedSteps.current.forEach(step => {

                // first remove events from instrument triggs
                // but it will actually be remove in the 
                // step component ??
                // keep the coded comment in here just in case 
                // let stepEvent = { 
                //     ...activePatternObj
                //     .tracks[selectedTrack]
                //     .events[step] 
                // }
                // let time = timeObjFromEvent(step, stepEvent)
                // triggRef.current[activePattern][selectedTrack]
                // .instrument.remove(time);

                //     // then remove for effect triggs
                // const l = triggRef.current[activePattern][selectedTrack]
                // .effects.length
                // for (let j = 0; j < l; j++) {
                //     triggRef.current[activePattern][selectedTrack]
                //     .effects[j].remove(time);
                // }

                // delete events from store
                dispatch(
                    deleteEvents(
                        ref_activePatt.current,
                        ref_selectedTrk.current,
                        step
                    )
                );
            });
        }
    };

    const dispatchDeleteNotes = (): void => {
        if (ref_selectedSteps.current.length >= 1) {
            ref_selectedSteps.current.forEach(step => {
                dispatch(deleteNotes(
                    ref_activePatt.current,
                    ref_selectedTrk.current,
                    step
                ))
            })
        }
    }

    const dispatchDeleteLocks = (): void => {
        if (ref_selectedSteps.current.length >= 1) {
            ref_selectedSteps.current.forEach(step => {
                dispatch(deleteLocks(
                    ref_activePatt.current,
                    ref_selectedTrk.current,
                    step
                ))
            })
        }
    }

    const dispatchSetVelocity = (velocity: number): void => {
        ref_selectedSteps.current.forEach(s => {
            dispatch(
                setVelocity(
                    activePatt,
                    selectedTrk,
                    s,
                    velocity
                )
            );
        });
    };

    const dispatchSetPatternTrackVelocity = (velocity: number): void => {
        dispatch(
            setPatternTrackVelocity(
                activePatt,
                selectedTrk,
                velocity
            )
        );
    };

    const dispatchSelectStep = (index: number): void => {
        dispatch(
            selectStep(
                activePatt,
                selectedTrk,
                index
            )
        );
    };

    const dispatchIncDecStepVelocity = (amount: number): void => {
        // if (selected.length > 0) {
            selectedSteps.forEach(step => {
                dispatch(
                    incDecStepVelocity(
                        amount, 
                        activePatt, 
                        selectedTrk, 
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
            activePatt,
            selectedTrk,
        )) 
    }

    const dispatchIncDecOffset = (amount: number): void => {
        ref_selectedSteps.current.forEach(step => {
            dispatch(
                incDecOffset(amount, activePatt, selectedTrk, step)
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

    // keyboardevent checkers and helpers 
    function shouldSelectStep(e: KeyboardEvent, char: string){
        // using isNan because keyDict[char] maps to 0
        return !e.shiftKey 
            && !e.ctrlKey
            && !Number.isNaN(Number(keyDict[char]))
        
    }

    function shouldDecreaseOffset(e: KeyboardEvent, char: string): boolean {
        return !e.ctrlKey
            && char === 'arrowleft' 
            && ref_selectedSteps.current.length >= 1
    }

    function shouldIncreaseOffset(e: KeyboardEvent, char: string): boolean {
        return !e.ctrlKey
        && char === 'arrowright' 
        && ref_selectedSteps.current.length >= 1
    }

    function shouldIncreaseDecrease(e: KeyboardEvent, char: string): number {
        if (shouldIncreaseOffset(e, char))
            return e.shiftKey ? 10 : 1
        else if (shouldDecreaseOffset(e, char))
            return e.shiftKey ? -10 : -1
        else 
            return 0
    }

    function shouldPlayNote(e: KeyboardEvent, char: string): boolean | string {
        return !e.shiftKey 
            && !e.ctrlKey
            && numberNoteDict[noteDict[char]]
    }

    function shouldDelete(e: KeyboardEvent, char: string): boolean {
        return ['delete', 'bakcspace'].includes(char)
    }

    function shouldTogglePatternUI(e: KeyboardEvent, char: string): boolean {
        return !e.shiftKey && !e.ctrlKey && char === '`'
    }

    function shouldEscape(e: KeyboardEvent, char: string): boolean {
        return !e.shiftKey && !e.ctrlKey && char === 'escape'
    }
    
    function shouldCopy(e: KeyboardEvent, char: string): boolean {
        return !e.shiftKey && e.ctrlKey &&  char === 'c'
    }

    function shouldPaste(e: KeyboardEvent, char: string): boolean | null {
        return !e.shiftKey 
            && e.ctrlKey 
            && char === 'v' 
            && ref_copiedSteps.current 
            && ref_copiedSteps.current?.steps.length > 0
    }

    function shouldCopyEventsOrNotes() {
        return ref_copiedSteps.current?.instrument === ref_voice.current
    }

    // sequencer keyboard shortcuts 
    function keydown(this: Document, e: KeyboardEvent): void {
        
        let char: string = e.key.toLowerCase();
        // console.log('keydown, char is:', char)

        // select steps a-l and z-m
        if (shouldSelectStep(e, char)) {
            if (e.repeat) { return }
            let index: number = (ref_activePage.current + 1) * keyDict[char];
            if (index <= trackLength) 
                dispatch(selectStep(
                    ref_activePatt.current, 
                    ref_selectedTrk.current, 
                    index
                ));
        } 
        
        // increase/decrease offset with arrow keys
        const amount = shouldIncreaseDecrease(e, char)
        if (amount)
            dispatchIncDecOffset(amount)
        

        // delete events with backspace and delete 
        if (shouldDelete(e, char)) {
            if (e.shiftKey && !e.ctrlKey)
                dispatchDeleteNotes()
            else if (e.ctrlKey && !e.shiftKey)
                dispatchDeleteLocks()
            else 
                dispatchDeleteEvents();
        } 
        
        // increase decrease keyboard octave range
        // with 1 and 0
        if (keyFunctions[char]) {
            keyFunctions[char]()
        } 
        
        // keyboard note from q2 to i
        if (shouldPlayNote(e, char)) {
            const noteName = numberNoteDict[noteDict[char]] 
                + String(keyboardRangeRef.current)
            // console.log('notename', noteName);
        } 
        
        // toggle between pattern and notes with `
        if (shouldTogglePatternUI(e, char)) {
            setIsNote(state => !state)
        } 

        // escape dropdowns and menus 
        // and unselect steps with esc
        // if (!e.shiftKey && char === 'escape') {
        if (shouldEscape(e, char)) {

            if (MenuContext.current.length > 0)
                MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})

            else if (Object.keys(DropdownContext.current).length > 0) 
                DropdownEmitter.emit(dropdownEventTypes.ESCAPE, {})

            else if (ref_selectedSteps.current.length > 0) 
                dispatch(
                    selectStep(
                        ref_activePatt.current, 
                        ref_selectedTrk.current, 
                        -1
                    )
                )
        } 

        // cycle steps
        const dir = getDirection(e, char)
        if (dir) {
            const pageInit = ref_activePage.current * 16
            const stepAmount = trackLengthRef.current - pageInit
            const finalStep = pageInit + Math.min(16, stepAmount) - 1

            dispatch(cycleSteps(
                dir,
                ref_activePatt.current,
                ref_selectedTrk.current,
                e.ctrlKey 
                    ? [ref_activePage.current*16, finalStep] 
                    : [0, trackLengthRef.current - 1] 
            ))
        }

        // copy events or steps 
        if (shouldCopy(e, char)){
            console.log('should copy')
            const ev = ref_selectedSteps.current
            .map(step => eventsRef.current[step])

            copySteps({
                instrument: ref_voice.current,
                steps: ev
            })

        } 
        
        if (shouldPaste(e, char)){

            if (shouldCopyEventsOrNotes())
                dispatch(copyEvents(
                    ref_activePatt.current,
                    ref_selectedTrk.current, 
                    ref_copiedSteps.current?.steps
                ))
            else 
                dispatch(copyNotes(
                    ref_activePatt.current,
                    ref_selectedTrk.current, 
                    ref_copiedSteps.current?.steps
                ))
            
        }
    };


    function getDirection(e: KeyboardEvent, char:string) {
        return e.shiftKey && char === 'c'
            ? -1
            : e.shiftKey && char === 'v'
            ? 1
            : 0
    }

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
        if (ref_selectedSteps.current.length > 0) {
            dispatchSetNote(noteName);
        } else if (typeof patternNoteLength === 'string') {
            if (voice === xolombrisxInstruments.NOISESYNTH) {
                // toneRefs?.current[selectedTrack].instrument?.triggerAttackRelease(patternNoteLength, patternNoteLength, activePatternObj.tracks[selectedTrack].velocity)
                let t: any = ref_toneTrkObjCtx?.current[selectedTrk].instrument
                t.triggerAttackRelease(patternNoteLength, undefined, activePatternObj.tracks[selectedTrk].velocity)
            } else if (voice === xolombrisxInstruments.PLUCKSYNTH) {
                ref_toneTrkObjCtx?.current[selectedTrk].instrument?.triggerAttackRelease(patternNoteLength, patternNoteLength, undefined, activePatternObj.tracks[selectedTrk].velocity/127)
            } else if (voice === xolombrisxInstruments.FMSYNTH || voice === xolombrisxInstruments.AMSYNTH) {
                ref_toneTrkObjCtx?.current[selectedTrk].instrument?.triggerAttackRelease(noteName, patternNoteLength, undefined, activePatternObj.tracks[selectedTrk].velocity/127)
            } else {
                ref_toneTrkObjCtx?.current[selectedTrk].instrument?.triggerAttackRelease(noteName, patternNoteLength, undefined, activePatternObj.tracks[selectedTrk].velocity/127)
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
        dispatch(renamePattern(activePatt, name));
    };

    useEffect(() => {
        if (ref_newPattern.current) {
            const patternNumbers = Object.keys(patterns).map(k => Number(k))
            ref_newPattern.current = false;
            dispatch(selectPattern(Math.max(...patternNumbers)))
        }
    }, [pattAmount, dispatch, patterns])

    return (
        <div className={styles.bottom}>
            <div className={styles.arrangerColumn}>
                <div className={styles.patterns}>
                    <Patterns
                        renamePattern={dispatchRenamePattern}
                        incDecOffset={dispatchIncDecOffset}
                        note={isNote}
                        setOffset={dispatchSetOffset}
                        setVelocity={{
                            pattTrk: dispatchSetPatternTrackVelocity,
                            step: dispatchSetVelocity,
                        }}
                        // incDecVelocity={dispatchIncDecStepVelocity}
                        incDecVelocity={{
                            patternTrack: dispatchIncDecPTVelocity,
                            step: dispatchIncDecStepVelocity,
                        }}
                        incDecPatLength={dispatchIncDecPatLength}
                        incDecTrackLength={dispatchIncDecTrackLength}
                        activePattern={activePatt}
                        addPattern={dispatchAddPattern}
                        changePatternLength={dispatchChangePatternLength}
                        changeTrackLength={dispatchChangeTrackLength}
                        events={events}
                        patternLength={patternLength}
                        patternTrackVelocity={pattTrkVelocity}
                        removePattern={dispatchRemovePattern}
                        selectPattern={dispatchSelectPattern}
                        selected={selectedSteps}
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
                                activePattern={activePatt}
                                events={events}
                                length={trackLength}
                                page={activePage}
                                selected={selectedSteps}
                                selectedTrack={selectedTrk}
                            ></StepSequencer>
                        </div>
                        <div className={styles.keyInput}>
                            <InputKeys
                                setNoteLength={dispatchSetNoteLength}
                                setPatternNoteLength={dispatchSetPatternNoteLength}
                                patternNoteLength={patternNoteLength}
                                selected={selectedSteps}
                                events={events}
                                keyState={controller_keys}
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