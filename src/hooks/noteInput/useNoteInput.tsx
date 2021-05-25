import {  MutableRefObject, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setNote, setVelocity, setNoteLengthPlayback } from '../../store/Sequencer';
import { xolombrisxInstruments } from '../../store/Track';
import { ToneObjectContextType } from '../../context/ToneObjectsContext';
import { arrangerMode, patternTrackerType, songEvent } from '../../store/Arranger';
import { returnInstrument } from '../../lib/Tone/initializers';
import * as Tone from 'tone';

export const useNoteInput = (
    ref_selectedSteps: MutableRefObject<number[]>,
    ref_index: MutableRefObject<number>, 
    index: number,
    ref_toneObjects: ToneObjectContextType,
    ref_arrgMode: MutableRefObject<arrangerMode>,
    ref_activePatt: MutableRefObject<number>,
    ref_pattTracker: MutableRefObject<patternTrackerType>,
    ref_pattsVelocities: MutableRefObject<{[key: number]: number}>,
    ref_songEvents: MutableRefObject<songEvent[]>,
    ref_isRec: MutableRefObject<boolean>,
    ref_isPlay: MutableRefObject<boolean>,
    ref_ToneInstrument: MutableRefObject<ReturnType<typeof returnInstrument> | null>,
    ref_activeStep: MutableRefObject<number>,
    ref_voice: MutableRefObject<xolombrisxInstruments>,
    voice: xolombrisxInstruments,
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

    const noteInCallback = useCallback((noteNumber: number, noteName: string, time: number, velocity?: number) => {
        if (!velocity) {
            console.log(ref_arrgMode.current, arrangerMode.PATTERN, ref_activePatt.current, ref_pattTracker.current.patternPlaying)
            velocity = 
                ref_arrgMode.current === arrangerMode.PATTERN 
                ? ref_pattsVelocities.current[ref_activePatt.current] 
                : ref_pattsVelocities.current[
                    ref_pattTracker.current.patternPlaying > -1 
                    ? ref_pattTracker.current.patternPlaying 
                    : ref_songEvents.current[ref_pattTracker.current.playbackStart].pattern
                ]
        }


        // recording playiback logic 
        if (ref_isRec.current && ref_isPlay.current && ref_ToneInstrument.current) {

            ref_ToneInstrument.current.triggerAttack(noteName, 0, velocity/127);
            const pattern = 
                ref_arrgMode.current === arrangerMode.PATTERN 
                ? ref_activePatt.current 
                : ref_pattTracker.current.patternPlaying > -1 
                ? ref_pattTracker.current.patternPlaying 
                : ref_songEvents.current[ref_pattTracker.current.activeEventIndex].pattern

            // parei aqui
            setNoteInput(pattern, ref_activeStep.current, 0, noteName, velocity, time);

        } else if (ref_selectedSteps.current && ref_selectedSteps.current.length > 0 && !ref_isRec.current) {
            noteLock(noteName, velocity, ref_activePatt.current);
        } else if (ref_selectedSteps.current && ref_selectedSteps.current.length === 0){
            // no selected steps, should be playing notes

            if (ref_voice.current === xolombrisxInstruments.NOISESYNTH) {
                const jab: any = ref_ToneInstrument.current
                jab.triggerAttack(0, velocity/127)

            } else if (ref_voice.current === xolombrisxInstruments.METALSYNTH){
                console.log('meta synth')
                const j: any = ref_ToneInstrument.current;
                j.triggerAttack(noteName, undefined, velocity/127)
            }
            else {
                ref_ToneInstrument.current?.triggerAttack(noteName, undefined, velocity/127);
            }

        }
    }, [noteLock,
        voice,
        setNoteInput,
        ref_activePatt,
        ref_arrgMode,
        ref_isPlay,
        ref_isRec,
        ref_pattTracker,
        // returnStep,
        ref_selectedSteps
    ]
    )

    const noteOffCallback = useCallback((noteNumber: number, noteName: string): void => {
        const noteObj = ref_onHoldNotes.current[noteName];

        // if (ref_isRec.current && ref_isPlay.current && noteObj) {
        if (noteObj) {
            if (
                ref_voice.current === xolombrisxInstruments.METALSYNTH
                || ref_voice.current === xolombrisxInstruments.NOISESYNTH
            ){
                const k: any = ref_ToneInstrument.current
                k.triggerRelease()
            } else {
                ref_ToneInstrument.current?.triggerRelease(noteName);
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
                const d: any = ref_ToneInstrument.current
                d.triggerRelease();

            } else  {
                ref_ToneInstrument.current?.triggerRelease(noteName);
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

    return { noteInCallback, noteOffCallback }
}