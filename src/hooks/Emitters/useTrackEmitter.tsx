import { useEffect } from 'react';
import { ToneObjectContextType } from '../../context/ToneObjectsContext';
import trackEmitter, {ExtractTrackPayload, trackEventTypes} from '../../lib/Emitters/trackEmitter';
import { toneEffects } from '../../store/Track';
import Chain from '../../lib/Tone/fxChain';
import * as Tone from 'tone';

const useTrackEmitter = (
    ref_toneObjects: ToneObjectContextType,
) => {

        // const addEffect = (payload: ExtractTrackPayload<trackEventTypes.ADD_EFFECT>): void => {
    //     const [trackId, effect, index] = [
    //         payload.trackId,
    //         payload.effect,
    //         payload.effectIndex
    //     ];
    //     let lgth: number = toneObjRef.current[trackId].effects.length;
    //     let chain: Chain = toneObjRef.current[trackId].chain;

    //     if (lgth > 0) {
    //         let from, to;
    //         if (index === lgth - 1) {
    //             from = toneObjRef.current[trackId].effects[lgth - 1];
    //             to = chain.out
    //         } else {
    //             from = toneObjRef.current[trackId].effects[index]
    //             to = toneObjRef.current[trackId].effects[index + 1]
    //         }
    //         if (from && to) {
    //             from.disconnect();
    //             from.connect(effect);
    //             effect.connect(to);
    //         }
    //     } else {
    //         chain.in.disconnect();
    //         chain.in.connect(effect);
    //         effect.connect(chain.out);
    //     }
    //     toneObjRef.current[trackId].effects.push(effect);
    // };

    // const addInstrument = (payload: ExtractTrackPayload<trackEventTypes.ADD_INSTRUMENT>): void => {
    //     console.log('adding instrument callback');
    //     const [trackId, instrument] = [
    //         payload.trackId,
    //         payload.instrument,
    //     ];
    //     toneObjRef.current[trackId] = {
    //         effects: [],
    //         instrument: instrument,
    //         chain: new Chain()
    //     }
    //     instrument.connect(toneObjRef.current[trackId].chain.in);
    // };

    // const changeEffect = (payload: ExtractTrackPayload<trackEventTypes.CHANGE_EFFECT>): void => {
    //     const [trackId, effect, effectIndex] = [
    //         payload.trackId,
    //         payload.effect,
    //         payload.effectsIndex
    //     ];
    //     const chain: Chain = toneObjRef.current[trackId].chain
    //     const effects: toneEffects[] = toneObjRef.current[trackId].effects;
    //     let prev, next: Tone.Gain | toneEffects;
    //     if (effectIndex === toneObjRef.current[trackId].effects.length - 1) {
    //         next = chain.out
    //         if (effectIndex === 0) prev = chain.in;
    //         else prev = effects[effectIndex - 1];
    //     } else {
    //         next = effects[effectIndex + 1]
    //         if (effectIndex === 0) prev = chain.in
    //         else prev = effects[effectIndex - 1]

    //     }
    //     effects[effectIndex].disconnect();
    //     prev.disconnect()
    //     prev.connect(effect);
    //     effect.connect(next)
    //     effects[effectIndex].dispose();
    //     effects[effectIndex] = effect;
    // };

    const changeEffectIndex = (payload: ExtractTrackPayload<trackEventTypes.CHANGE_EFFECT_INDEX>): void => {
        const [trackIndex, from, to] = [
            payload.trackIndex,
            payload.from,
            payload.to
        ]
        let prevFrom, prevTo, nextFrom, nextTo: Tone.Gain | toneEffects;

        if (to !== from) {
            if (ref_toneObjects.current){
                const chain: Chain = ref_toneObjects.current?.tracks[trackIndex].chain
                const effects: toneEffects[] = ref_toneObjects.current.tracks[trackIndex].effects;
                effects[from].disconnect();
                effects[to].disconnect()
    
    
                if (from === 0) prevFrom = chain.in;
                else prevFrom = effects[from - 1];
    
                if (to === 0) prevTo = chain.in;
                else prevTo = effects[to - 1];
    
                if (effects[from + 1]) nextFrom = effects[from + 1];
                else nextFrom = chain.out
    
                if (!effects[to + 1]) nextTo = effects[to + 1];
                else nextTo = chain.out
    
                if (to - from === 1) {
                    prevFrom.connect(nextFrom);
                    effects[from].connect(nextTo);
                    effects[to].connect(effects[from])
                } else if (from - to === 1) {
                    prevFrom.connect(nextFrom);
                    effects[from].connect(nextTo);
                    effects[to].connect(effects[from])
                }
                else {
                    prevFrom.connect(effects[to]);
                    effects[to].connect(nextFrom);
                    prevTo.connect(effects[from]);
                    effects[from].connect(nextTo);
                    [effects[to], effects[from]] = [effects[from], effects[to]];
                }
            }

        }
    };

    // const changeInstrument = (payload: ExtractTrackPayload<trackEventTypes.CHANGE_INSTRUMENT>): void => {
    //     const [trackId, instrument] = [payload.trackId, payload.instrument];
    //     const chain: Chain = toneObjRef.current[trackId].chain;
    //     toneObjRef.current[trackId].instrument?.disconnect();
    //     toneObjRef.current[trackId].instrument?.dispose();
    //     instrument.connect(chain.in);
    //     toneObjRef.current[trackId].instrument = instrument;
    // };

    const removeEffect = (payload: ExtractTrackPayload<trackEventTypes.REMOVE_EFFECT>): void => {
        const [trackIndex, effectIndex] = [
            payload.trackIndex,
            payload.effectsIndex
        ];
        if (ref_toneObjects.current){
            let prev, next: Tone.Gain | toneEffects;
            let chain: Chain = ref_toneObjects.current.tracks[trackIndex].chain;
            let effects: toneEffects[] = ref_toneObjects.current.tracks[trackIndex].effects
    
            if (effectIndex === effects.length - 1) next = chain.out
            else next = effects[effectIndex + 1]
            if (effectIndex === 0) prev = chain.in
            else prev = effects[effectIndex - 1]
    
            prev.disconnect();
            effects[effectIndex].disconnect();
            effects[effectIndex].dispose()
            ref_toneObjects.current.tracks[trackIndex].effects.splice(effectIndex, 1)
            prev.connect(next);
        }
    };

    const removeInstrument = (payload: ExtractTrackPayload<trackEventTypes.REMOVE_INSTRUMENT>): void => {
        const [trackIndex] = [payload.trackIndex];
        if (ref_toneObjects.current && trackIndex < ref_toneObjects.current.tracks.length){
            ref_toneObjects.current.tracks[trackIndex].instrument?.dispose()
            for (let i = 0; i < ref_toneObjects.current.tracks[trackIndex].effects.length ; i ++ ){
                ref_toneObjects.current.tracks[trackIndex].effects[i].dispose();
            }
            ref_toneObjects.current.tracks.splice(trackIndex,1);
        }
    };

    useEffect(() => {
        // toneRefsEmitter.off(trackEventTypes.ADD_EFFECT, addEffect);
        // toneRefsEmitter.off(trackEventTypes.ADD_INSTRUMENT, addInstrument);
        // toneRefsEmitter.off(trackEventTypes.CHANGE_EFFECT, changeEffect);
        // toneRefsEmitter.on(trackEventTypes.CHANGE_INSTRUMENT, changeInstrument);
        trackEmitter.on(trackEventTypes.CHANGE_EFFECT_INDEX, changeEffectIndex);
        trackEmitter.on(trackEventTypes.REMOVE_EFFECT, removeEffect);
        trackEmitter.on(trackEventTypes.REMOVE_INSTRUMENT, removeInstrument);

        return () => {
            // toneRefsEmitter.off(trackEventTypes.ADD_EFFECT, addEffect);
            // toneRefsEmitter.off(trackEventTypes.ADD_INSTRUMENT, addInstrument);
            // toneRefsEmitter.off(trackEventTypes.CHANGE_EFFECT, changeEffect);
            // toneRefsEmitter.off(trackEventTypes.CHANGE_INSTRUMENT, changeInstrument);
            trackEmitter.off(trackEventTypes.CHANGE_EFFECT_INDEX, changeEffectIndex);
            trackEmitter.off(trackEventTypes.REMOVE_EFFECT, removeEffect);
            trackEmitter.off(trackEventTypes.REMOVE_INSTRUMENT, removeInstrument);
        }
    }, [])

}

export default useTrackEmitter;