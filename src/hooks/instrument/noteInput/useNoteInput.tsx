import {  MutableRefObject, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setNote, setVelocity, setNoteLengthPlayback } from '../../../store/Sequencer';
import { xolombrisxInstruments, midi } from '../../../store/Track';
import { ToneObjectContextType } from '../../../context/ToneObjectsContext';
import * as Tone from 'tone';
import { useMidiNote } from './useMidiNote';
import { useKeyboardNote } from './useKeyboardNote';

export const useNoteInput = (
    ref_selectedSteps: MutableRefObject<number[]>,
    ref_index: MutableRefObject<number>, 
    index: number,
    ref_toneObjects: ToneObjectContextType,
    ref_activePatt: MutableRefObject<number>,
    ref_pattsVelocities: MutableRefObject<{[key: number]: number}>,
    ref_isRec: MutableRefObject<boolean>,
    ref_isPlay: MutableRefObject<boolean>,
    ref_activeStep: MutableRefObject<number>,
    ref_voice: MutableRefObject<xolombrisxInstruments>,
    voice: xolombrisxInstruments,
    midi: midi, 
    ref_selectedTrkIdx: MutableRefObject<number>,
) => {
    const dispatch = useDispatch();
    const ref_onHoldNotes = useRef<{ [key: string]: any }>({});

    const noteLock = useCallback((
        note: string,
        velocity: number,
        pattern: number
    ): void => {
        ref_selectedSteps.current?.forEach(step => {
            dispatch(setNote(pattern, ref_index.current, note, step))

        });

    }, [dispatch, index, ref_toneObjects, ref_selectedSteps]);



    const setNoteInput = useCallback((
        pattern: number,
        step: number,
        offset: number,
        noteName: string,
        velocity: number,
        time: number,
    ): void => {

        dispatch(
            setNote(
                pattern,
                ref_index.current,
                noteName,
                step,
            )
        );
        dispatch( 
            setVelocity(
                pattern,
                ref_index.current, 
                step, 
                velocity
            )
        )

        ref_onHoldNotes.current[noteName] = {
            pattern,
            index,
            step,
            time,
        }

    }, [
        dispatch,
        index,
        ref_toneObjects,
    ]
    )

    const noteInCallback = useCallback(
        (
            noteNumber: number, 
            noteName: string, 
            time: number, velocity?: number
        ) => {

        if (!velocity) {
            velocity = ref_pattsVelocities.current[ref_activePatt.current] 
        }


        // recording playiback logic 
        if (ref_isRec.current && ref_isPlay.current && ref_toneObjects.current && ref_toneObjects.current.tracks[ref_index.current].instrument) {
            ref_toneObjects.current.tracks[ref_index.current].instrument?.triggerAttack(noteName, 0, velocity/127)
            const pattern =  ref_activePatt.current 

            setNoteInput(pattern, ref_activeStep.current, 0, noteName, velocity, time);

        } else if (
            ref_selectedSteps.current 
            && ref_selectedSteps.current.length > 0 
            && !ref_isRec.current
        ) {
            noteLock(noteName, velocity, ref_activePatt.current);


        } else if (
            ref_selectedSteps.current 
            && ref_selectedSteps.current.length === 0
        ){

            if (ref_voice.current === xolombrisxInstruments.NOISESYNTH) {
                const jab: any = ref_toneObjects.current?.tracks[ref_index.current].instrument
                jab.triggerAttack(0, velocity/127)

            } else if (ref_voice.current === xolombrisxInstruments.METALSYNTH){
                const j: any = ref_toneObjects.current?.tracks[ref_index.current].instrument;
                j.triggerAttack(noteName, undefined, velocity/127)
            }
            else {
                ref_toneObjects.current?.tracks[ref_index.current].instrument?.triggerAttack(noteName, undefined, velocity/127);
            }

        }
    }, [noteLock,
        voice,
        setNoteInput,
        ref_activePatt,
        ref_isPlay,
        ref_isRec,
        ref_selectedSteps
    ]
    )

    const noteOffCallback = useCallback((noteNumber: number, noteName: string): void => {
        const noteObj = ref_onHoldNotes.current[noteName];

        if (noteObj) {
            if (
                ref_voice.current === xolombrisxInstruments.METALSYNTH
                || ref_voice.current === xolombrisxInstruments.NOISESYNTH
            ){
                const k: any = ref_toneObjects.current?.tracks[ref_index.current].instrument
                k.triggerRelease()
            } else {

                ref_toneObjects.current?.tracks[ref_index.current].instrument?.triggerRelease(noteName);
            }

            const now = Date.now() / 1000;
            const length = Tone.Time(now - noteObj.time, 's').toNotation();
            const pattern = noteObj.pattern
            const step = noteObj.step

            dispatch(
                setNoteLengthPlayback(
                    noteName,
                    pattern,
                    index,
                    step,
                    length,
                )
            );

            ref_onHoldNotes.current[noteName] = undefined;

        } else if (ref_selectedSteps.current?.length === 0 && !ref_isRec.current) {

            if (
                ref_voice.current === xolombrisxInstruments.METALSYNTH
                || ref_voice.current === xolombrisxInstruments.NOISESYNTH
            ) {
                const d: any = ref_toneObjects.current?.tracks[ref_index.current].instrument
                d.triggerRelease();

            } else  {
                ref_toneObjects.current?.tracks[ref_index.current].instrument?.triggerRelease(noteName);
            }  

        }
    }, [
        dispatch,
        index,
        ref_toneObjects,
        ref_isPlay,
        ref_isRec,
        ref_selectedSteps,
    ]
    );

    useMidiNote(midi, noteInCallback, noteOffCallback)
    useKeyboardNote(ref_index, ref_selectedTrkIdx, midi, noteInCallback, noteOffCallback)

}