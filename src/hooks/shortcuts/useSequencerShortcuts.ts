import React, { MutableRefObject, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { SequencerDispatchers } from '../store/Sequencer/useSequencerDispatchers';
import { useKeyboardRangeSelector } from '../store/Midi/useMidiSelectors';

import { event, cycleSteps, copyEvents, copyNotes, Pattern } from '../../store/Sequencer';
import { xolombrisxInstruments } from '../../store/Track';
import { selectStep } from '../../store/Sequencer';
import { downOctaveKey, upOctaveKey, keyDict, noteDict, numberNoteDict } from '../../store/MidiInput';

import { getFinalStep as finalStep } from '../../lib/utility';
import MenuEmitter, { menuEmitterEventTypes } from '../../lib/Emitters/MenuEmitter';
import DropdownEmitter, { dropdownEventTypes } from '../../lib/Emitters/dropdownEmitter';



interface copySteps {
    steps: event[], 
    instrument?: xolombrisxInstruments
}

const useSequencerShortcuts = (
    activePattTrkLen: number,
    ref_activePage: MutableRefObject<number>, 
    ref_activePatt: MutableRefObject<number>,
    ref_selectedTrkIdx: MutableRefObject<number>,
    ref_activePattTrkLen: MutableRefObject<number>, 
    ref_selectedSteps: MutableRefObject<number[]>,
    ref_voice: MutableRefObject<xolombrisxInstruments>,
    ref_events: MutableRefObject<event[]>,
    MenuContext: MutableRefObject<any[]>,
    DropdownContext: MutableRefObject<any[]>,
    sequencerDispatchers: SequencerDispatchers, 
    setIsNote: React.Dispatch<React.SetStateAction<boolean>>
) => {

    // keyboard shortcuts event listeners
    // activate when finished testing keyboard
    const ref_keyboardRange = useKeyboardRangeSelector()

    const ref_copiedSteps = useRef<copySteps | null>(null)
    const dispatch = useDispatch();

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


    // sequencer keyboard shortcuts 
    function keydown(this: Document, e: KeyboardEvent): void {
        
        let char: string = e.key.toLowerCase();

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
            sequencerDispatchers._incDecOffset(amount)
        

        // delete events with backspace and delete 
        if (shouldDelete(e, char)) {
            if (e.shiftKey && !e.ctrlKey)
                sequencerDispatchers._deleteNotes()
            else if (e.ctrlKey && !e.shiftKey)
                sequencerDispatchers._deleteLocks()
            else 
                sequencerDispatchers._deleteEvents()
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
                // _selectStep(start + i * num)
                sequencerDispatchers._selectStep(start + i * num)
            return
        }
    };





};

export default useSequencerShortcuts;