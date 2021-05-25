import { useEffect, useCallback, MutableRefObject, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { 
    propertiesToArray, 
    getNested, 
    setNestedValue, 
    deleteProperty, 
    copyPropertyFromTo 
} from '../../lib/objectDecompose';
import { effectsInitials } from '../../containers/Track/Instruments';
import { ToneObjectContextType } from '../../context/ToneObjectsContext';
import { updateEffectState } from '../../store/Track';
import { useIsPlaySelector } from '../store/Transport/useTransportSelectors';

export const useFx = (
    fxProps: string[], 
    trackId: number,
    fxIndex: number,
    ref_options: MutableRefObject<any>,
    ref_toneObjects: ToneObjectContextType, 
    ref_trackIndex: MutableRefObject<number>,
    ref_fxIndex: MutableRefObject<number>,
    propertiesUpdate: any,
) => {
    const dispatch = useDispatch();

    const ref_lockedParameters: MutableRefObject<effectsInitials> = useRef({});
    const { isPlay, prev_isPlay, ref_isPlay} = useIsPlaySelector();

    const effectCallback = useCallback((time: number, value: any) => {

        const eventProperties = propertiesToArray(value).concat(propertiesToArray(ref_lockedParameters.current));

        eventProperties.forEach(property => {

            const currVal = getNested(ref_options.current, property);
            const callbackVal = getNested(value, property);
            const lockVal = getNested(ref_lockedParameters.current, property);

            if (callbackVal && callbackVal !== currVal[0]) {

                ref_toneObjects.current?.tracks[ref_trackIndex.current].effects[ref_fxIndex.current].set(setNestedValue(property, callbackVal));
                getNested(propertiesUpdate, property)(callbackVal);
                if (!lockVal)
                    setNestedValue(property, currVal[0], ref_lockedParameters.current);

            } else if (!callbackVal && lockVal && currVal[0] !== lockVal) {
                ref_toneObjects.current?.tracks[ref_trackIndex.current].effects[ref_fxIndex.current].set(setNestedValue(property, lockVal));
                getNested(propertiesUpdate, property)(lockVal);
                deleteProperty(ref_lockedParameters.current, property);
            }
        });

    }, [
        fxProps,
        propertiesUpdate,
        ref_options,
    ])

    // reset locked property values after stopping playback
    useEffect(() => {
        if (!isPlay && prev_isPlay) {
            let p = propertiesToArray(ref_lockedParameters.current);
            const d = {}
            p.forEach((property) => {
                copyPropertyFromTo(ref_lockedParameters.current, d, property) ;
            });
            dispatch(updateEffectState(trackId, d, fxIndex));
        }
        ref_isPlay.current = isPlay;
    }, [
        isPlay,
        dispatch,
        trackId,
        fxIndex,
        prev_isPlay,
        ref_isPlay
    ]
    );

    return  effectCallback 
};