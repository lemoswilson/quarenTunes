import React, {
    useEffect,
    useContext,
    FunctionComponent,
    useState,
    useRef,
    KeyboardEvent as kEvent,
    useCallback, RefObject, MouseEvent, MutableRefObject
} from 'react';
import useQuickRef from '../../hooks/useQuickRef';
import usePrevious from '../../hooks/usePrevious';
import { useSelector, useDispatch } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import {
    addPattern,
    changePage,
    changePatternLength,
    selectStepsBatch,
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
import { upOctaveKey, downOctaveKey, keyDict, noteDict, numberNoteDict } from '../../store/MidiInput';


// import Tone from '../../lib/tone';
// import * as Tone from 'tone';
import triggEmitter, { triggEventTypes } from '../../lib/triggEmitter';
import MenuEmitter, { menuEmitterEventTypes } from '../../lib/MenuEmitter';
import DropdownEmitter, { dropdownEventTypes } from '../../lib/dropdownEmitter';

import StepSequencer from '../../components/StepSequencer';
import Patterns from '../../components/Patterns/Patterns';
import InputKeys from '../../components/Layout/InputKeys';

import { bbsFromSixteenth } from '../Arranger'
import { RootState } from '../Xolombrisx';

import styles from './style.module.scss';
import { xolombrisxInstruments } from '../../store/Track';

import ToneObjectsContext from '../../context/ToneObjectsContext';
import ToneContext from '../../context/ToneContext';
import menuContext from '../../context/MenuContext';
import dropdownContext from '../../context/DropdownContext';

interface copySteps {
    steps: event[], 
    instrument?: xolombrisxInstruments
}

const Sequencer: FunctionComponent = () => {
    const dispatch = useDispatch()
    const ref_toneObjects = useContext(ToneObjectsContext);
    const ref_newPattern = useRef(false);
    const [isNote, setIsNote] = useState(false)
    const Tone = useContext(ToneContext);
    const patternQueue: MutableRefObject<number[] | null> = useRef(null)

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


    const arrangerMode = useSelector((state: RootState) => state.arranger.present.mode);
    const counter = useSelector((state: RootState) => state.sequencer.present.counter);
    const trackCount = useSelector((state: RootState) => state.track.present.trackCount)
    const MenuContext = useContext(menuContext);
    const DropdownContext = useContext(dropdownContext);

    const activePatt = useSelector((state: RootState) => state.sequencer.present.activePattern);
    const ref_activePatt = useRef(activePatt);
    useEffect(() => { ref_activePatt.current = activePatt }, [activePatt])


    const selectedTrkIndex = useSelector((state: RootState) => state.track.present.selectedTrack)
    const ref_selectedTrkIndex = useRef(selectedTrkIndex);
    useEffect(() => {
        ref_selectedTrkIndex.current = selectedTrkIndex
    }, [selectedTrkIndex])


    const voice = useSelector((state: RootState) => state.track.present.tracks[selectedTrkIndex].instrument)
    const ref_voice = useRef(voice)
    useEffect(() => {
        ref_voice.current = voice
    }, [voice])

    const selectedSteps = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIndex].selected);
    const ref_selectedSteps = useRef(selectedSteps);
    useEffect(() => { ref_selectedSteps.current = selectedSteps }, [selectedSteps])

    const pattTrkVelocity = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIndex].velocity);

    const activePage = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIndex].page);
    const ref_activePage = useRef(activePage);
    useEffect(() => { ref_activePage.current = activePage }, [activePage])

    const keyboardRange = useSelector((state: RootState) => state.midi.onboardRange);
    const keyboardRangeRef = useRef(keyboardRange)
    useEffect(() => { keyboardRangeRef.current = keyboardRange }, [keyboardRange])

    const patterns = useSelector((state: RootState) => state.sequencer.present.patterns);

    const patternLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].patternLength)
    const patternNoteLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIndex].noteLength)
    const trackLen = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIndex].length)
    const ref_trackLen = useRef(trackLen)
    useEffect(() => {
        ref_trackLen.current = trackLen;
    }, [trackLen])

    const events = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIndex].events);
    const eventsRef = useRef(events);

    useEffect(() => {
        eventsRef.current = events;
    }, [events])

    const activePatternObj = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt])

    const selectedDevice = useSelector((state: RootState) => {
        return state.track.present.tracks[selectedTrkIndex].midi.device
    })

    const selectedChannel = useSelector((state: RootState) => {
        return state.track.present.tracks[selectedTrkIndex].midi.channel
    })

    // probably will have to change type
    const controller_keys = useSelector((state: RootState) => {
        return (selectedDevice && !Number.isNaN(Number(selectedChannel))) 
            ? state.midi.devices[selectedDevice][Number(selectedChannel)] 
            : (selectedDevice === 'onboardKey' && selectedChannel === 'all') 
            ? state.midi.devices[selectedDevice]['all']
            : false
    });


    const _removePatt = (): void => {
        dispatch(removePattern(activePatt))
        triggEmitter.emit(triggEventTypes.REMOVE_PATTERN, { pattern: activePatt });
    };

    const _duplicatePatt = (): void => {
        triggEmitter.emit(triggEventTypes.DUPLICATE_PATTERN, { pattern: activePatt })
        dispatch(duplicatePattern(activePatt));
    };

    const _toggleOverride = (): void => {
        dispatch(toggleOverride());
    };

    const _toggleRecordingQuantization = (): void => {
        dispatch(toggleRecordingQuantization());
    };

    const _addPatt = useCallback(() => {
        triggEmitter.emit(triggEventTypes.ADD_PATTERN, { pattern: counter })
        dispatch(addPattern());
        ref_newPattern.current = true;
    }, [
        dispatch,
        counter
    ]);

    const _changeTrkLength = (
        newLength: number,
    ): void => {
        if (newLength <= 64 && newLength >= 1) {
            if (ref_toneObjects.current) {

                const nl = bbsFromSixteenth(newLength)
                ref_toneObjects.current.patterns[activePatt][selectedTrkIndex].instrument.loopEnd = nl;
                let i = 0;
                // while (i < 4) {
                while (i < ref_toneObjects.current.patterns[activePatt][selectedTrkIndex].effects.length) {
                    ref_toneObjects.current.patterns[activePatt][selectedTrkIndex].effects[i].loopEnd = nl;
                    i++
                }
                dispatch(changeTrackLength(activePatt, selectedTrkIndex, newLength));
            }
        }
    };

    useEffect(() => {
        if (arrangerMode === "pattern") {
            Tone.Transport.loopEnd = patternLength;
        }
    }, [arrangerMode, patternLength])

    const _changePattLen = useCallback((newLength: number): void => {
        if (newLength >= 1) {
            dispatch(changePatternLength(activePatt, newLength))
        }
    }, [activePatt, dispatch]);

    const _incDecPattLen = useCallback((amount: number) => {
        dispatch(incDecPatLength(amount, activePatt))
    }, [activePatt, dispatch])

    const _incDecTrkLen = useCallback((amount: number) => {
        dispatch(incDecTrackLength(amount, activePatt, selectedTrkIndex))
    }, [activePatt, dispatch, selectedTrkIndex])

    // const dispatchSelectPattern = (e: ChangeEvent<HTMLInputElement>): void => {
    const _selectPatt = (key: string): void => {
        // e.preventDefault();
        // let nextPattern: number = e.currentTarget.valueAsNumber;
        let nextPattern: number = Number(key);
        let loopEnd = patterns[nextPattern].patternLength;
        let currPatt = activePatt;
        if (Tone.Transport.state === "started" && arrangerMode === 'pattern') {

            // if transport is active and pattern mode selected, this should queue
            // the pattern to start looping at 
            if (patternQueue.current && patternQueue.current.length > 0) {
                currPatt = patternQueue.current[0]
                patternQueue.current.pop()
            } else if (patternQueue.current && patternQueue.current.length === 0){
                patternQueue.current.push(currPatt)
            }

            [...Array(trackCount).keys()].forEach((_, track, arr) => {
                ref_toneObjects.current?.patterns[currPatt][track].instrument.stop(0);
                ref_toneObjects.current?.patterns[nextPattern][track].instrument.start(0)
                let l = ref_toneObjects.current?.patterns[currPatt][track].effects.length
                l = l ? l : 0 
                for (let j = 0; j < l; j++) {
                    ref_toneObjects.current?.patterns[currPatt][track].effects[j].stop(0);
                    ref_toneObjects.current?.patterns[nextPattern][track].effects[j].start(0)
                }

                Tone.Transport.scheduleOnce(() => {
                    Tone.Transport.loopEnd = bbsFromSixteenth(loopEnd);
                    if (ref_toneObjects.current){
                        ref_toneObjects.current.patterns[currPatt][track].instrument.mute = true;
                        ref_toneObjects.current.patterns[nextPattern][track].instrument.mute = false;
                        const l = ref_toneObjects.current.patterns[currPatt][track].effects.length
                        for (let j = 0; j < l; j++) {
                            ref_toneObjects.current.patterns[currPatt][track].effects[j].mute = true;
                            ref_toneObjects.current.patterns[nextPattern][track].effects[j].mute = false;
                        }
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
            [...Array(trackCount).keys()].forEach((_, track, __) => {
                ref_toneObjects.current?.patterns[activePatt][track].instrument.stop();
                let l = ref_toneObjects.current?.patterns[activePatt][track].effects.length
                l = l ? l : 0
                for (let j = 0; j < l; j++) {
                    ref_toneObjects.current?.patterns[activePatt][track].effects[j].stop();
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
                selectedTrkIndex,
                pageIndex
            )
        );
    }, [dispatch, activePatt, selectedTrkIndex]);

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
            dispatch(selectStep(ref_activePatt.current, ref_selectedTrkIndex.current, to*16 + value))
        })
    }

    const dispatchSetOffset = (offset: number): void => {
        ref_selectedSteps.current.forEach(step => {
                dispatch(
                    setOffset(
                        activePatt,
                        selectedTrkIndex,
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
                    selectedTrkIndex,
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
                    selectedTrkIndex
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
                    selectedTrkIndex,
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
                        ref_selectedTrkIndex.current,
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
                    ref_selectedTrkIndex.current,
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
                    ref_selectedTrkIndex.current,
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
                    selectedTrkIndex,
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
                selectedTrkIndex,
                velocity
            )
        );
    };

    const dispatchSelectStep = (index: number): void => {
        dispatch(
            selectStep(
                activePatt,
                selectedTrkIndex,
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
                        selectedTrkIndex, 
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
            selectedTrkIndex,
        )) 
    }

    const dispatchIncDecOffset = (amount: number): void => {
        ref_selectedSteps.current.forEach(step => {
            dispatch(
                incDecOffset(amount, activePatt, selectedTrkIndex, step)
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

    function getFinalStep(){
        const pageInit = ref_activePage.current * 16
        const stepAmount = ref_trackLen.current - pageInit
        const finalStep = pageInit + Math.min(16, stepAmount) - 1
        return finalStep
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

    function shouldSelectEvery(e: KeyboardEvent): number {
        const code = e.keyCode;
        return e.shiftKey && code <= 57 && code >= 49 ? code - 48 : 0
    }


    // sequencer keyboard shortcuts 
    function keydown(this: Document, e: KeyboardEvent): void {
        
        let char: string = e.key.toLowerCase();
        // console.log('keydown, char is:', char)

        // select steps a-l and z-m
        if (shouldSelectStep(e, char)) {
            if (e.repeat) { return }
            let index: number = (ref_activePage.current + 1) * keyDict[char];
            if (index <= trackLen) 
                dispatch(selectStep(
                    ref_activePatt.current, 
                    ref_selectedTrkIndex.current, 
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
            return
        } 
        
        // increase decrease keyboard octave range
        // with 1 and 0
        if (keyFunctions[char]) {
            keyFunctions[char]()
            return
        } 
        
        // keyboard note from q2 to i
        if (shouldPlayNote(e, char)) {
            const noteName = numberNoteDict[noteDict[char]] 
                + String(keyboardRangeRef.current)
            return
            // console.log('notename', noteName);
        } 
        
        // toggle between pattern and notes with `
        if (shouldTogglePatternUI(e, char)) {
            setIsNote(state => !state)
            return
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
                        ref_selectedTrkIndex.current, 
                        -1
                    )
                )
            return
        } 

        // cycle steps
        const dir = getDirection(e, char)
        if (dir) {
            const finalStep = getFinalStep()
            // const pageInit = ref_activePage.current * 16
            // const stepAmount = ref_trackLen.current - pageInit
            // const finalStep = pageInit + Math.min(16, stepAmount) - 1

            dispatch(cycleSteps(
                dir,
                ref_activePatt.current,
                ref_selectedTrkIndex.current,
                e.ctrlKey 
                    ? [ref_activePage.current*16, finalStep] 
                    : [0, ref_trackLen.current - 1] 
            ))
            return
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
            return
        } 
        
        if (shouldPaste(e, char)){

            if (shouldCopyEventsOrNotes())
                dispatch(copyEvents(
                    ref_activePatt.current,
                    ref_selectedTrkIndex.current, 
                    ref_copiedSteps.current?.steps
                ))
            else 
                dispatch(copyNotes(
                    ref_activePatt.current,
                    ref_selectedTrkIndex.current, 
                    ref_copiedSteps.current?.steps
                ))
            return
        }

        const num = shouldSelectEvery(e)
        if (num){
            const start = ref_activePage.current * 16 
            const finalStep =  getFinalStep() 
            for (let i = 0; start + i * num <= finalStep; i ++)
                dispatchSelectStep(start + i * num)
            return
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
        }

        // toneRefs?.current[selectedTrack].instrument?.triggerAttackRelease('C3', '16n')
        if (ref_selectedSteps.current.length > 0) {
            console.log('should be dispatching note')
            dispatchSetNote(noteName);
        } else if (typeof patternNoteLength === 'string') {
            if (voice === xolombrisxInstruments.NOISESYNTH) {
                // toneRefs?.current[selectedTrack].instrument?.triggerAttackRelease(patternNoteLength, patternNoteLength, activePatternObj.tracks[selectedTrack].velocity)
                let t: any = ref_toneObjects.current?.tracks[selectedTrkIndex].instrument
                console.log('trackIndex', selectedTrkIndex);
                // t.triggerAttackRelease(patternNoteLength, undefined, activePatternObj.tracks[ref_selectedTrkIndex.current].velocity)
                t.triggerAttackRelease(patternNoteLength)
            } else if (voice === xolombrisxInstruments.PLUCKSYNTH) {
                ref_toneObjects?.current?.tracks[selectedTrkIndex].instrument?.triggerAttackRelease(patternNoteLength, patternNoteLength, undefined, activePatternObj.tracks[selectedTrkIndex].velocity/127)
            } else if (voice === xolombrisxInstruments.FMSYNTH || voice === xolombrisxInstruments.AMSYNTH) {
                console.log('should be playing note with fm or am synth');
                ref_toneObjects.current?.tracks[selectedTrkIndex].instrument?.connect(ref_toneObjects.current?.tracks[selectedTrkIndex].chain.in)
                ref_toneObjects.current?.tracks[selectedTrkIndex].instrument?.triggerAttackRelease(noteName, patternNoteLength, undefined, activePatternObj.tracks[selectedTrkIndex].velocity/127)
            } else {
                ref_toneObjects.current?.tracks[selectedTrkIndex].instrument?.triggerAttackRelease(noteName, patternNoteLength, undefined, activePatternObj.tracks[selectedTrkIndex].velocity/127)
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
    }, [ dispatch, patterns])

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
                        incDecPatLength={_incDecPattLen}
                        incDecTrackLength={_incDecTrkLen}
                        activePattern={activePatt}
                        addPattern={_addPatt}
                        changePatternLength={_changePattLen}
                        changeTrackLength={_changeTrkLength}
                        events={events}
                        patternLength={patternLength}
                        patternTrackVelocity={pattTrkVelocity}
                        removePattern={_removePatt}
                        selectPattern={_selectPatt}
                        selected={selectedSteps}
                        patterns={patterns}
                        // selected={[1, 4]}
                        // setNoteLength={dispatchSetNoteLength}
                        trackLength={trackLen}
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
                                length={trackLen}
                                page={activePage}
                                selected={selectedSteps}
                                selectedTrack={selectedTrkIndex}
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