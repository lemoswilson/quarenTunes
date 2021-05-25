import { useMemo, MutableRefObject, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removePropertyLock, parameterLock, parameterLockIncreaseDecrease, setNote, setVelocity, setNoteLengthPlayback } from '../../../store/Sequencer';
import { updateInstrumentState, xolombrisxInstruments, increaseDecreaseInstrumentProperty } from '../../../store/Track';
import { setNestedValue, getNested, propertiesToArray, copyPropertyFromTo, deleteProperty } from '../../../lib/objectDecompose';
import { indicators } from '../../../containers/Track/defaults';
import { initials, eventOptions } from '../../../containers/Track/Instruments';
import { ToneObjectContextType } from '../../../context/ToneObjectsContext';
import { arrangerMode, patternTrackerType, songEvent } from '../../../store/Arranger';
import { returnInstrument } from '../../../lib/Tone/initializers';
import { useIsPlaySelector } from '../Transport/useTransportSelectors';
import * as Tone from 'tone';
import { pattsNoteLenSelector } from '../../../store/Sequencer/selectors';
import useQuickRef from '../../lifecycle/useQuickRef';

export const useInstrumentDispatchers = (
    instProps: string[],
    ref_options: MutableRefObject<any>,
    ref_selectedSteps: MutableRefObject<number[]>,
    ref_index: MutableRefObject<number>, 
    ref_activePatt: MutableRefObject<number>,
    voice: xolombrisxInstruments,
) => {
    const dispatch = useDispatch();

    const removePropertyLockCallbacks: any = useMemo(() => {
        let o = {}
        let callArray = instProps.map(property => {
            return () => {
                if ( ref_selectedSteps.current && ref_selectedSteps.current.length > 0)
                    ref_selectedSteps.current.forEach(step => {
                        dispatch(removePropertyLock(
                            ref_index.current,
                            ref_activePatt.current,
                            step,
                            property    
                        ))
                    }
                )
            }
        })
        callArray.forEach((call, idx, arr) => {
            setNestedValue(instProps[idx], call, o);
        });
        return o
    }, [
        voice,
    ])

    const propertiesUpdate: any = useMemo(() => {
        let o = {}
        let callArray = instProps.map((property) => {
            return (value: any) => {

                // parameter lock logic 
                let temp = setNestedValue(property, value)
                if (ref_selectedSteps.current && ref_selectedSteps.current.length > 0) {
                    ref_selectedSteps.current.forEach(s => {
                        dispatch(parameterLock(
                            ref_activePatt.current,
                            ref_index.current,
                            s,
                            temp,
                            property
                        ))
                    })
                } else {
                    dispatch(updateInstrumentState(ref_index.current, temp));
                };
            }
        });
        callArray.forEach((call, idx, arr) => {
            setNestedValue(instProps[idx], call, o);
        });
        return o
    }, [
        dispatch,
        ref_index,
        instProps,
        ref_options,
    ]);

    // I think maybe this one doesn't need
    // to be wraped in an useMemo 
    // ** flag ** 
    const propertiesIncDec: any = useMemo(() => {
        const callArray = instProps.map((property) => {
            return (e: any) => {

                const indicatorType = getNested(ref_options.current, property)[3]
                const isContinuous = indicatorType === indicators.KNOB
                    || indicatorType === indicators.VERTICAL_SLIDER
                const cc = e.controller && e.controller.number

                if ( ref_selectedSteps.current && ref_selectedSteps.current.length >= 1) {

                    ref_selectedSteps.current.forEach(step => {
                        dispatch(parameterLockIncreaseDecrease(
                            ref_activePatt.current,
                            ref_index.current,
                            step,
                            cc ? e.value : e.movementY,
                            property,
                            getNested(ref_options.current, property),
                            cc,
                            isContinuous,
                        ))
                    })
                } else {
                    dispatch(increaseDecreaseInstrumentProperty(
                        ref_index.current,
                        property,
                        cc ? e.value : e.movementY,
                        cc,
                        isContinuous
                    ))
                }
            }
        })
        let o = {};
        instProps.forEach((_, idx, __) => {
            setNestedValue(instProps[idx], callArray[idx], o);
        });
        return o;
    }, [
        dispatch,
        ref_activePatt,
        ref_index,
        ref_options,
        ref_selectedSteps,
        instProps,
    ]);

    return { propertiesIncDec, propertiesUpdate, removePropertyLockCallbacks }
};

export const useInstrumentCallback = (
    ref_toneObjects: ToneObjectContextType,
    // isPlay: boolean,
    // prev_isPlay: boolean,
    index: number, 
    ref_index: MutableRefObject<number>,
    ref_options: any,
    ref_arrgMode: MutableRefObject<arrangerMode>,
    ref_pattsVelocities: MutableRefObject<{[key: string]: number}>,
    ref_activePatt: MutableRefObject<number>,
    ref_pattTracker: MutableRefObject<patternTrackerType>,
    ref_songEvents: MutableRefObject<songEvent[]>,
    // ref_pattsNoteLen: MutableRefObject<{[key: string]: number | string | undefined}>,
    ref_ToneInstrument: MutableRefObject<ReturnType<typeof returnInstrument> | null>,
    voice: xolombrisxInstruments,
    propertiesUpdate: any,
) => {
    const dispatch = useDispatch();

    const ref_lockedParameters: MutableRefObject<initials> = useRef({});
    const { isPlay, prev_isPlay, ref_isPlay} = useIsPlaySelector();
    const pattsNoteLen = useSelector(pattsNoteLenSelector(index));
    const ref_pattsNoteLen = useQuickRef(pattsNoteLen);

    useEffect(() => {
        if (!isPlay && prev_isPlay) {
            let lockedProperties = propertiesToArray(ref_lockedParameters.current);
            const data = {}
            lockedProperties.forEach((lockedProperty) => {
                copyPropertyFromTo(
                    ref_lockedParameters.current, 
                    data, 
                    lockedProperty
                );
            });
            dispatch(updateInstrumentState(index, data));
            
            ref_lockedParameters.current = {};
        }
        // ref_isPlay.current = isPlay;
    }, [
        isPlay,
        dispatch,
        index,
    ]
    );

    // useEffect(() => {
    //     ref_isPlay.current = isPlay;
    // }, [isPlay])


    const instrumentCallback = (time: number, value: eventOptions) => {
        

        const eventProperties = propertiesToArray(value).concat(propertiesToArray(ref_lockedParameters.current).concat('velocity, length, note'));

        eventProperties.forEach(eventProperty => {

            if (
                eventProperty !== 'velocity'
                && eventProperty !== 'length'
                && eventProperty !== 'note'
            ) {
                const currVal = getNested(ref_options.current, eventProperty);
                const callbackVal = getNested(value, eventProperty);
                const lockVal = getNested(ref_lockedParameters.current, eventProperty);

                if (callbackVal && callbackVal !== currVal[0]) {

                    ref_toneObjects.current?.tracks[ref_index.current].instrument?.set(setNestedValue(eventProperty, callbackVal))
                    getNested(propertiesUpdate, eventProperty)(callbackVal);
                    if (!lockVal) {
                        setNestedValue(eventProperty, currVal[0], ref_lockedParameters.current);

                    }

                } else if (!callbackVal && (lockVal || lockVal === 0) && currVal[0] !== lockVal) {

                    ref_toneObjects.current?.tracks[ref_index.current].instrument?.set(setNestedValue(eventProperty, lockVal))
                    getNested(propertiesUpdate, eventProperty)(lockVal);
                    deleteProperty(ref_lockedParameters.current, eventProperty);
                }
            }
        })

        let velocity: number = value.velocity
        ? value.velocity
        : ref_arrgMode.current === "pattern"
            ? ref_pattsVelocities.current[ref_activePatt.current]
            : ref_pattTracker.current.patternPlaying > -1 ? ref_pattsVelocities.current[ref_pattTracker.current.patternPlaying] : ref_pattsVelocities.current[ref_songEvents.current[ref_pattTracker.current.playbackStart].pattern]
        let length: string | number | undefined = value.length
            ? value.length
            : ref_arrgMode.current === "pattern"
                ? ref_pattsNoteLen.current[ref_activePatt.current]
                : ref_pattTracker.current.patternPlaying > -1 ? ref_pattsNoteLen.current[ref_pattTracker.current.patternPlaying] : ref_pattsNoteLen.current[ref_songEvents.current[ref_pattTracker.current.playbackStart].pattern]
        let notes: string[] | undefined = value.note ? value.note : undefined;

        // note playback
        if (notes) {
            // should fix this 
            notes.forEach(note => {
                if (note && ref_ToneInstrument.current) {
                    const t: any = ref_ToneInstrument.current;
                    if (voice === xolombrisxInstruments.NOISESYNTH) {
                        t.triggerAttackRelease(
                            length ? length : 0,
                            time,
                            velocity / 127
                        )
                    } else  {
                        t.triggerAttackRelease(
                            note, 
                            length ? length : 0, 
                            time, 
                            velocity / 127
                        )
                    } 
                }
            })
        }
    }

    useEffect(() => {
        ref_toneObjects.current?.arranger.forEach((_, idx, __) => {
            if (ref_toneObjects.current)
                ref_toneObjects.current.arranger[idx][index].instrument.callback = instrumentCallback;
        })

        if (ref_toneObjects.current) {
            for (const key in ref_toneObjects.current?.patterns){
                ref_toneObjects.current.patterns[key][index].instrument.callback = instrumentCallback;
            }

            ref_toneObjects.current.flagObjects[index].instrument.callback = instrumentCallback;
        }
    }, [instrumentCallback])

    return { ref_isPlay, instrumentCallback };
}

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
