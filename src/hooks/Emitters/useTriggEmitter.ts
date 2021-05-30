import React, { MutableRefObject, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ToneObjectContextType } from '../../context/ToneObjectsContext';
import triggEmitter, { triggEventTypes, ExtractTriggPayload } from '../../lib/Emitters/triggEmitter';
import * as Tone from 'tone';
import { timeObjFromEvent } from '../../lib/utility';
import { useEffectsLengthSelector, useTrkInfoSelector } from '../store/Track/useTrackSelector';
import { counterSelector, patternsSelector } from '../../store/Sequencer/selectors';
import { effectsLengthsSelector } from '../../store/Track/selectors';
import useQuickRef from '../lifecycle/useQuickRef';
import { triggs } from '../../context/ToneObjectsContext';
import { useActivePatt } from '../store/Sequencer/useSequencerSelectors';

const useTriggEmitter = (
    ref_toneObjects: ToneObjectContextType,
    // ref_arrgTriggs: MutableRefObject<triggs[][] | null>,
) => {
    // trackCount, fxLength, sequencer coutner, selectedTrk
    // patterns 
    const { ref_trkCount } = useTrkInfoSelector()
    const { ref_effectsLengths } = useEffectsLengthSelector()
    const counter = useSelector(counterSelector)
    const ref_counter = useQuickRef(counter);
    const patterns = useSelector(patternsSelector);
    const ref_patterns = useQuickRef(patterns);
    const { activePatt } = useActivePatt();

    const addPattern = (payload: ExtractTriggPayload<triggEventTypes.ADD_PATTERN>): void => {
        console.log('the trigger is emitting');
        let patN = payload.pattern
        // const trackCount = store.getState().track.present.trackCount
        const trackCount = ref_trkCount.current
        if (ref_toneObjects.current)
            ref_toneObjects.current.patterns[patN] = new Array(trackCount);

        [...Array(trackCount)].forEach((_, track, __) => {
            // const effectsLength = store.getState().track.present.tracks[track].fx.length
            const effectsLength = ref_effectsLengths.current[track]

            if (ref_toneObjects.current) {

                ref_toneObjects.current.patterns[patN][track] = {
                    effects: [...Array(effectsLength).keys()].map(v => new Tone.Part()),
                    instrument: new Tone.Part(),
                }

                ref_toneObjects.current.patterns[patN][track].instrument.callback = ref_toneObjects.current.flagObjects[track].instrument.callback;

                [...Array(effectsLength).keys()].forEach((_, idx, __) => {
                    if (ref_toneObjects.current)
                        ref_toneObjects.current.patterns[patN][track].effects[idx].callback = ref_toneObjects.current.flagObjects[track].effects[idx].callback;
                })
            }
        });
    };

    const duplicatePattern = (payload: ExtractTriggPayload<triggEventTypes.DUPLICATE_PATTERN>): void => {
        let patN = payload.pattern
        // let counter = store.getState().sequencer.present.counter;
        // let trackCount = store.getState().track.present.trackCount;
        let counter = ref_counter.current;
        let trackCount = ref_trkCount.current;

        [...Array(trackCount)]
            .forEach((v, track, arr) => {
                if (ref_toneObjects.current){
                    ref_toneObjects.current.patterns[counter].push(
                        {instrument: new Tone.Part(), effects: []}
                    )
                    // [track].instrument = new Tone.Part()
                    // const fxLength = store.getState().track.present.tracks[track].fx.length
                    const fxLength = ref_effectsLengths.current[track]
                    let i = 0;
                    while (i < fxLength) {
                        ref_toneObjects.current.patterns[counter][track].effects[i] = new Tone.Part()
                        i++
                    }

                    // let events = store.getState().sequencer.present.patterns[patN].tracks[track].events
                    let events = ref_patterns.current[patN].tracks[track].events
                    events.forEach((e, idx, arr) => {
                        const time = timeObjFromEvent(idx, e)
                        ref_toneObjects.current?.patterns[counter][track].instrument.at(time, e.instrument);
                        i = 0;
                        while (i < fxLength) {
                            ref_toneObjects.current?.patterns[counter][track].effects[i].at(time, e.fx[i])
                            i++
                        }
                    });
                }
            })
    }

    const addEffectTrigg = (payload: ExtractTriggPayload<triggEventTypes.ADD_EFFECT>): void => {

        let [trackIndex, index] = [payload.trackIndex, payload.fxIndex];
        console.log(`adding fx trig, index is ${index}`)

        if (ref_toneObjects.current) {
            Object.keys(ref_toneObjects.current.patterns).forEach((pat) => {
                console.log(`should be adding fx to pattern ${pat}`)
                const p = Number(pat)
                ref_toneObjects.current?.patterns[p][trackIndex].effects.splice(index, 0, new Tone.Part())
            });

            ref_toneObjects.current.patterns[activePatt][trackIndex].effects[index].start(0)
            ref_toneObjects.current.patterns[activePatt][trackIndex].effects[index].loopEnd = patterns[activePatt].tracks[trackIndex].length


            // ref_toneObjects.current.arranger.forEach((_, idx, __) => {
            //     console.log(`should be adding fx to arrg event idx ${idx}`)
            //     if (ref_toneObjects.current)
            //         ref_toneObjects.current.arranger[idx][trackIndex].effects.splice(index, 0, new Tone.Part())
            // })

            

            ref_toneObjects.current.flagObjects[trackIndex].effects.splice(index, 0, {callback: undefined, flag: false})

        }

    };

    const removeEffectTrigg = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_EFFECT>): void => {
        let [trackIndex, fxIndex] = [payload.trackIndex, payload.fxIndex];
        // let patterns = Object.keys(store.getState().sequencer.present.patterns)
        let patterns = Object.keys(ref_patterns.current)
        // let patternCount = Object.keys(store.getState().sequencer.present.patterns).length;

        patterns.forEach(pat => {
            ref_toneObjects.current?.patterns[Number(pat)][trackIndex].effects[fxIndex].dispose();
            ref_toneObjects.current?.patterns[Number(pat)][trackIndex].effects.splice(fxIndex, 1);
        })

        // ref_toneObjects.current?.arranger.forEach((_, idx, __) => {
        //     ref_toneObjects.current?.arranger[idx][trackIndex].effects[fxIndex].dispose();
        //     ref_toneObjects.current?.arranger[idx][trackIndex].effects.splice(fxIndex, 1);
        // })


        if (ref_toneObjects.current)
            ref_toneObjects.current.flagObjects[trackIndex].effects[fxIndex].flag = true

    }

    const changeEffectIndexTrigg = (payload: ExtractTriggPayload<triggEventTypes.CHANGE_EFFECT_INDEX>): void => {
        let [trackIndex, from, to] = [payload.trackIndex, payload.from, payload.to];
        // let patternCount = Object.keys(store.getState().sequencer.present.patterns).length;
        // let patterns = Object.keys(store.getState().sequencer.present.patterns);
        let patterns = Object.keys(ref_patterns.current);

        Object.keys(patterns).forEach(pat => {
            let p = Number(pat);
            if(ref_toneObjects.current)
            [ref_toneObjects.current.patterns[p][trackIndex].effects[to], ref_toneObjects.current.patterns[p][trackIndex].effects[from]] =
                [ref_toneObjects.current.patterns[p][trackIndex].effects[from], ref_toneObjects.current.patterns[p][trackIndex].effects[to]];
        });

        // ref_toneObjects.current?.arranger.forEach((_, idx, __) => {
        //     if (ref_toneObjects.current)
        //     [ref_toneObjects.current.arranger[idx][trackIndex].effects[from], ref_toneObjects.current.arranger[idx][trackIndex].effects[to]] = 
        //     [ref_toneObjects.current.arranger[idx][trackIndex].effects[to], ref_toneObjects.current.arranger[idx][trackIndex].effects[from]]
        // })

        if (ref_toneObjects.current)
            [ ref_toneObjects.current.flagObjects[trackIndex].effects[from],  ref_toneObjects.current.flagObjects[trackIndex].effects[to]  ] = 
            [ ref_toneObjects.current.flagObjects[trackIndex].effects[to],  ref_toneObjects.current.flagObjects[trackIndex].effects[from]  ]

    }


    const removePattern = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_PATTERN>): void => {
        const patN: number = payload.pattern;
        // const trackCount = store.getState().track.present.trackCount
        const trackCount = ref_trkCount.current;
        // const selectedTrack: number = store.getState().track.present.selectedTrack;
        if (ref_toneObjects.current){
            for (let i = 0; i < trackCount; i ++){
                ref_toneObjects.current.patterns[patN][i].instrument.dispose()
                for (let j = 0 ; j < ref_toneObjects.current.patterns[patN][i].effects.length ; j ++){
                    ref_toneObjects.current.patterns[patN][i].effects[j].dispose()
                }
            }
        }

        delete ref_toneObjects.current?.patterns[patN];
    };


    const addTrack = (payload: ExtractTriggPayload<triggEventTypes.ADD_TRACK>): void => {

        if (ref_toneObjects.current) {
            Object.keys(ref_toneObjects.current.patterns).forEach(patt => {
                ref_toneObjects.current?.patterns[parseInt(patt)].push({
                    instrument: new Tone.Part(),
                    effects: [new Tone.Part()],
                })
            });

            const l = ref_toneObjects.current.patterns[activePatt].length
            ref_toneObjects.current.patterns[activePatt][l-1].instrument.start(0);
            ref_toneObjects.current.patterns[activePatt][l-1].instrument.loopEnd = {'16n': 16};
            ref_toneObjects.current.patterns[activePatt][l-1].instrument.loop = true;

            ref_toneObjects.current.patterns[activePatt][l-1].effects[0].start(0)
            ref_toneObjects.current.patterns[activePatt][l-1].effects[0].loopEnd = {'16n': 16};
            ref_toneObjects.current.patterns[activePatt][l-1].effects[0].loop = true;

            // for (let i = 0; i < ref_toneObjects.current.arranger.length ; i ++)
            //     ref_toneObjects.current.arranger[i].push({
            //         instrument: new Tone.Part(),
            //         effects: [new Tone.Part()],
            //     })



            ref_toneObjects.current.flagObjects.push({instrument: {callback: undefined, flag: false}, effects: [{callback: undefined, flag: false}]})
        }

    };


    const removeTrack = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_TRACK>): void => {
        let trackIndex: number = payload.trackIndex;
        // const fxLen = store.getState().track.present.tracks[trackIndex].fx.length;
        const fxLen = ref_effectsLengths.current[trackIndex];
        if (ref_toneObjects.current) {
            // dispose of tracks and fx triggs in pattern obj as well as arranger obj
            // and set flag of objects and effects to true, so they can have their newPattern and newEvent emitters
            // removed
            Object.keys(ref_toneObjects.current.patterns).forEach(patt => {
                if ( ref_toneObjects.current && trackIndex < ref_toneObjects.current?.patterns[parseInt(patt)].length) {
                    ref_toneObjects.current?.patterns[parseInt(patt)][trackIndex].instrument.dispose();
                    // const fxSize = store.getState().track.present.tracks[trackIndex].fx.length
                    let i = 0;
                    // while (i < fxSize) {
                    while (i < fxLen) {
                        ref_toneObjects.current?.patterns[parseInt(patt)][trackIndex].effects[i].dispose();
                        i++
                    }
                    ref_toneObjects.current?.patterns[parseInt(patt)].splice(trackIndex, 1)
                }
            });


            // ref_toneObjects.current.arranger.forEach((_, idx,__) => {
            //     ref_toneObjects.current?.arranger[idx][trackIndex].instrument.dispose();
            //     [...Array(fxLen).keys()].forEach((_, fxIdx, __) => {
            //         ref_toneObjects.current?.arranger[idx][trackIndex].effects[fxIdx].dispose()

            //     })
            //     ref_toneObjects.current?.arranger[idx].splice(trackIndex, 1)
            // })

            ref_toneObjects.current.flagObjects.splice(trackIndex, 1)

            // ref_toneObjects.current.flagObjects[trackIndex].instrument.flag = true;
            // [...Array(fxLen).keys()].forEach((_, idx, __) => {
            //     if (ref_toneObjects.current)
            //         ref_toneObjects.current.flagObjects[trackIndex].effects[idx].flag = true;
            // })
        }

    };

    // const newEvent = (payload: ExtractTriggPayload<triggEventTypes.NEW_EVENT>): void => {
    //     // console.log(' new event, payload event index is:', payload.eventIndex);
    //     // const trackCount = store.getState().track.present.tracks.length;
    //     const trackCount = ref_trkCount.current;

    //     [...Array(trackCount).keys()].forEach((_, idx, __) => {
    //         // const fxCount = store.getState().track.present.tracks[idx].fx.length
    //         const fxCount = ref_effectsLengths.current[idx];
    //         if (ref_toneObjects.current) {
    //             console.log('should be setting callbacks of new event')
    //             ref_toneObjects.current.arranger[payload.eventIndex][idx].instrument.callback = ref_toneObjects.current.flagObjects[idx].instrument.callback;

    //             [...Array(fxCount).keys()].forEach((_, fxIdx, __) => {
    //                 if (ref_toneObjects.current)
    //                     ref_toneObjects.current.arranger[payload.eventIndex][idx].effects[fxIdx].callback = ref_toneObjects.current.flagObjects[idx].effects[fxIdx].callback;
    //             })
    //         }
    //     })

    // }

    useEffect(() => {
        triggEmitter.on(triggEventTypes.ADD_PATTERN, addPattern);
        triggEmitter.on(triggEventTypes.REMOVE_PATTERN, removePattern);
        triggEmitter.on(triggEventTypes.ADD_TRACK, addTrack);
        triggEmitter.on(triggEventTypes.REMOVE_TRACK, removeTrack);
        triggEmitter.on(triggEventTypes.DUPLICATE_PATTERN, duplicatePattern);
        triggEmitter.on(triggEventTypes.ADD_EFFECT, addEffectTrigg);
        triggEmitter.on(triggEventTypes.REMOVE_EFFECT, removeEffectTrigg);
        triggEmitter.on(triggEventTypes.CHANGE_EFFECT_INDEX, changeEffectIndexTrigg);
        // triggEmitter.on(triggEventTypes.NEW_EVENT, newEvent);

        return () => {
            triggEmitter.off(triggEventTypes.ADD_PATTERN, addPattern);
            triggEmitter.off(triggEventTypes.REMOVE_PATTERN, removePattern);
            triggEmitter.off(triggEventTypes.ADD_TRACK, addTrack);
            triggEmitter.off(triggEventTypes.REMOVE_TRACK, removeTrack);
            triggEmitter.off(triggEventTypes.DUPLICATE_PATTERN, duplicatePattern);
            triggEmitter.off(triggEventTypes.ADD_EFFECT, addEffectTrigg);
            triggEmitter.off(triggEventTypes.REMOVE_EFFECT, removeEffectTrigg);
            triggEmitter.off(triggEventTypes.CHANGE_EFFECT_INDEX, changeEffectIndexTrigg);
            // triggEmitter.off(triggEventTypes.NEW_EVENT, newEvent);
        }

    }, [])
}

export default useTriggEmitter;
