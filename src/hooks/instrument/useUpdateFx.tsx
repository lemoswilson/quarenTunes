import { MutableRefObject, useEffect, useState, useContext } from 'react';
import { ToneObjectContextType } from '../../context/ToneObjectsContext';
import { returnEffect } from '../../lib/Tone/initializers';
import { Gain } from 'tone';
import { toneEffects } from '../../store/Track';
import usePrevious from '../lifecycle/usePrevious';

export const useUpdateFx = (
    trackIndex: number,
    fxIndex: number,
    fxId: number,
    type: any,
    // prev_type: any,
    options: any,
    ref_ToneEffect: MutableRefObject<ReturnType<typeof returnEffect> | null >,
    ref_options: MutableRefObject<any>,
    ref_toneObjects: ToneObjectContextType,
    effectCallback: (time: number, value: any) => void,
) => {
    const [firstRender, setRender] = useState(true);
    const prev_type = usePrevious(type)

    // add effect first render logic 
    useEffect(() => {
        if (firstRender) {
            // toneRefEmitter.emit(
            //     trackEventTypes.ADD_EFFECT,
            //     { effect: effectRef.current, trackId: trackId, effectIndex: index }
            // );
            ref_ToneEffect.current = returnEffect(type, options)
            
            if (ref_toneObjects.current) {
                let lgth = ref_toneObjects.current.tracks[trackIndex].effects.length;
                let chain = ref_toneObjects.current.tracks[trackIndex].chain;
                
                // ref_ToneEffect.current.chain()
                // ref_ToneEffect.current.disconnect()
                
                // splice actually pushes to array if index passed is === length

                ref_toneObjects.current.tracks[trackIndex].effects.splice(fxIndex, 0, ref_ToneEffect.current)

                Object.keys(ref_toneObjects.current.patterns).forEach(key => {
                    let k = parseInt(key);
                    if (ref_toneObjects.current){
                        ref_toneObjects.current.patterns[k][trackIndex].effects[fxIndex].callback = effectCallback
                    }

                });

                ref_toneObjects.current.arranger.forEach((_, idx, __) => {
                    if (ref_toneObjects.current) {
                        ref_toneObjects.current.arranger[idx][trackIndex].effects[fxIndex].callback = effectCallback;
                    }
                })

                // ref_toneObjects.current.flagObjects[trackIndex].effects.splice(fxIndex, 0, {callback: effectCallback, flag: false})
                ref_toneObjects.current.flagObjects[trackIndex].effects[fxIndex].callback = effectCallback;

                for (let i = 0; i < ref_toneObjects.current.tracks[trackIndex].effects.length ; i ++)
                    ref_toneObjects.current.tracks[trackIndex].effects[i].disconnect()

                ref_toneObjects.current.tracks[trackIndex].instrument?.disconnect()
                chain.in.disconnect()

                ref_toneObjects.current?.tracks[trackIndex].instrument?.chain(chain.in, ...ref_toneObjects.current.tracks[trackIndex].effects, chain.out)
            }
            setRender(false);
        }

    }, [])

    // change effect logic
    // should only change if previous effect
    // is different than current effect
    useEffect(() => {
        if (prev_type && prev_type !== type) {
            ref_ToneEffect.current = returnEffect(type, ref_options.current);
            // toneRefEmitter.emit(
            //     trackEventTypes.CHANGE_EFFECT,
            //     { effect: effectRef.current, trackId: trackId, effectsIndex: index }
            // );

            if (ref_toneObjects?.current) {
                const chain = ref_toneObjects.current.tracks[trackIndex].chain
                const effects = ref_toneObjects.current.tracks[trackIndex].effects;
                let prev, next: Gain | toneEffects;
                if (fxIndex === effects.length - 1) {
                    next = chain.out
                    if (fxIndex === 0) prev = chain.in;
                    else prev = effects[fxIndex - 1];
                } else {
                    next = effects[fxIndex + 1]
                    if (fxIndex === 0) prev = chain.in
                    else prev = effects[fxIndex - 1]
                }

                effects[fxIndex].disconnect();
                prev.disconnect()
                prev.connect(ref_ToneEffect.current);
                ref_ToneEffect.current.connect(next)
                effects[fxIndex].dispose();
                effects[fxIndex] = ref_ToneEffect.current;

                Object.keys(ref_toneObjects.current.patterns).forEach(key => {
                    let k = parseInt(key);
                    if (ref_toneObjects.current)
                        ref_toneObjects.current.patterns[k][trackIndex].effects[fxIndex].callback = effectCallback
                });

                ref_toneObjects.current?.arranger.forEach((_, idx, __) => {
                    if (ref_toneObjects.current)
                        ref_toneObjects.current.arranger[idx][trackIndex].effects[fxIndex].callback = effectCallback
                })


                ref_toneObjects.current.flagObjects[trackIndex].effects[fxIndex].callback = effectCallback;
                
            }
        }



    }, [
        type,
        fxId,
        fxIndex,
        trackIndex,
        ref_options
    ]);

}