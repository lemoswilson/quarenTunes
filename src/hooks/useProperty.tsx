import { useEffect, MutableRefObject } from 'react';
import { effectsInitials, effectsInitialsArray, eventOptions, initialsArray, returnInstrument } from '../containers/Track/Instruments'
import { RecursivePartial } from '../containers/Track/Instruments'
import { onlyValues } from '../lib/objectDecompose'
import { Part } from 'tone';
import { timeObjFromEvent } from '../lib/utility';
import { each } from 'immer/dist/internal';
import { triggFx } from '../context/triggState';
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
    triggFx: triggFx,
    fxOptions: effectsInitials[],
    instrumentOptions: RecursivePartial<eventOptions>,
    step: number,
    previousOffset: number
) => {
    const off = instrumentOptions.offset ? instrumentOptions.offset : 0
    const now = timeObjFromEvent(step, off)
    const fx1Trigg = triggFx[0]
    const f1Opt = fxOptions[0]
    const fx2Trigg = triggFx[1]
    const f2Opt = fxOptions[1]
    const fx3Trigg = triggFx[2]
    const f3Opt = fxOptions[2]
    const fx4Trigg = triggFx[3]
    const f4Opt = fxOptions[3]

    useEffect(() => {
        trig.at(now, instrumentOptions)
    }, [instrumentOptions, trig])

    useEffect(() => {
        const pastTime = timeObjFromEvent(step, previousOffset, false)
        trig.remove({ time: pastTime })
        trig.at(now, instrumentOptions)
        let i = 0;
        while (i < 4) {
            triggFx[i].remove({ time: pastTime })
            triggFx[i].at(now, fxOptions[i])
            i++
        }
    }, [instrumentOptions.offset])

    useEffect(() => {
        fx1Trigg.at(now, f1Opt)
    }, [fx1Trigg, f1Opt])


    useEffect(() => {
        fx2Trigg.at(now, f2Opt)
    }, [fx2Trigg, f2Opt])


    useEffect(() => {
        fx2Trigg.at(now, f2Opt)
    }, [fx2Trigg, f2Opt])


    useEffect(() => {
        fx2Trigg.at(now, f2Opt)
    }, [fx2Trigg, f2Opt])
}