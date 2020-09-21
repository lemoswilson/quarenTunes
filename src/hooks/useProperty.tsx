import { useEffect, MutableRefObject } from 'react';
import { eventOptions, initialsArray, returnInstrument } from '../containers/Track/Instruments'
import { onlyValues } from '../lib/objectDecompose'
import { Part } from 'tone';
import { timeObjFromEvent } from '../lib/utility';

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

export const useTrigg = (
    trig: Part,
    obj: eventOptions,
    step: number,
    previousOffset: number
) => {
    const now = timeObjFromEvent(step, obj.offset)
    useEffect(() => {
        trig.at(now, obj)
    }, [obj, trig])

    useEffect(() => {
        const pastTime = timeObjFromEvent(step, previousOffset, false)
        trig.remove({ time: pastTime })
        trig.at(now, obj)
    }, [obj.offset])
}