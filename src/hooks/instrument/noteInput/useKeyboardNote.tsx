import { MutableRefObject, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { noteDict, numberToNote } from '../../../store/MidiInput';
import { midi } from '../../../store/Track';
import { useKeyboardRangeSelector } from '../../store/Midi/useMidiSelectors';
import { noteOn, noteOff } from '../../../store/MidiInput';

export const useKeyboardNote = (
    ref_index: MutableRefObject<number>,
    ref_selectedTrkIdx: MutableRefObject<number>,
    midi: midi,
    noteInCallback: (
        noteNumber: number, 
        noteName: string, 
        time: number, 
        velocity?: number | undefined
    ) => void,
    noteOffCallback: (noteNumber: number, noteName: string) => void,
) => {
    const dispatch = useDispatch();
    const ref_keyboardRange = useKeyboardRangeSelector()
    const isKeyboard = midi.device === 'onboardKey' && midi.channel === 'all';
    // const isSelectedTrk = ref_index.current === ref_selectedTrkIdx.current


    
    const instrumentKeyDown = useCallback(
        function keyDownCallback(this: Document, ev: KeyboardEvent) {
            if (ev.repeat) { return }
            const key = ev.key.toLowerCase()
            if (Object.keys(noteDict).includes(key)) {
                const noteNumber = noteDict[key] + (ref_keyboardRange.current * 12)
                const noteName = numberToNote(noteNumber);
                if (noteNumber < 127 && isKeyboard && ref_index.current === ref_selectedTrkIdx.current) {
                    const time = Date.now() / 1000;
                    dispatch(noteOn([noteNumber], 'onboardKey', 'all'));
                    noteInCallback(noteNumber, noteName, time)
                }
            }
        }, [noteDict, ref_keyboardRange]
    )



    const instrumentKeyUp = useCallback(
        function keyUpCallback(this: Document, ev: KeyboardEvent) {
            const key = ev.key.toLowerCase()
            if (Object.keys(noteDict).includes(key)) {
                const noteNumber = noteDict[key] + (ref_keyboardRange.current * 12)
                const noteName = numberToNote(noteNumber);
                if (noteNumber < 127) {
                    dispatch(noteOff([noteNumber], 'onboardKey', 'all'));
                    noteOffCallback(noteNumber, noteName)
                }
            }
        }, [dispatch, noteOffCallback]
    )



    useEffect(() => {
        if (midi.device === 'onboardKey') {
            document.addEventListener('keydown', instrumentKeyDown);
            document.addEventListener('keyup', instrumentKeyUp);

        return () => {
            document.removeEventListener('keydown', instrumentKeyDown);
            document.removeEventListener('keyup', instrumentKeyUp);
            }
        }
    }, [midi.channel, midi.device])


}