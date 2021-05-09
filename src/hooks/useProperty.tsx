import { useEffect, MutableRefObject } from 'react';
import { effectsInitials, effectsInitialsArray, eventOptions, initialsArray } from '../containers/Track/Instruments'
import { returnInstrument } from '../containers/Xolombrisx';
// import { effectsInitials, effectsInitialsArray, eventOptions, initialsArray } from '../containers/Track/Instruments'
import { RecursivePartial } from '../containers/Track/Instruments'
import usePrevious from './usePrevious';
import { onlyValues } from '../lib/objectDecompose'
import { Part } from 'tone';
import { timeObjFromEvent } from '../lib/utility';
import { returnEffect } from '../containers/Xolombrisx/';
import { xolombrisxInstruments } from '../store/Track';
import DrumRack from '../lib/DrumRack';
import { DrumRackSlotInitials } from '../containers/Track/defaults';
import { generalEffectOptions } from '../store/Track';
import { triggs } from '../context/ToneObjectsContext';


export const useProperty = (
    // ref: any,
    ref: MutableRefObject<ReturnType<typeof returnInstrument>>,
    // obj: initialsArray,
    obj: any,
    t: keyof initialsArray,
    isObject: boolean = false,
    voice?: xolombrisxInstruments,
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

export const useProperties = (
    // instrumentRef: MutableRefObject<ReturnType<typeof returnInstrument>>,
    instrumentRef: any,
    options: any,
) => {
    useProperty(instrumentRef, options, 'harmonicity');
    useProperty(instrumentRef, options, 'attack');
    useProperty(instrumentRef, options, 'attackNoise');
    useProperty(instrumentRef, options, 'curve');
    useProperty(instrumentRef, options, 'dampening');
    useProperty(instrumentRef, options, 'detune');
    useProperty(instrumentRef, options, 'envelope', true);
    useProperty(instrumentRef, options, 'modulation', true);
    useProperty(instrumentRef, options, 'modulationEnvelope', true);
    useProperty(instrumentRef, options, 'noise', true);
    useProperty(instrumentRef, options, 'octaves');
    useProperty(instrumentRef, options, 'pitchDecay');
    useProperty(instrumentRef, options, 'oscillator', true);
    useProperty(instrumentRef, options, 'modulationIndex')
    useProperty(instrumentRef, options, 'portamento');
    useProperty(instrumentRef, options, 'resonance');
    useProperty(instrumentRef, options, 'volume')
}

export const useDrumRackProperty = (
    // ref: MutableRefObject<DrumRack>,
    ref: any,
    obj: { [key: string]: any },
    prop: keyof typeof DrumRackSlotInitials,
    drumPad: string,
    isObject: boolean = false,
    voice?: xolombrisxInstruments
) => {
    let a = voice === xolombrisxInstruments.DRUMRACK ? obj[drumPad][prop] : false;
    // if (a) {

    // }
    useEffect(() => {
        if (a) {
            let v: any;
            if (isObject) {
                console.log()
                v = {
                    [prop]: onlyValues(a),
                }
            } else if (Array.isArray(a)) {
                v = {
                    [prop]: a[0]
                }
            } else {
                v = {
                    [prop]: a,
                }
            }
            ref.current.set(v, Number(drumPad[4]))
        }
    }, [a, isObject, ref, prop])
}

export const useDrumRackProperties = (
    instrumentRef: any,
    options: any,
) => {
    useDrumRackProperty(instrumentRef, options, 'attack', 'PAD_0')
    useDrumRackProperty(instrumentRef, options, 'attack', 'PAD_1')
    useDrumRackProperty(instrumentRef, options, 'attack', 'PAD_2')
    useDrumRackProperty(instrumentRef, options, 'attack', 'PAD_3')
    useDrumRackProperty(instrumentRef, options, 'baseUrl', 'PAD_0')
    useDrumRackProperty(instrumentRef, options, 'baseUrl', 'PAD_1')
    useDrumRackProperty(instrumentRef, options, 'baseUrl', 'PAD_2')
    useDrumRackProperty(instrumentRef, options, 'baseUrl', 'PAD_3')
    useDrumRackProperty(instrumentRef, options, 'curve', 'PAD_0')
    useDrumRackProperty(instrumentRef, options, 'curve', 'PAD_1')
    useDrumRackProperty(instrumentRef, options, 'curve', 'PAD_2')
    useDrumRackProperty(instrumentRef, options, 'curve', 'PAD_3')
    useDrumRackProperty(instrumentRef, options, 'release', 'PAD_0')
    useDrumRackProperty(instrumentRef, options, 'release', 'PAD_1')
    useDrumRackProperty(instrumentRef, options, 'release', 'PAD_2')
    useDrumRackProperty(instrumentRef, options, 'release', 'PAD_3')
    useDrumRackProperty(instrumentRef, options, 'urls', 'PAD_0', true)
    useDrumRackProperty(instrumentRef, options, 'urls', 'PAD_1', true)
    useDrumRackProperty(instrumentRef, options, 'urls', 'PAD_2', true)
    useDrumRackProperty(instrumentRef, options, 'urls', 'PAD_3', true)
    useDrumRackProperty(instrumentRef, options, 'volume', 'PAD_0')
    useDrumRackProperty(instrumentRef, options, 'volume', 'PAD_1')
    useDrumRackProperty(instrumentRef, options, 'volume', 'PAD_2')
    useDrumRackProperty(instrumentRef, options, 'volume', 'PAD_3')
}

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
            console.log('t is', t, 'isObject is', isObject, 'a is', a, 'v is ', v);
            ref.current.set(v);
        }
    }, [a, isObject, ref, t])
};

export const useEffectProperties = (
    // effectRef: MutableRefObject<ReturnType<typeof returnEffect>>,
    effectRef: any,
    options: effectsInitialsArray
) => {

    useEffectProperty(effectRef, options, 'Q');
    useEffectProperty(effectRef, options, 'attack');
    useEffectProperty(effectRef, options, 'baseFrequency');
    useEffectProperty(effectRef, options, 'bits');
    useEffectProperty(effectRef, options, 'dampening');
    useEffectProperty(effectRef, options, 'delayTime');
    useEffectProperty(effectRef, options, 'depth');
    useEffectProperty(effectRef, options, 'detune');
    useEffectProperty(effectRef, options, 'distortion');
    useEffectProperty(effectRef, options, 'feedback');
    useEffectProperty(effectRef, options, 'filter', true);
    useEffectProperty(effectRef, options, 'frequency');
    useEffectProperty(effectRef, options, 'gain');
    useEffectProperty(effectRef, options, 'high');
    useEffectProperty(effectRef, options, 'highFrequency');
    useEffectProperty(effectRef, options, 'knee');
    useEffectProperty(effectRef, options, 'low');
    useEffectProperty(effectRef, options, 'lowFrequency');
    useEffectProperty(effectRef, options, 'maxDelay');
    useEffectProperty(effectRef, options, 'mid');
    useEffectProperty(effectRef, options, 'octaves');
    useEffectProperty(effectRef, options, 'order');
    useEffectProperty(effectRef, options, 'oversample');
    useEffectProperty(effectRef, options, 'pitch');
    useEffectProperty(effectRef, options, 'ratio');
    useEffectProperty(effectRef, options, 'release');
    useEffectProperty(effectRef, options, 'rolloff');
    useEffectProperty(effectRef, options, 'roomSize');
    useEffectProperty(effectRef, options, 'smoothing');
    useEffectProperty(effectRef, options, 'spread');
    useEffectProperty(effectRef, options, 'stages');
    useEffectProperty(effectRef, options, 'threshold');
    useEffectProperty(effectRef, options, 'type');
    useEffectProperty(effectRef, options, 'wet');
    useEffectProperty(effectRef, options, 'width');
    useEffectProperty(effectRef, options, 'windowSize');
}

export const useTrigg = (
    // trig: Part | undefined,
    // triggFx: Part[] | undefined,
    triggObj: triggs | undefined,
    fxOptions: generalEffectOptions[],
    instrumentOptions: RecursivePartial<eventOptions>,
    step: number,
    previousOffset: number,
    un: string,
) => {
    const off = instrumentOptions.offset ? instrumentOptions.offset : 0
    const prevUn = usePrevious(un);
    // const now = timeObjFromEvent(step, off)
    // const fx1Trigg = triggFx?.[0];
    // const f1Opt = fxOptions[0]
    // const fx2Trigg = triggFx?.[1]
    // const f2Opt = fxOptions[1]
    // const fx3Trigg = triggFx?.[2]
    // const f3Opt = fxOptions?.[2]
    // const fx4Trigg = triggFx?.[3]
    // const f4Opt = fxOptions[3]
    const triggFx = triggObj?.effects
    const trig = triggObj?.instrument
    const fx1Trigg = triggObj?.effects[0];
    const f1Opt = fxOptions[0]
    const fx2Trigg = triggObj?.effects[1]
    const f2Opt = fxOptions[1]
    const fx3Trigg = triggObj?.effects[2]
    const f3Opt = fxOptions?.[2]
    const fx4Trigg = triggObj?.effects[3]
    const f4Opt = fxOptions[3]

    useEffect(() => {
        if (trig && un === prevUn) {
            // console.log('updating stuff')
            const now = timeObjFromEvent(step, off)
            trig.at(now, instrumentOptions)
        }
    }, [instrumentOptions, trig, un, prevUn, off])

    useEffect(() => {
        if (trig && un === prevUn && off !== previousOffset) {
            const now = timeObjFromEvent(step, off)
            const pastTime = timeObjFromEvent(step, previousOffset, false)
            trig.remove({ time: pastTime })
            trig.at(now, instrumentOptions)
            let i = 0;
            if (triggFx)
                while (i < triggFx.length) {
                    triggFx[i].remove({ time: pastTime })
                    triggFx[i].at(now, fxOptions[i])
                    i++
                }
        }
    }, [off, prevUn, previousOffset, instrumentOptions, trig, triggFx, fxOptions, un])

    useEffect(() => {
        if (un === prevUn && fx1Trigg && off === previousOffset) {
            const now = timeObjFromEvent(step, off)
            fx1Trigg.at(now, f1Opt)
        }
    }, [fx1Trigg, f1Opt, off, previousOffset, un, prevUn])


    useEffect(() => {
        if (un === prevUn && fx2Trigg && off === previousOffset) {
            const now = timeObjFromEvent(step, off)
            fx2Trigg.at(now, f2Opt)
        }
    }, [fx2Trigg, f2Opt, off, un, prevUn, previousOffset])


    useEffect(() => {
        if (un === prevUn && fx3Trigg && off === previousOffset) {
            const now = timeObjFromEvent(step, off)
            fx3Trigg.at(now, f3Opt)
        }
    }, [fx3Trigg, f3Opt, off, un, prevUn, previousOffset])


    useEffect(() => {
        if (un === prevUn && fx4Trigg && off === previousOffset) {
            const now = timeObjFromEvent(step, off)
            fx4Trigg.at(now, f4Opt)
        }
    }, [fx4Trigg, f4Opt, off, un, prevUn, previousOffset])
}