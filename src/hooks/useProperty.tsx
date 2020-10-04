import { useEffect, MutableRefObject } from 'react';
import { effectsInitials, effectsInitialsArray, eventOptions, initialsArray, returnInstrument } from '../containers/Track/Instruments'
import { RecursivePartial } from '../containers/Track/Instruments'
import usePrevious from './usePrevious';
import { onlyValues } from '../lib/objectDecompose'
import { Part } from 'tone';
import { timeObjFromEvent } from '../lib/utility';
import { returnEffect } from '../containers/Track/Effects';

export const useProperty = (
    // ref: any,
    ref: MutableRefObject<ReturnType<typeof returnInstrument>>,
    obj: initialsArray,
    t: keyof initialsArray,
    isObject: boolean = false
) => {
    let a = obj[t]
    useEffect(() => {
        if (a) {
            let v: any;
            // console.log('updating property', t);
            if (isObject) {
                v = {
                    [t]: onlyValues(a),
                }
            } else if (Array.isArray(a)) {
                v = {
                    [t]: a[0],
                }
            }
            ref.current.set(v);
        }
    }, [a, isObject, ref, t])
};

export const useEffectProperty = (
    // ref: any,
    ref: MutableRefObject<ReturnType<typeof returnEffect>>,
    obj: effectsInitialsArray,
    t: keyof effectsInitialsArray,
    isObject: boolean = false
) => {
    let a = obj[t]
    useEffect(() => {
        if (a) {
            let v: any;
            // console.log('updating property', t);
            if (isObject) {
                v = {
                    [t]: onlyValues(a),
                }
            } else if (Array.isArray(a)) {
                v = {
                    [t]: a[0],
                }
            }
            ref.current.set(v);
        }
    }, [a, isObject, ref, t])
};

export const useTrigg = (
    trig: Part,
    triggFx: Part[],
    fxOptions: effectsInitials[],
    instrumentOptions: RecursivePartial<eventOptions>,
    step: number,
    previousOffset: number,
    un: string,
) => {
    const off = instrumentOptions.offset ? instrumentOptions.offset : 0
    const prevUn = usePrevious(un);
    const now = timeObjFromEvent(step, off)
    const fx1Trigg = triggFx[0];
    const f1Opt = fxOptions[0]
    const fx2Trigg = triggFx[1]
    const f2Opt = fxOptions[1]
    const fx3Trigg = triggFx[2]
    const f3Opt = fxOptions[2]
    const fx4Trigg = triggFx[3]
    const f4Opt = fxOptions[3]

    useEffect(() => {
        if (un === prevUn) {
            trig.at(now, instrumentOptions)
        }
    }, [instrumentOptions, trig, un, prevUn])

    useEffect(() => {
        if (un === prevUn) {
            const pastTime = timeObjFromEvent(step, previousOffset, false)
            trig.remove({ time: pastTime })
            trig.at(now, instrumentOptions)
            let i = 0;
            while (i < triggFx.length) {
                triggFx[i].remove({ time: pastTime })
                triggFx[i].at(now, fxOptions[i])
                i++
            }
        }
    }, [instrumentOptions.offset, prevUn])

    useEffect(() => {
        if (un === prevUn && fx1Trigg) {
            fx1Trigg.at(now, f1Opt)
        }
    }, [fx1Trigg, f1Opt])


    useEffect(() => {
        if (un === prevUn && fx2Trigg) {
            fx2Trigg.at(now, f2Opt)
        }
    }, [fx2Trigg, f2Opt])


    useEffect(() => {
        if (un === prevUn && fx3Trigg) {
            fx3Trigg.at(now, f3Opt)
        }
    }, [fx3Trigg, f2Opt])


    useEffect(() => {
        if (un === prevUn && fx3Trigg) {
            fx4Trigg.at(now, f4Opt)
        }
    }, [fx4Trigg, f4Opt])
}