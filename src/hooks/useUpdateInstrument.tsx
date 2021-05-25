import React, { MutableRefObject, useEffect } from 'react';
import { ToneObjectContextType } from '../context/ToneObjectsContext';
import Chain from '../lib/Tone/fxChain';
import { returnInstrument } from '../lib/Tone/initializers';
import { arrangerMode } from '../store/Arranger';
import { xolombrisxInstruments } from '../store/Track';

export const useUpdateInstrument = (
    ref_toneObjects: ToneObjectContextType,
    ref_ToneInstrument: MutableRefObject<ReturnType<typeof returnInstrument> | null>,
    ref_options: MutableRefObject<any>,
    index: number, 
    prev_voice: xolombrisxInstruments,
    voice: xolombrisxInstruments,
    activePatt: number,
    arrgMode: arrangerMode,
    trkPattsLen: {[key: number]: number},
    firstRender: boolean, 
    instrumentCallback: (time: number, value: any) => void,
    setRender: React.Dispatch<React.SetStateAction<boolean>>,
) => {


    useEffect(() => {

        if (firstRender && ref_toneObjects.current) {

            if (index >= ref_toneObjects.current.tracks.length) {

                ref_toneObjects.current.tracks.push({chain: new Chain(), effects: [], instrument: undefined})

                ref_toneObjects.current.tracks[index].instrument = ref_ToneInstrument.current;
                ref_ToneInstrument.current?.connect(ref_toneObjects.current.tracks[index].chain.in);

            } else if (index < ref_toneObjects.current.tracks.length && !ref_toneObjects.current.tracks[index].instrument) {

                ref_toneObjects.current.tracks[index].instrument = ref_ToneInstrument.current;
                ref_ToneInstrument.current?.connect(ref_toneObjects.current.tracks[index].chain.in);
            }

            ref_toneObjects.current.flagObjects[index].instrument.callback = instrumentCallback
            // ooooh dumb as fuck boooi, u have to create the new entry in the ref_toneTrigg before

            Object.keys(ref_toneObjects.current.patterns).forEach(key => {
                let k = parseInt(key)
                if (ref_toneObjects.current){
                    
                    ref_toneObjects.current.patterns[k][index].instrument.callback = instrumentCallback;
                    if (arrgMode === 'pattern' && k === activePatt) {
                        ref_toneObjects.current.patterns[k][index].instrument.start(0)
                        ref_toneObjects.current.patterns[k][index].instrument.loopEnd = {'16n': trkPattsLen[k]}
                    }

                }
            })

            ref_toneObjects.current.arranger.forEach((_, idx, __) => {
                if (ref_toneObjects.current){

                    ref_toneObjects.current.arranger[idx][index].instrument.callback = instrumentCallback;
                }
            })

            setRender(false);
        }

    }, []);

    // change instrument logic 
    useEffect(() => {
        if (prev_voice && prev_voice !== voice) {
            ref_ToneInstrument.current = returnInstrument(voice, ref_options.current);

            if (ref_toneObjects.current && index < ref_toneObjects.current.tracks.length && ref_toneObjects.current.tracks[index].instrument) {
                const inst = ref_toneObjects.current.tracks[index].instrument
                const chain = ref_toneObjects.current.tracks[index].chain;
                if (inst) {
                    inst.disconnect();
                    inst.dispose();
                }
                ref_ToneInstrument.current.connect(chain.in);
                ref_toneObjects.current.tracks[index].instrument = ref_ToneInstrument.current;

                // should be setting Part callback = instrumentCallback at each new render ? 
                Object.keys(ref_toneObjects.current.patterns).forEach(key => {
                    let keyNumber = parseInt(key);
                    if (ref_toneObjects.current)
                        ref_toneObjects.current.patterns[keyNumber][index].instrument.callback = instrumentCallback;
                });

                ref_toneObjects.current.arranger.forEach((_, idx, __) => {
                    if (ref_toneObjects.current){
                        ref_toneObjects.current.arranger[idx][index].instrument.callback = instrumentCallback;
                    }
                })
            }
        }

    }, [
        voice,
        index,
        ref_toneObjects,
        instrumentCallback,
        ref_options
    ]);

}
