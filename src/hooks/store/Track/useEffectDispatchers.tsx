import { MutableRefObject, useMemo } from 'react';
import { setNestedValue, getNested } from '../../../lib/objectDecompose';
import { useDispatch } from 'react-redux';
import { updateEffectState, increaseDecreaseEffectProperty } from '../../../store/Track';
import { removeEffectPropertyLock } from '../../../store/Sequencer';
import { indicators } from '../../../containers/Track/defaults';

export const useEffectDispathchers = (
    fxProps: string[],
    type: any,
    fxIndex: number, 
    ref_trackIndex: MutableRefObject<number>,
    ref_fxIndex: MutableRefObject<number>,
    ref_options: MutableRefObject<any>,
    ref_activePatt: MutableRefObject<number>,
    ref_selectedSteps: MutableRefObject<number[]>,
) => {

    const dispatch = useDispatch();

    const propertiesUpdate: any = useMemo(() => {
        let o = {}
        let callArray = fxProps.map((property) => {
            return (value: any) => {
                let temp = setNestedValue(property, value)
                dispatch(
                    updateEffectState(
                        ref_trackIndex.current, 
                        temp, 
                        ref_fxIndex.current
                    )
                );
            }
        });
        callArray.forEach((call, idx, arr) => {
            setNestedValue(fxProps[idx], call, o);
        });
        return o
    }, [
        dispatch,
        fxIndex,
        ref_fxIndex,
        fxProps,
        ref_options,
    ]);

    const propertiesIncDec: any = useMemo(() => {
        const callArray = fxProps.map((property) => {
            return (e: any) => {
                const propertyArr = getNested(ref_options.current, property);
                const indicatorType = propertyArr[3]
                // const stateValue = propertyArr[0]

                const isContinuous = indicatorType === indicators.KNOB
                    || indicatorType === indicators.VERTICAL_SLIDER

                const cc = e.controller && e.controller.number

                // if (ref_selectedSteps.current && ref_selectedSteps.current.length > 0) {
                //     ref_selectedSteps.current.forEach(step => {
                //         console.log(`dispatching parameterlock effect step ${step}`)
                //         dispatch(parameterLockEffectIncreaseDecrease(
                //             ref_activePatt.current,
                //             ref_trackIndex.current,
                //             step,
                //             ref_fxIndex.current, // fx have order between them (chainning) 
                //             cc ? e.value : e.movementY,
                //             property,
                //             // propertyArr,
                //             getNested(ref_options.current, property),
                //             cc,
                //             isContinuous
                //         ))
                //     })
                // } else {
                //     dispatch(increaseDecreaseEffectProperty(
                //         ref_trackIndex.current,
                //         ref_fxIndex.current,
                //         property,
                //         cc ? e.value : e.movementY,
                //         cc,
                //         isContinuous
                //     ))
                // }
                dispatch(increaseDecreaseEffectProperty(
                    ref_trackIndex.current,
                    ref_fxIndex.current,
                    property,
                    cc ? e.value : e.movementY,
                    cc,
                    isContinuous
                ))
            }
        })
        let o = {};
        fxProps.forEach((_, idx, __) => {
            setNestedValue(fxProps[idx], callArray[idx], o);
        });
        return o;
    }, [
        dispatch,
        ref_activePatt,
        ref_fxIndex,
        ref_options,
        ref_selectedSteps,
        fxProps,
    ]);

    const removeEffectPropertyLockCallbacks: any = useMemo(() => {
        let o = {}
        let callArray = fxProps.map(property => {
            return () => {
                if (ref_selectedSteps.current && ref_selectedSteps.current.length > 0)
                    ref_selectedSteps.current.forEach(step => {
                        dispatch(removeEffectPropertyLock(
                            ref_trackIndex.current,
                            ref_activePatt.current,
                            step,
                            property,    
                            ref_fxIndex.current,
                        ))
                    }
                )
            }
        })
        callArray.forEach((call, idx, arr) => {
            setNestedValue(fxProps[idx], call, o);
        });
        return o
    }, [type])

    return { removeEffectPropertyLockCallbacks, propertiesIncDec, propertiesUpdate }
}