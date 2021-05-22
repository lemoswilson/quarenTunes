import React, {
    useEffect,
    useContext,
    FunctionComponent,
    useState,
    useRef,
    KeyboardEvent as kEvent,
} from 'react';
import  { useVoiceSelector, useTrkInfoSelector } from '../../hooks/store/useTrackSelector'
import { useSelector, useDispatch } from 'react-redux';
import {
    selectStep,
    cycleSteps, 
    copyEvents,
    copyNotes,
    event,
} from '../../store/Sequencer';
import { activeSongPattSelector, isFollowSelector, arrgModeSelector } from '../../store/Arranger/selectors';
import { isPlaySelector } from '../../store/Transport/selectors';
import { upOctaveKey, downOctaveKey, keyDict, noteDict, numberNoteDict } from '../../store/MidiInput';


import * as Tone from 'tone';
import MenuEmitter, { menuEmitterEventTypes } from '../../lib/Emitters/MenuEmitter';
import DropdownEmitter, { dropdownEventTypes } from '../../lib/Emitters/dropdownEmitter';

import StepSequencer from '../../components/Layout/StepSequencer';
import Patterns from '../../components/Layout/Patterns/Patterns';
import InputKeys from '../../components/Layout/InputKeys';

import styles from './style.module.scss';
import { xolombrisxInstruments } from '../../store/Track';

import ToneObjectsContext from '../../context/ToneObjectsContext';
import menuContext from '../../context/MenuContext';
import dropdownContext from '../../context/DropdownContext';

import { getFinalStep as finalStep } from '../../lib/utility';
import { useActivePatt, useControllerKeys, useEvents, useLengthSelectors, useSelectedSteps } from '../../hooks/store/useSequencerSelectors';
import { useKeyboardRangeSelector } from '../../hooks/store/useMidiSelectors';
import { activeStepSelector, patternsSelector } from '../../store/Sequencer/selectors';
import { effectLengthsSelector } from '../../store/Track/selectors';
import useSequencerDispatchers from '../../hooks/store/useSequencerDispatchers';
import useSequencerScheduler from '../../hooks/useSequencerScheduler';

interface copySteps {
    steps: event[], 
    instrument?: xolombrisxInstruments
}

const Sequencer: FunctionComponent = () => {

    const dispatch = useDispatch()

    const [isNote, setIsNote] = useState(false)
    
    const MenuContext = useContext(menuContext);
    const DropdownContext = useContext(dropdownContext);
    const ref_toneObjects = useContext(ToneObjectsContext);
    
    const arrangerMode = useSelector(arrgModeSelector);
    const activeSongPattern = useSelector(activeSongPattSelector);
    const isFollow = useSelector(isFollowSelector);
    const isPlay = useSelector(isPlaySelector);

    const { 
        selectedTrkIdx, ref_selectedTrkIdx,
        activePage, ref_activePage,
        trkCount, ref_trkCount
    } 
    = useTrkInfoSelector()

    const { voice, ref_voice } = useVoiceSelector()
    const effectsLength = useSelector(effectLengthsSelector);
    
    const ref_keyboardRange = useKeyboardRangeSelector()
    const controller_keys = useControllerKeys(selectedTrkIdx)

    const activeStep = useSelector(activeStepSelector);
    const { activePatt, ref_activePatt, prev_activePatt } = useActivePatt()
    const { events, ref_events } = useEvents(activePatt, selectedTrkIdx);
    const { selectedSteps, ref_selectedSteps } = useSelectedSteps(activePatt, selectedTrkIdx)
    
    const patterns = useSelector(patternsSelector);
    const pattTrkVelocity = patterns[activePatt].tracks[selectedTrkIdx].velocity;
    const activePatternObj = patterns[activePatt];

    const { 
        activePattLen, 
        activePattTrkLen, 
        ref_activePattTrkLen, 
        activePattTrkNoteLen
    } 
    = useLengthSelectors(activePatt, selectedTrkIdx)
    
    const scheduleOrStop = useSequencerScheduler(
        ref_toneObjects,
        trkCount,
        ref_trkCount,
        ref_selectedTrkIdx,
        effectsLength,
        arrangerMode,
        patterns,
        activePatt,
        ref_activePatt,
        prev_activePatt,
        activePattLen,
        activePattTrkLen,
        isPlay
    )
    
    const {
        _removePatt,
        _addPatt,
        _selectPatt,
        _changeTrkLength,
        _changePattLen,
        _incDecPattLen,
        _incDecTrkLen,
        _incDecStepVelocity,
        _setOffset,
        _setNote,
        _setPattNoteLen,
        _setNoteLength,
        _deleteEvents,
        _deleteNotes,
        _deleteLocks,
        _setVelocity,
        _setPattTrkVelocity,
        _incDecPattTrkVelocity,
        _IncDecOffset,
        _selectStep,
        _renamePattern,
        pageClickHandler
    } 
    = useSequencerDispatchers(
        ref_toneObjects,
        patterns,
        activePatt,
        ref_activePatt,
        selectedSteps,
        ref_selectedSteps,
        ref_activePage,
        arrangerMode,
        isFollow,
        selectedTrkIdx,
        ref_selectedTrkIdx,
        ref_trkCount,
        effectsLength,
        scheduleOrStop
    )
    
    // keyboard shortcuts event listeners
    // activate when finished testing keyboard

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
        return finalStep(ref_activePage.current, ref_activePattTrkLen.current)
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
            if (index <= activePattTrkLen) 
                dispatch(selectStep(
                    ref_activePatt.current, 
                    ref_selectedTrkIdx.current, 
                    index
                ));
        } 
        
        // increase/decrease offset with arrow keys
        const amount = shouldIncreaseDecrease(e, char)
        if (amount)
            _IncDecOffset(amount)
        

        // delete events with backspace and delete 
        if (shouldDelete(e, char)) {
            if (e.shiftKey && !e.ctrlKey)
                _deleteNotes()
            else if (e.ctrlKey && !e.shiftKey)
                _deleteLocks()
            else 
                _deleteEvents();
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
                + String(ref_keyboardRange.current)
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
                        ref_selectedTrkIdx.current, 
                        -1
                    )
                )
            return
        } 

        // cycle steps
        const dir = getDirection(e, char)
        if (dir) {
            const finalStep = getFinalStep()
            dispatch(cycleSteps(
                dir,
                ref_activePatt.current,
                ref_selectedTrkIdx.current,
                e.ctrlKey 
                    ? [ref_activePage.current*16, finalStep] 
                    : [0, ref_activePattTrkLen.current - 1] 
            ))
            return
        }

        // copy events or steps 
        if (shouldCopy(e, char)){
            const ev = ref_selectedSteps.current
            .map(step => ref_events.current[step])

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
                    ref_selectedTrkIdx.current, 
                    ref_copiedSteps.current?.steps
                ))
            else 
                dispatch(copyNotes(
                    ref_activePatt.current,
                    ref_selectedTrkIdx.current, 
                    ref_copiedSteps.current?.steps
                ))
            return
        }

        const num = shouldSelectEvery(e)
        if (num){
            const start = ref_activePage.current * 16 
            const finalStep =  getFinalStep() 
            for (let i = 0; start + i * num <= finalStep; i ++)
                _selectStep(start + i * num)
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
    };

    function keyboardOnClick(noteName: string): void {
        if (Tone.context.state !== "running") {
            Tone.start()
            Tone.context.resume();
        }

        if (ref_selectedSteps.current.length > 0) {

            _setNote(noteName);
        } else if (typeof activePattTrkNoteLen === 'string') {
            if (voice === xolombrisxInstruments.NOISESYNTH) {

                let t: any = ref_toneObjects.current?.tracks[selectedTrkIdx].instrument
                t.triggerAttackRelease(activePattTrkNoteLen)

            } else if (voice === xolombrisxInstruments.FMSYNTH || voice === xolombrisxInstruments.AMSYNTH) {

                ref_toneObjects.current?.tracks[selectedTrkIdx].instrument?.triggerAttackRelease(noteName, activePattTrkNoteLen, undefined, activePatternObj.tracks[selectedTrkIdx].velocity/127)
            } else {

                ref_toneObjects.current?.tracks[selectedTrkIdx].instrument?.triggerAttackRelease(noteName, activePattTrkNoteLen, undefined, activePatternObj.tracks[selectedTrkIdx].velocity/127)
            }
        }
    }






    return (
        <div className={styles.bottom}>
            <div className={styles.arrangerColumn}>
                <div className={styles.patterns}>
                    <Patterns
                        isPlay={isPlay}
                        renamePattern={_renamePattern}
                        incDecOffset={_IncDecOffset}
                        note={isNote}

                        setOffset={_setOffset}

                        setVelocity={{
                            pattTrk: _setPattTrkVelocity,
                            step: _setVelocity,
                        }}

                        incDecVelocity={{
                            patternTrack: _incDecPattTrkVelocity,
                            step: _incDecStepVelocity,
                        }}

                        incDecPatLength={_incDecPattLen}
                        incDecTrackLength={_incDecTrkLen}
                        activePattern={activePatt}
                        addPattern={_addPatt}
                        changePatternLength={_changePattLen}
                        changeTrackLength={_changeTrkLength}
                        events={events}
                        patternLength={activePattLen}
                        patternTrackVelocity={pattTrkVelocity}
                        removePattern={_removePatt}
                        selectPattern={_selectPatt}
                        selected={selectedSteps}
                        patterns={patterns}
                        trackLength={activePattTrkLen}
                    ></Patterns>
                </div>
            </div>
            <div className={styles.sequencerColumn}>
                <div className={styles.box}>
                    <div className={styles.border}>
                        <div className={styles.stepSequencer}>
                            <StepSequencer
                                selectStep={_selectStep}
                                changePage={pageClickHandler}
                                activeSongPattern={activeSongPattern}
                                activePattern={activePatt}
                                events={events}
                                length={activePattTrkLen}
                                page={activePage}
                                selected={selectedSteps}
                                selectedTrack={selectedTrkIdx}
                                activeStep={activeStep}
                                arrgMode={arrangerMode}
                            ></StepSequencer>
                        </div>
                        <div className={styles.keyInput}>
                            <InputKeys
                                setNoteLength={_setNoteLength}
                                setPatternNoteLength={_setPattNoteLen}
                                patternNoteLength={activePattTrkNoteLen}
                                selected={selectedSteps}
                                events={events}
                                keyState={controller_keys}
                                noteCallback={keyboardOnClick}
                                setNote={_setNote}>
                            </InputKeys>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sequencer;