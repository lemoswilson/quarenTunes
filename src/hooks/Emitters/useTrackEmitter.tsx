import { useEffect } from 'react';
import { ToneObjectContextType } from '../../context/ToneObjectsContext';
import trackEmitter, {ExtractTrackPayload, trackEventTypes} from '../../lib/Emitters/trackEmitter';
import { effectTypes, toneEffects } from '../../store/Track';
import Chain from '../../lib/Tone/fxChain';
import * as Tone from 'tone';
import { returnInstrument, returnEffect, reconnect } from '../../lib/Tone/initializers';
import { getEffectsInitials, getInitials } from '../../containers/Track/defaults';



const useTrackEmitter = (
    ref_toneObjects: ToneObjectContextType,
) => {

    const addEffect = (payload: ExtractTrackPayload<trackEventTypes.ADD_EFFECT>): void => {
        const [trackIndex, effect, effectIndex] = [
            payload.trackIndex,
            payload.effect,
            payload.effectIndex,
        ];

        if (ref_toneObjects.current) {
            ref_toneObjects.current.tracks[trackIndex].effects.splice(
               effectIndex, 
               0, 
               returnEffect(
                   effect, getEffectsInitials(effect)
                )
            )
            reconnect(ref_toneObjects, trackIndex)

        }
    };

    const addInstrument = (payload: ExtractTrackPayload<trackEventTypes.ADD_INSTRUMENT>): void => {
        
        console.log('[useTrackEmitter]: adding instrument callback');

        const [instrument] = [
            payload.instrument,
        ];

        if (ref_toneObjects.current) {
            ref_toneObjects.current.tracks.push({
                effects: [returnEffect(effectTypes.FILTER, getEffectsInitials(effectTypes.FILTER))],
                instrument: returnInstrument(instrument, getInitials(instrument)),
                chain: new Chain()
            })
            const length = ref_toneObjects.current.tracks.length

            ref_toneObjects.current.tracks[length-1].instrument?.chain(
                ref_toneObjects.current.tracks[length-1].chain.in, 
                ref_toneObjects.current.tracks[length-1].chain.out
            );
        }
    };

    const changeEffect = (payload: ExtractTrackPayload<trackEventTypes.CHANGE_EFFECT>): void => {
        const [trackIndex, effect, effectIndex] = [
            payload.trackIndex,
            payload.effect,
            payload.effectsIndex
        ];

        if (ref_toneObjects.current){
            ref_toneObjects.current.tracks[trackIndex].effects[effectIndex].dispose();
            ref_toneObjects.current.tracks[trackIndex].effects[effectIndex] = returnEffect(effect, getEffectsInitials(effect));

        }

        reconnect(ref_toneObjects, trackIndex);

    };

    const changeInstrument = (payload: ExtractTrackPayload<trackEventTypes.CHANGE_INSTRUMENT>): void => {
        const [trackIndex, instrument] = [payload.trackIndex, payload.instrument];
        if (ref_toneObjects.current){
            ref_toneObjects.current.tracks[trackIndex].instrument?.dispose();
            ref_toneObjects.current.tracks[trackIndex].instrument = returnInstrument(instrument, getInitials(instrument));

            reconnect(ref_toneObjects, trackIndex);
        }

    };

    const removeEffect = (payload: ExtractTrackPayload<trackEventTypes.REMOVE_EFFECT>): void => {
        const [trackIndex, effectIndex] = [
            payload.trackIndex,
            payload.effectsIndex
        ];

        if (ref_toneObjects.current){
            ref_toneObjects.current.tracks[trackIndex].effects.splice(effectIndex, 1);
            reconnect(ref_toneObjects, trackIndex);

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
        trackEmitter.on(trackEventTypes.ADD_EFFECT, addEffect);
        trackEmitter.on(trackEventTypes.ADD_INSTRUMENT, addInstrument);
        trackEmitter.on(trackEventTypes.CHANGE_EFFECT, changeEffect);
        trackEmitter.on(trackEventTypes.CHANGE_INSTRUMENT, changeInstrument);
        trackEmitter.on(trackEventTypes.REMOVE_EFFECT, removeEffect);
        trackEmitter.on(trackEventTypes.REMOVE_INSTRUMENT, removeInstrument);

        return () => {
            trackEmitter.off(trackEventTypes.ADD_EFFECT, addEffect);
            trackEmitter.off(trackEventTypes.ADD_INSTRUMENT, addInstrument);
            trackEmitter.off(trackEventTypes.CHANGE_EFFECT, changeEffect);
            trackEmitter.off(trackEventTypes.CHANGE_INSTRUMENT, changeInstrument);
            trackEmitter.off(trackEventTypes.REMOVE_EFFECT, removeEffect);
            trackEmitter.off(trackEventTypes.REMOVE_INSTRUMENT, removeInstrument);
        }
    }, [])

}

export default useTrackEmitter;