import React, { useRef, useEffect, RefObject, MutableRefObject } from "react";
import { Provider } from "react-redux";
import { combineReducers, createStore, compose, $CombinedState } from "redux";
import undoable, { newHistory, includeAction } from 'redux-undo';
import Div100vh from 'react-div-100vh';

import Chain from '../../lib/fxChain';
import { trackActions } from '../../store/Track'
import triggEmitter, { triggEventTypes, ExtractTriggPayload } from '../../lib/triggEmitter';
import toneRefsEmitter, { trackEventTypes, ExtractTrackPayload } from '../../lib/toneRefsEmitter';
import dropdownEmitter, { dropdownEventTypes, ExtractDropdownPayload } from '../../lib/dropdownEmitter';

import TriggContext, { triggContext } from '../../context/triggState';
import toneRefsContext, { toneRefs } from '../../context/toneRefsContext';
import AppContext from '../../context/AppContext';
// import toneRefsEmitter, { trackEventTypes, ExtractTrackPayload } from '../../lib/myCustomToneRefsEmitter';

// import Tone from '../../lib/tone'
import * as Tone from 'tone';

import { arrangerActions } from '../../store/Arranger'
import { arrangerReducer, initialState as ArrInit } from "../../store/Arranger";
import { trackReducer, initialState as TrkInit, toneEffects } from "../../store/Track";
import { sequencerReducer, initialState as SeqInit, sequencerActions } from "../../store/Sequencer";
import { transportReducer, initialState as TrsState, transportActions } from "../../store/Transport";
import { midiInputReducer, initialState as MidiState } from '../../store/MidiInput';
import { timeObjFromEvent } from "../../lib/utility";
import { userProps } from '../../App';
import styles from './xolombrisx.module.scss'
import Sequencer from "../../containers/Sequencer";
import Track from '../../containers/Track';
import Playground from '../../components/Layout/Playground';
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
            trackActions.INSERT_EFFECT,
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

interface dropDownContext {
    [key: string]: () => void
}

const DropdownContext = React.createContext<any>({})

const Xolombrisx: React.FC<XolombrisxProps> = ({
    children,
    errorMessage,
    isAuthenticated,
    token,
    updateUser
}) => {

    const appRef = useRef<HTMLDivElement>(null);

    let triggRef = useRef<triggContext>({
        0: [{
            instrument: new Tone.Part(),
            effects: [new Tone.Part()]
        }]
    })

    let toneObjRef = useRef<toneRefs>({
        0: {
            effects: [],
            chain: new Chain(),
            instrument: undefined,
        }
    });

    let dropdownContextRef = useRef<dropDownContext>({})

    // context manager actions 
    const addPattern = (payload: ExtractTriggPayload<triggEventTypes.ADD_PATTERN>): void => {
        let patN = payload.pattern
        const selectedTrack = store.getState().track.present.selectedTrack;
        triggRef.current[patN] = [];
        [...Array(store.getState().track.present.trackCount).keys()].forEach((idx, track, arr) => {
            const effectsLength = store.getState().track.present.tracks[track].fx.length
            triggRef.current[patN][track] = {
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
        });
    };

    const duplicatePattern = (payload: ExtractTriggPayload<triggEventTypes.DUPLICATE_PATTERN>): void => {
        let patN = payload.pattern
        let counter = store.getState().sequencer.present.counter;
        [...Array(store.getState().track.present.trackCount).keys()]
            .forEach((v, track, arr) => {
                triggRef.current[counter][track].instrument = new Tone.Part()
                const fxLength = store.getState().track.present.tracks[track].fx.length
                let i = 0;
                while (i < fxLength) {
                    triggRef.current[counter][track].effects[i] = new Tone.Part()
                    i++
                }
                let events = store.getState().sequencer.present.patterns[patN].tracks[track].events
                events.forEach((e, idx, arr) => {
                    const time = timeObjFromEvent(idx, e)
                    triggRef.current[counter][track].instrument.at(time, e.instrument);
                    i = 0;
                    while (i < fxLength) {
                        triggRef.current[counter][track].effects[i].at(time, e.fx[i])
                        i++
                    }
                });
            })
    }

    const addEffectTrigg = (payload: ExtractTriggPayload<triggEventTypes.ADD_EFFECT>): void => {
        let [trackIndex, index] = [payload.trackIndex, payload.fxIndex];
        let patternCount = Object.keys(store.getState().sequencer.present.patterns).length;
        [...Array(patternCount).keys()].forEach(pat => {
            triggRef.current[pat][trackIndex].effects.splice(index, 0, new Tone.Part())
            // triggRef.current[pat][trackId].effects.push(new Tone.Part());
        });
    };

    const removeEffectTrigg = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_EFFECT>): void => {
        let [trackIndex, fxIndex] = [payload.trackIndex, payload.fxIndex];
        let patterns = Object.keys(store.getState().sequencer.present.patterns)
        let patternCount = Object.keys(store.getState().sequencer.present.patterns).length;
        patterns.forEach(pat => {
            triggRef.current[Number(pat)][trackIndex].effects.splice(fxIndex, 1);
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
            [triggRef.current[p][trackIndex].effects[to], triggRef.current[p][trackIndex].effects[from]] =
                [triggRef.current[p][trackIndex].effects[from], triggRef.current[p][trackIndex].effects[to]];
        });
    }


    const removePattern = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_PATTERN>): void => {
        const patN: number = payload.pattern;
        const selectedTrack: number = store.getState().track.present.selectedTrack;
        Object.values(triggRef.current[patN]).forEach(part => {
            part.instrument.dispose();
            let i = 0;
            // while (i < 4) {
            while (i < part.effects.length) {
                part.effects[i].dispose();
                i++
            }
        })
        delete triggRef.current[patN];
    };


    const addTrack = (payload: ExtractTriggPayload<triggEventTypes.ADD_TRACK>): void => {
        Object.keys(triggRef.current).forEach(patt => {
            triggRef.current[parseInt(patt)].splice(payload.trackIndex, 0, {
                instrument: new Tone.Part(),
                effects: []
            })
            // triggRef.current[parseInt(patt)][payload.trackId] = {
            //     instrument: new Tone.Part(),
            //     effects: []
            // }
        });
    };


    const removeTrack = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_TRACK>): void => {
        let trackIndex: number = payload.trackIndex;
        Object.keys(triggRef.current).forEach(patt => {
            triggRef.current[parseInt(patt)][trackIndex].instrument.dispose();
            const fxSize = store.getState().track.present.tracks[trackIndex].fx.length
            let i = 0;
            while (i < fxSize) {
                triggRef.current[parseInt(patt)][trackIndex].effects[i].dispose();
                i++
            }
            triggRef.current[parseInt(patt)].splice(trackIndex, 1)
            // delete triggRef.current[parseInt(patt)][trackIndex]
            // triggRef.current[parseInt(patt)].splice(trackId, 1);
        });
        toneObjRef.current[trackIndex].instrument?.dispose();
        toneObjRef.current[trackIndex].effects.forEach(v => v.dispose());
        toneObjRef.current[trackIndex].chain.dispose();
        delete toneObjRef.current[trackIndex]

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
        const [trackId, from, to] = [
            payload.trackId,
            payload.from,
            payload.to
        ]
        let prevFrom, prevTo, nextFrom, nextTo: Tone.Gain | toneEffects;

        if (to !== from) {
            const chain: Chain = toneObjRef.current[trackId].chain
            const effects: toneEffects[] = toneObjRef.current[trackId].effects;
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
        const [trackId, effectIndex] = [
            payload.trackId,
            payload.effectsIndex
        ];
        let prev, next: Tone.Gain | toneEffects;
        let chain: Chain = toneObjRef.current[trackId].chain;
        let effects: toneEffects[] = toneObjRef.current[trackId].effects

        if (effectIndex === effects.length - 1) next = chain.out
        else next = effects[effectIndex + 1]
        if (effectIndex === 0) prev = chain.in
        else prev = effects[effectIndex - 1]

        prev.disconnect();
        effects[effectIndex].disconnect();
        effects[effectIndex].dispose()
        effects.splice(effectIndex, 1)
        prev.connect(next);
    };

    const removeInstrument = (payload: ExtractTrackPayload<trackEventTypes.REMOVE_INSTRUMENT>): void => {
        const [trackId] = [payload.trackId];
        if (trackId) {
            toneObjRef.current[trackId].effects.forEach(v => { v.dispose() });
            toneObjRef.current[trackId].instrument?.dispose()
            delete toneObjRef.current[trackId];
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
        }
    }, [])

    return (
        <React.Fragment>
            <DropdownContext.Provider value={dropdownContextRef}>
                <AppContext.Provider value={appRef}>
                    <toneRefsContext.Provider value={toneObjRef}>
                        <TriggContext.Provider value={triggRef}>
                            <Provider store={store}>
                                <Div100vh className={styles.app}>
                                    <div ref={appRef} className={styles.wrapson}>
                                        <div className={styles.content}>
                                            <div className={styles.top}>
                                                <div className={styles.transport}></div>
                                            </div>
                                            <div className={styles.mid}>
                                                <div className={styles.arrangerColumn}>
                                                    <div className={styles.box}>
                                                        <Arranger />
                                                    </div>
                                                </div>
                                                <Track></Track>
                                            </div>
                                            <Sequencer></Sequencer>
                                            {/* <div className={styles.bottom}>
                                                <div className={styles.arrangerColumn}>
                                                    <div className={styles.patterns}></div>
                                                </div>
                                                <div className={styles.sequencerColumn}>
                                                    <div className={styles.box}>
                                                        <div className={styles.stepSequencer}></div>
                                                        <Playground></Playground>
                                                    </div>
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>
                                    {/* <Arranger></Arranger>
                                                                <Transport></Transport> */}
                                    {/* <Dummy></Dummy> */}
                                    {/* <Track></Track>
                                                                <Sequencer></Sequencer> */}
                                    {/* <Instruments id={0} index={0} midi={{ channel: undefined, device: undefined }} voice={instrumentTypes.FMSYNTH} options={getInitials(instrumentTypes.FMSYNTH)}></Instruments> */}
                                </Div100vh>
                            </Provider>
                        </TriggContext.Provider>
                    </toneRefsContext.Provider>
                </AppContext.Provider>
            </DropdownContext.Provider>
        </React.Fragment >
    );
}

export default Xolombrisx;