import { useEffect, useCallback, MutableRefObject, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { fxCountSelector } from '../../store/Track/selectors';

export const useFx = (
    fxProps: string[], 
    trackIndex: number,
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
    const fxCount = useSelector(fxCountSelector(trackIndex));

    const effectCallback = (time: number, value: any) => {

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

    } 

    useEffect(() => {
        if (ref_toneObjects.current){
            if (ref_toneObjects.current.flagObjects[trackIndex].effects.length < fxCount){
                ref_toneObjects.current.flagObjects[trackIndex].effects.push({callback: undefined, flag: false});
            }
            ref_toneObjects.current.flagObjects[trackIndex].effects[fxIndex].callback = effectCallback;
        }
    }, [fxCount, trackIndex])

    // reset locked property values after stopping playback
    useEffect(() => {
        if (!isPlay && prev_isPlay) {
            let p = propertiesToArray(ref_lockedParameters.current);
            const d = {}
            p.forEach((property) => {
                copyPropertyFromTo(ref_lockedParameters.current, d, property) ;
            });
            dispatch(updateEffectState(trackIndex, d, fxIndex));
        }
        ref_isPlay.current = isPlay;
    }, [
        isPlay,
        dispatch,
        trackIndex,
        fxIndex,
        prev_isPlay,
        ref_isPlay
    ]
    );



    // return  effectCallback 
};