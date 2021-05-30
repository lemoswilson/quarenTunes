import { MutableRefObject, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateInstrumentState, xolombrisxInstruments, increaseDecreaseInstrumentProperty } from '../../store/Track';
import { setNestedValue, getNested, propertiesToArray, copyPropertyFromTo, deleteProperty } from '../../lib/objectDecompose';
import { initials, eventOptions } from '../../containers/Track/Instruments';
import { ToneObjectContextType } from '../../context/ToneObjectsContext';
import { returnInstrument } from '../../lib/Tone/initializers';
import { useIsPlaySelector } from '../store/Transport/useTransportSelectors';
import { pattsNoteLenSelector } from '../../store/Sequencer/selectors';
import useQuickRef from '../lifecycle/useQuickRef';

export const useInstrumentPlayback = (
    ref_toneObjects: ToneObjectContextType,
    index: number, 
    ref_index: MutableRefObject<number>,
    ref_options: any,
    // ref_arrgMode: MutableRefObject<arrangerMode>,
    ref_pattsVelocities: MutableRefObject<{[key: string]: number}>,
    ref_activePatt: MutableRefObject<number>,
    // ref_pattTracker: MutableRefObject<patternTrackerType>,
    // ref_songEvents: MutableRefObject<songEvent[]>,
    voice: xolombrisxInstruments,
    trkCount: number,
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



    const instrumentCallback = useCallback((time: number, value: eventOptions) => {
        // console.log('[useInstrumentPlayback]: instrumentCallback has been called, fx index is ', ref_index) ;

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
        : ref_pattsVelocities.current[ref_activePatt.current];

        let length: string | number | undefined = value.length
        ? value.length
        : ref_pattsNoteLen.current[ref_activePatt.current];

        let notes: string[] | undefined = value.note ? value.note : undefined;

        // note playback
        if (notes) {
            // should fix this 
            notes.forEach(note => {
                if (note && ref_toneObjects.current) {
                    const t: any = ref_toneObjects.current.tracks[ref_index.current].instrument;

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
    }, [])

    const setCallbacks = useCallback(() => {
        console.log('[useInstrumentPlayback]: should be setting callbacks');

        if (ref_toneObjects.current) {
            for (const key in ref_toneObjects.current?.patterns){
                ref_toneObjects.current.patterns[key][index].instrument.callback = instrumentCallback;
            }

            if (ref_toneObjects.current.flagObjects.length < trkCount){
                ref_toneObjects.current.flagObjects.push({
                    effects: [
                        {
                            callback: undefined, 
                            flag: false
                        }
                    ], 
                    instrument: {
                        callback: undefined, 
                        flag: false
                    },
                })
            }
            
            ref_toneObjects.current.flagObjects[index].instrument.callback = instrumentCallback;

        }
    }, [instrumentCallback]);

    useEffect(() => {
        console.log(`[useInstrumentPlayback]: should be updating instrument callback of track ${index}`);
        setCallbacks();
    }, [setCallbacks, trkCount])

    return { ref_isPlay, instrumentCallback, setCallbacks };

}