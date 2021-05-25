import { MutableRefObject, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateInstrumentState, xolombrisxInstruments, increaseDecreaseInstrumentProperty } from '../../store/Track';
import { setNestedValue, getNested, propertiesToArray, copyPropertyFromTo, deleteProperty } from '../../lib/objectDecompose';
import { initials, eventOptions } from '../../containers/Track/Instruments';
import { ToneObjectContextType } from '../../context/ToneObjectsContext';
import { arrangerMode, patternTrackerType, songEvent } from '../../store/Arranger';
import { returnInstrument } from '../../lib/Tone/initializers';
import { useIsPlaySelector } from '../store/Transport/useTransportSelectors';
import { pattsNoteLenSelector } from '../../store/Sequencer/selectors';
import useQuickRef from '../lifecycle/useQuickRef';

export const useInstrumentPlayback = (
    ref_toneObjects: ToneObjectContextType,
    index: number, 
    ref_index: MutableRefObject<number>,
    ref_options: any,
    ref_arrgMode: MutableRefObject<arrangerMode>,
    ref_pattsVelocities: MutableRefObject<{[key: string]: number}>,
    ref_activePatt: MutableRefObject<number>,
    ref_pattTracker: MutableRefObject<patternTrackerType>,
    ref_songEvents: MutableRefObject<songEvent[]>,
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
    }, [
        isPlay,
        dispatch,
        index,
    ]
    );



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