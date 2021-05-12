import React, { useRef, useEffect, MutableRefObject, useState } from "react";
import WebMidiComponent from '../../lib/WebMidi';
import { Provider } from "react-redux";
import { combineReducers, createStore, compose } from "redux";
import undoable, { newHistory, includeAction } from 'redux-undo';
import Div100vh from 'react-div-100vh';

import Chain from '../../lib/fxChain';
import { trackActions, effectTypes } from '../../store/Track'
import triggEmitter, { triggEventTypes, ExtractTriggPayload } from '../../lib/triggEmitter';
import toneRefsEmitter, { trackEventTypes, ExtractTrackPayload } from '../../lib/toneRefsEmitter';
import dropdownEmitter, { dropdownEventTypes, ExtractDropdownPayload } from '../../lib/dropdownEmitter';
import MenuEmitter, { menuEmitterEventTypes, ExtractMenuPayload } from "../../lib/MenuEmitter";

import ToneObjectsContext, { ToneObjects } from '../../context/ToneObjectsContext';
import AppContext from '../../context/AppContext';
import MenuContext from '../../context/MenuContext';
import InputContext from '../../context/InputContext';
import DropdownContext, { dropDownContext } from '../../context/DropdownContext';
import ToneContext from '../../context/ToneContext';

// import * as Tone from 'tone';
import Tone from '../../lib/tone';

import { arrangerActions } from '../../store/Arranger'
import { arrangerReducer, initialState as ArrInit } from "../../store/Arranger";
import { trackReducer, initialState as TrkInit, toneEffects, xolombrisxInstruments } from "../../store/Track";
import { sequencerReducer, initialState as SeqInit, sequencerActions } from "../../store/Sequencer";
import { transportReducer, initialState as TrsState, transportActions } from "../../store/Transport";
import { midiInputReducer, initialState as MidiState } from '../../store/MidiInput';
import { timeObjFromEvent } from "../../lib/utility";
import { onlyValues } from '../../lib/objectDecompose';
import DrumRackInstrument from '../../lib/DrumRack';
import { userProps } from '../../App';
import styles from './xolombrisx.module.scss'

import Sequencer from "../../containers/Sequencer";
import Track from '../../containers/Track';
import Transport from '../../containers/Transport';

import { initialsArray, effectsInitials, effectsInitialsArray } from '../../containers/Track/Instruments/'
import Arranger from "../Arranger";

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const arrangerHistory = newHistory([], ArrInit, [])
const sequencerHistory = newHistory([], SeqInit, [])
const trackHistory = newHistory([], TrkInit, [])
const transportHistory = newHistory([], TrsState, [])

export const returnInstrument = (voice: xolombrisxInstruments, opt: initialsArray) => {
    let options = onlyValues(opt);

    switch (voice) {
        case xolombrisxInstruments.AMSYNTH:
            return new Tone.PolySynth(Tone.AMSynth, options);
        case xolombrisxInstruments.FMSYNTH:
            return new Tone.PolySynth(Tone.FMSynth, options);
        case xolombrisxInstruments.MEMBRANESYNTH:
            return new Tone.PolySynth(Tone.MembraneSynth, options);
        case xolombrisxInstruments.METALSYNTH:
            return new Tone.PolySynth(Tone.MetalSynth, options);
        case xolombrisxInstruments.NOISESYNTH:
            return new Tone.NoiseSynth(options);
        // case xolombrisxInstruments.PLUCKSYNTH:
        //     return new Tone.PluckSynth(options);
        case xolombrisxInstruments.DRUMRACK:
            // return new DrumRackInstrument(opt)
            return new DrumRackInstrument(options)
        default:
            return new Tone.Sampler();
    }
}

export const returnEffect = (type: effectTypes, opt: effectsInitialsArray) => {
    let options = onlyValues(opt);

    switch (type) {
        case effectTypes.AUTOFILTER:
            return new Tone.AutoFilter(options);
        case effectTypes.AUTOPANNER:
            return new Tone.AutoPanner(options);
        case effectTypes.BITCRUSHER:
            return new Tone.BitCrusher(options);
        case effectTypes.CHEBYSHEV:
            return new Tone.Chebyshev(options);
        case effectTypes.CHORUS:
            return new Tone.Chorus(options);
        case effectTypes.COMPRESSOR:
            return new Tone.Compressor(options);
        case effectTypes.DISTORTION:
            return new Tone.Distortion(options);
        case effectTypes.EQ3:
            return new Tone.EQ3(options);
        case effectTypes.FEEDBACKDELAY:
            return new Tone.FeedbackDelay(options);
        case effectTypes.FILTER:
            return new Tone.Filter(options);
        case effectTypes.FREEVERB:
            return new Tone.Freeverb(options);
        case effectTypes.FREQUENCYSHIFTER:
            return new Tone.FrequencyShifter(options);
        case effectTypes.GATE:
            return new Tone.Gate(options);
        case effectTypes.JCREVERB:
            return new Tone.JCReverb(options);
        case effectTypes.LIMITER:
            return new Tone.Limiter(options);
        case effectTypes.MULTIBANDCOMPRESSOR:
            return new Tone.MultibandCompressor(options);
        case effectTypes.PHASER:
            return new Tone.Phaser(options)
        case effectTypes.PINGPONGDELAY:
            return new Tone.PingPongDelay(options)
        case effectTypes.PITCHSHIFT:
            return new Tone.PitchShift(options)
        case effectTypes.STEREOWIDENER:
            return new Tone.StereoWidener(options)
        case effectTypes.TREMOLO:
            return new Tone.Tremolo(options)
        case effectTypes.VIBRATO:
            return new Tone.Vibrato(options)
        default:
            return new Tone.Vibrato(options)
    }
}

export const rootReducer = combineReducers({
    arranger: undoable(arrangerReducer, {
        filter: includeAction([
            arrangerActions.SET_TRACKER,
            arrangerActions.SET_TIMER
        ])
    }),
    track: undoable(trackReducer, {
        filter: includeAction([
            trackActions.SELECT_MIDI_CHANNEL,
            trackActions.SELECT_MIDI_DEVICE,
            trackActions.SELECT_INSTRUMENT,
            trackActions.ADD_INSTRUMENT,
            trackActions.DELETE_EFFECT,
            trackActions.ADD_EFFECT,
            trackActions.REMOVE_INSTRUMENT,
        ])
    }),
    sequencer: undoable(sequencerReducer, {
        filter: includeAction([
            sequencerActions.ADD_EFFECT_SEQUENCER,
            sequencerActions.ADD_INSTRUMENT_TO_SEQUENCER,
            sequencerActions.CHANGE_PAGE,
            sequencerActions.CHANGE_TRACK_LENGTH,
            sequencerActions.CHANGE_PATTERN_LENGTH,
            sequencerActions.REMOVE_EFFECT_SEQUENCER,
            sequencerActions.REMOVE_INSTRUMENT_FROM_SEQUENCER,
            // trackActions.REMOVE_INSTRUMENT,
            sequencerActions.GO_TO_ACTIVE,
        ])
    }),
    transport: undoable(transportReducer, {
        filter: includeAction([transportActions.RECORD, transportActions.START, transportActions.STOP])
    }),
    midi: midiInputReducer,
});

const store = createStore(rootReducer, {
    arranger: arrangerHistory,
    sequencer: sequencerHistory,
    track: trackHistory,
    transport: transportHistory,
    midi: MidiState,
}, composeEnhancers());

export type RootState = ReturnType<typeof rootReducer>;

interface XolombrisxProps extends userProps {
    children?: React.ReactNode,
}

// interface dropDownContext {
//     [key: string]: () => void
// }

// export const DropdownContext = React.createContext<any>({})

const Xolombrisx: React.FC<XolombrisxProps> = ({
    children,
    errorMessage,
    isAuthenticated,
    token,
    updateUser
}) => {

    // const context = useRef(new Tone.Context({ latencyHint: 'balanced', lookAhead: 0.5 }))
    const appRef = useRef<HTMLDivElement>(null);
    const [firstRender, setRender] = useState(true);

    // let triggRef = useRef<triggContext>({
    //     0: [{
    //         instrument: new Tone.Part(),
    //         effects: [new Tone.Part()]
    //     }]
    // })

    const ref_toneObjects: MutableRefObject<ToneObjects | null>  = useRef(null)

    useEffect(() => {
        ref_toneObjects.current = {
            tracks: [{chain: new Chain(), effects: [], instrument: undefined}],
            patterns: {
                0: [{instrument: new Tone.Part(), effects: [new Tone.Part()]}]
            }
        }
        setRender(false)
    }, [])

    // 0: {
    //     effects: [],
    //     chain: new Chain(),
    //     instrument: undefined,
    // }

    let menuRef = useRef<any[]>([]);
    let inputsRef = useRef<any[]>([]);


    let dropdownContextRef = useRef<dropDownContext>({})

    // context manager actions 
    const addPattern = (payload: ExtractTriggPayload<triggEventTypes.ADD_PATTERN>): void => {
        let patN = payload.pattern
        const selectedTrack = store.getState().track.present.selectedTrack;
        const trackCount = store.getState().track.present.trackCount
        if (ref_toneObjects.current)
            ref_toneObjects.current.patterns[patN] = new Array(trackCount);

        [...Array(trackCount)].forEach((idx, track, arr) => {
            const effectsLength = store.getState().track.present.tracks[track].fx.length
            if (ref_toneObjects.current) {
                ref_toneObjects.current.patterns[patN][track] = {
                    effects: Array(effectsLength).map(v => new Tone.Part()),
                    instrument: new Tone.Part(),
                }
                // triggRef.current[patN][track].instrument = new Tone.Part();
                // let i = 0;
                // while (i < 4) {
                // while (i < triggRef.current[patN][track].effects.length) {
                // while (i < store.getState().track.present.tracks[selectedTrack].fx.length) {
                //     triggRef.current[patN][track].effects[i] = new Tone.Part();
                //     i++
                // }
            }
        });
    };

    const duplicatePattern = (payload: ExtractTriggPayload<triggEventTypes.DUPLICATE_PATTERN>): void => {
        let patN = payload.pattern
        let counter = store.getState().sequencer.present.counter;
        let trackCount = store.getState().track.present.trackCount;

        [...Array(trackCount)]
            .forEach((v, track, arr) => {
                if (ref_toneObjects.current){
                    ref_toneObjects.current.patterns[counter].push(
                        {instrument: new Tone.Part(), effects: []}
                    )
                    // [track].instrument = new Tone.Part()
                    const fxLength = store.getState().track.present.tracks[track].fx.length
                    let i = 0;
                    while (i < fxLength) {
                        ref_toneObjects.current.patterns[counter][track].effects[i] = new Tone.Part()
                        i++
                    }

                    let events = store.getState().sequencer.present.patterns[patN].tracks[track].events
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
        let patternCount = Object.keys(store.getState().sequencer.present.patterns).length;
        [...Array(patternCount).keys()].forEach(pat => {
            ref_toneObjects.current?.patterns[pat][trackIndex].effects.splice(index, 0, new Tone.Part())
        });
    };

    const removeEffectTrigg = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_EFFECT>): void => {
        let [trackIndex, fxIndex] = [payload.trackIndex, payload.fxIndex];
        let patterns = Object.keys(store.getState().sequencer.present.patterns)
        let patternCount = Object.keys(store.getState().sequencer.present.patterns).length;
        patterns.forEach(pat => {
            ref_toneObjects.current?.patterns[Number(pat)][trackIndex].effects.splice(fxIndex, 1);
        })
        // [...Array(patternCount).keys()].forEach(pat => {
        //     triggRef.current[pat][trackId].effects.splice(index, 1);
        // });
    }

    const changeEffectIndexTrigg = (payload: ExtractTriggPayload<triggEventTypes.CHANGE_EFFECT_INDEX>): void => {
        let [trackIndex, from, to] = [payload.trackIndex, payload.from, payload.to];
        let patternCount = Object.keys(store.getState().sequencer.present.patterns).length;
        let patterns = Object.keys(store.getState().sequencer.present.patterns);
        Object.keys(patterns).forEach(pat => {
            let p = Number(pat);
            if(ref_toneObjects.current)
            [ref_toneObjects.current.patterns[p][trackIndex].effects[to], ref_toneObjects.current.patterns[p][trackIndex].effects[from]] =
                [ref_toneObjects.current.patterns[p][trackIndex].effects[from], ref_toneObjects.current.patterns[p][trackIndex].effects[to]];
        });
    }


    const removePattern = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_PATTERN>): void => {
        const patN: number = payload.pattern;
        const trackCount = store.getState().track.present.trackCount
        const selectedTrack: number = store.getState().track.present.selectedTrack;
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
        if (ref_toneObjects.current)
            Object.keys(ref_toneObjects.current.patterns).forEach(patt => {
                ref_toneObjects.current?.patterns[parseInt(patt)].push({
                    instrument: new Tone.Part(),
                    effects: [],
                })
            });
    };


    const removeTrack = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_TRACK>): void => {
        let trackIndex: number = payload.trackIndex;
        if (ref_toneObjects.current)
            Object.keys(ref_toneObjects.current.patterns).forEach(patt => {
                if ( ref_toneObjects.current && trackIndex < ref_toneObjects.current?.patterns[parseInt(patt)].length) {
                    ref_toneObjects.current?.patterns[parseInt(patt)][trackIndex].instrument.dispose();
                    const fxSize = store.getState().track.present.tracks[trackIndex].fx.length
                    let i = 0;
                    while (i < fxSize) {
                        ref_toneObjects.current?.patterns[parseInt(patt)][trackIndex].effects[i].dispose();
                        i++
                    }
                    ref_toneObjects.current?.patterns[parseInt(patt)].splice(trackIndex, 1)
                }
            });
    };

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
            effects.splice(effectIndex, 1)
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

    const escapeDropdown = (payload: ExtractDropdownPayload<dropdownEventTypes.ESCAPE>): void => {
        Object.keys(dropdownContextRef.current).forEach(k => {
            dropdownContextRef.current[k]();
            delete dropdownContextRef.current[k]
        })
    }

    const openDropdown = (payload: ExtractDropdownPayload<dropdownEventTypes.OPEN>): void => {
        // console.log('hsould be openig');
        dropdownContextRef.current[payload.id] = payload.openClose;
    }

    const removeDropdown = (payload: ExtractDropdownPayload<dropdownEventTypes.REMOVE>): void => {
        delete dropdownContextRef.current[payload.id];
    }

    const openMenu = (payload: ExtractMenuPayload<menuEmitterEventTypes.OPEN>): void => {
        console.log('should be opening menu');
        menuRef.current = [payload.id, payload.close]
    }

    const closeMenu = (payload: ExtractMenuPayload<menuEmitterEventTypes.CLOSE>): void => {
        if (menuRef.current.length > 0){
            menuRef.current[1]((state: any) => !state)
            menuRef.current = []
        }
    }

    function onClick(this: HTMLDocument, e: MouseEvent) {
        closeMenu({})
    }

    useEffect(() => {
        document.addEventListener('click', onClick)
        return () => {
            document.removeEventListener('click', onClick)
        }
    }, [])

    useEffect(() => {
        // console.log('setting event emitter');
        triggEmitter.on(triggEventTypes.ADD_PATTERN, addPattern);
        triggEmitter.on(triggEventTypes.REMOVE_PATTERN, removePattern);
        triggEmitter.on(triggEventTypes.ADD_TRACK, addTrack);
        triggEmitter.on(triggEventTypes.REMOVE_TRACK, removeTrack);
        triggEmitter.on(triggEventTypes.DUPLICATE_PATTERN, duplicatePattern);
        triggEmitter.on(triggEventTypes.ADD_EFFECT, addEffectTrigg);
        triggEmitter.on(triggEventTypes.REMOVE_EFFECT, removeEffectTrigg);

        // toneRefsEmitter.on(trackEventTypes.ADD_EFFECT, addEffect);
        // toneRefsEmitter.on(trackEventTypes.ADD_INSTRUMENT, addInstrument);
        // toneRefsEmitter.on(trackEventTypes.CHANGE_EFFECT, changeEffect);
        toneRefsEmitter.on(trackEventTypes.CHANGE_EFFECT_INDEX, changeEffectIndex);
        // toneRefsEmitter.on(trackEventTypes.CHANGE_INSTRUMENT, changeInstrument);
        toneRefsEmitter.on(trackEventTypes.REMOVE_EFFECT, removeEffect);
        toneRefsEmitter.on(trackEventTypes.REMOVE_INSTRUMENT, removeInstrument);

        dropdownEmitter.on(dropdownEventTypes.ESCAPE, escapeDropdown)
        dropdownEmitter.on(dropdownEventTypes.OPEN, openDropdown)
        dropdownEmitter.on(dropdownEventTypes.REMOVE, removeDropdown)

        MenuEmitter.on(menuEmitterEventTypes.OPEN, openMenu)
        MenuEmitter.on(menuEmitterEventTypes.CLOSE, closeMenu)

        return () => {
            triggEmitter.off(triggEventTypes.ADD_PATTERN, addPattern);
            triggEmitter.off(triggEventTypes.REMOVE_PATTERN, removePattern);
            triggEmitter.off(triggEventTypes.ADD_TRACK, addTrack);
            triggEmitter.off(triggEventTypes.REMOVE_TRACK, removeTrack);
            triggEmitter.off(triggEventTypes.DUPLICATE_PATTERN, duplicatePattern);
            triggEmitter.off(triggEventTypes.ADD_EFFECT, addEffectTrigg);
            triggEmitter.off(triggEventTypes.REMOVE_EFFECT, removeEffectTrigg);


            // toneRefsEmitter.off(trackEventTypes.ADD_EFFECT, addEffect);
            // toneRefsEmitter.off(trackEventTypes.ADD_INSTRUMENT, addInstrument);
            // toneRefsEmitter.off(trackEventTypes.CHANGE_EFFECT, changeEffect);
            toneRefsEmitter.off(trackEventTypes.CHANGE_EFFECT_INDEX, changeEffectIndex);
            // toneRefsEmitter.off(trackEventTypes.CHANGE_INSTRUMENT, changeInstrument);
            toneRefsEmitter.off(trackEventTypes.REMOVE_EFFECT, removeEffect);
            toneRefsEmitter.off(trackEventTypes.REMOVE_INSTRUMENT, removeInstrument);

            dropdownEmitter.off(dropdownEventTypes.ESCAPE, escapeDropdown)
            dropdownEmitter.off(dropdownEventTypes.OPEN, openDropdown)
            dropdownEmitter.off(dropdownEventTypes.REMOVE, removeDropdown)

            MenuEmitter.off(menuEmitterEventTypes.OPEN, openMenu)
            MenuEmitter.off(menuEmitterEventTypes.CLOSE, closeMenu)

        }
    }, [])


    return (
        <React.Fragment>
            <ToneContext.Provider value={Tone}>
                <InputContext.Provider value={inputsRef}>
                    <MenuContext.Provider value={menuRef}>
                        <DropdownContext.Provider value={dropdownContextRef}>
                            <AppContext.Provider value={appRef}>
                                <ToneObjectsContext.Provider value={ref_toneObjects}>
                                        <Provider store={store}>
                                            <Div100vh className={styles.app}>
                                                {
                                                    !firstRender
                                                    ? <div ref={appRef} className={styles.wrapson}>
                                                        <WebMidiComponent/>
                                                        <div className={styles.content}>
                                                            <div className={styles.top}>
                                                                <div className={styles.transport}>
                                                                    <Transport/>
                                                                </div>
                                                            </div>
                                                            <div className={styles.gap}></div>
                                                            <div className={styles.mid}>
                                                                <div className={styles.arrangerColumn}>
                                                                    <div className={styles.box}>
                                                                        <Arranger />
                                                                    </div>
                                                                </div>
                                                                <Track></Track>
                                                            </div>
                                                            <Sequencer></Sequencer>
                                                        </div>
                                                    </div>
                                                    : null
                                                }
                                            </Div100vh>
                                        </Provider>
                                </ToneObjectsContext.Provider>
                            </AppContext.Provider>
                        </DropdownContext.Provider>
                    </MenuContext.Provider>
                </InputContext.Provider>
            </ToneContext.Provider>
        </React.Fragment >
    );
}

export default Xolombrisx;