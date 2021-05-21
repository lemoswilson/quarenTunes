import { combineReducers, createStore, compose } from "redux";
import { Provider } from 'react-redux';
import { arrangerReducer, initialState as ArrInit, arrangerActions } from "./Arranger";
import { trackReducer, initialState as TrkInit, trackActions } from "./Track";
import { sequencerReducer, initialState as SeqInit, sequencerActions } from "./Sequencer";
import { transportReducer, initialState as TrsState, transportActions } from "./Transport";
import { midiInputReducer, initialState as MidiState } from './MidiInput';

import undoable, { newHistory, includeAction } from 'redux-undo';
import React from "react";

// export default {};

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

export default store;

// const WithStore: React.FC<{children?: React.ReactNode}> = ({children}) => {
//     return (
//         <React.Fragment>
//             <Provider store={store}>
//                 { children }
//             </Provider>
//         </React.Fragment>
//     )
// }

// export default WithStore;
