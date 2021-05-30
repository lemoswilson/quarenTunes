import { useMemo, MutableRefObject, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removePropertyLock, parameterLock, parameterLockIncreaseDecrease, setNote, setVelocity, setNoteLengthPlayback } from '../../../store/Sequencer';
import { updateInstrumentState, xolombrisxInstruments, increaseDecreaseInstrumentProperty } from '../../../store/Track';
import { setNestedValue, getNested, propertiesToArray, copyPropertyFromTo, deleteProperty } from '../../../lib/objectDecompose';
import { indicators } from '../../../containers/Track/defaults';
import { initials, eventOptions } from '../../../containers/Track/Instruments';
import { ToneObjectContextType } from '../../../context/ToneObjectsContext';
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

