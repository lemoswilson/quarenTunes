import React, { useRef, useEffect, MutableRefObject, useState } from "react";
import WebMidiComponent from '../../components/Ghosts/WebMidi';
import TriggEmitterComponent from '../../components/Ghosts/TriggEmitter';
import TrackEmitterComponent from '../../components/Ghosts/TrackEmitter';
import DropdownEmitterComponent from '../../components/Ghosts/DropdownEmitter';
import MenuEmitterComponent from '../../components/Ghosts/MenuEmitter';
import { Provider } from "react-redux";
import { combineReducers, createStore, compose } from "redux";
import undoable, { newHistory, includeAction } from 'redux-undo';
import Div100vh from 'react-div-100vh';

import Chain from '../../lib/Tone/fxChain';
import { trackActions } from '../../store/Track'
import { useLocation } from 'react-router-dom';

import ToneObjectsContext, { ToneObjects } from '../../context/ToneObjectsContext';
import AppContext from '../../context/AppContext';
import MenuContext from '../../context/MenuContext';
import DropdownContext, { dropdownContext } from '../../context/DropdownContext';

import * as Tone from 'tone';

import { arrangerActions } from '../../store/Arranger'
import { arrangerReducer, initialState as ArrInit } from "../../store/Arranger";
import { trackReducer, initialState as TrkInit } from "../../store/Track";
import { sequencerReducer, initialState as SeqInit, sequencerActions } from "../../store/Sequencer";
import { transportReducer, initialState as TrsState, transportActions } from "../../store/Transport";
import { midiInputReducer, initialState as MidiState } from '../../store/MidiInput';
import { userProps } from '../../App';

import styles from '../../components/Layout/style.module.scss';

import Sequencer from "../../containers/Sequencer";
import Track from '../../containers/Track';
import Transport from '../../containers/Transport';
import Arranger from "../Arranger";
import Layout, { LayoutState } from '../../components/Layout';

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
export type ArrangerType = ReturnType<typeof arrangerReducer>;
export type SequencerType = ReturnType<typeof sequencerReducer>;
export type TrackType = ReturnType<typeof trackReducer>;


interface XolombrisxProps extends userProps {
    children?: React.ReactNode,
}

const Xolombrisx: React.FC<XolombrisxProps> = ({
    children,
    errorMessage,
    isAuthenticated,
    token,
    updateUser
}) => {

    const appRef = useRef<HTMLDivElement>(null);
    const [firstRender, setRender] = useState(true);
    const ref_toneObjects: MutableRefObject<ToneObjects | null>  = useRef(null)
    const state  = useLocation<LayoutState | undefined>().state

    // useEffect(() => {
    //     if (firstRender){
            
    //         ref_toneObjects.current = {
    //             tracks: [{chain: new Chain(), effects: [], instrument: undefined}],
    //             patterns: {
    //                 0: [{instrument: new Tone.Part(), effects: [new Tone.Part()]}]
    //             },
    //             arranger: [[{instrument: new Tone.Part(), effects: [new Tone.Part()]}]],
    //             flagObjects: [{instrument: {callback: undefined, flag: false}, effects: [{callback: undefined, flag: false}]}]
    //         }

    //         setRender(false)
    //     }
    // }, [])


    let ref_menus = useRef<any[]>([]);
    let ref_dropdowns = useRef<dropdownContext>({})

    return (
        <React.Fragment>
            <MenuContext.Provider value={ref_menus}>
                <DropdownContext.Provider value={ref_dropdowns}>
                    <AppContext.Provider value={appRef}>
                        <ToneObjectsContext.Provider value={ref_toneObjects}>
                                <Provider store={store}>
                                    <Layout
                                        appRef={appRef}
                                        arranger={state?.arranger}
                                        sequencer={state?.sequencer}
                                        track={state?.track}
                                    />
                                    {/* <Div100vh className={styles.app}>
                                        {
                                            !firstRender
                                            ? <div ref={appRef} className={styles.wrapson}>
                                                <WebMidiComponent/>
                                                <TriggEmitterComponent/>
                                                <TrackEmitterComponent/>
                                                <DropdownEmitterComponent/>
                                                <MenuEmitterComponent/>
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
                                    </Div100vh> */}
                                </Provider>
                        </ToneObjectsContext.Provider>
                    </AppContext.Provider>
                </DropdownContext.Provider>
            </MenuContext.Provider>
        </React.Fragment >
    );
}

export default Xolombrisx;