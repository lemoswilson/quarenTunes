import React, { useRef, MutableRefObject, useState } from "react";
import { Provider } from "react-redux";
import { combineReducers, createStore, compose } from "redux";
import undoable, { newHistory, includeAction } from 'redux-undo';

import { trackActions } from '../../store/Track'
import { useLocation } from 'react-router-dom';

import ToneObjectsContext, { ToneObjects } from '../../context/ToneObjectsContext';
import AppContext from '../../context/AppContext';
import MenuContext from '../../context/MenuContext';
import DropdownContext, { dropdownContext } from '../../context/DropdownContext';

import { arrangerActions } from '../../store/Arranger'
import { arrangerReducer, initialState as ArrInit } from "../../store/Arranger";
import { trackReducer, initialState as TrkInit } from "../../store/Track";
import { sequencerReducer, initialState as SeqInit, sequencerActions } from "../../store/Sequencer";
import { transportReducer, initialState as TrsState, transportActions } from "../../store/Transport";
import { midiInputReducer, initialState as MidiState } from '../../store/MidiInput';
import { userProps } from '../../App';

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
    const ref_toneObjects: MutableRefObject<ToneObjects | null>  = useRef(null)
    const state  = useLocation<LayoutState | undefined>().state
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
                                </Provider>
                        </ToneObjectsContext.Provider>
                    </AppContext.Provider>
                </DropdownContext.Provider>
            </MenuContext.Provider>
        </React.Fragment >
    );
}

export default Xolombrisx;