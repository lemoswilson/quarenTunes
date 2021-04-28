import { MidiInputActionTypes, MidiInputActions, MidiState } from './types';
import produce from 'immer';


export const initialState = {
    devices: {
        onboardKey: Array(128).map(x => { return false }),
    },
    onboardRange: 4,
}

export function midiInputReducer(state: MidiState = initialState, action: MidiInputActionTypes) {
    return produce(state, (draft) => {
        switch (action.type) {
            case MidiInputActions.NOTE_ON:
                action.payload.notes.forEach(index => {
                    draft.devices[action.payload.device][index] = true
                })
                break;
            case MidiInputActions.NOTE_OFF:
                console.log('noteoff');
                action.payload.notes.forEach(index => {
                    draft.devices[action.payload.device][index] = false
                })
                break;
            case MidiInputActions.PANIC:
                draft.devices[action.payload.device] = Array(128).map(x => false);
                break;
            case MidiInputActions.ADD_DEVICE:
                if (!draft.devices[action.payload.device]) {
                    draft.devices[action.payload.device] = Array(128).map(x => false);
                }
                break;
            case MidiInputActions.REMOVE_DEVICE:
                if (draft.devices[action.payload.device]) {
                    delete draft.devices[action.payload.device];
                }
                break;
            case MidiInputActions.UP_OCTAVE_KEY:
                if (draft.onboardRange < 9) draft.onboardRange = draft.onboardRange + 1;
                break;
            case MidiInputActions.DOWN_OCTAVE_KEY:
                if (draft.onboardRange > -3) draft.onboardRange = draft.onboardRange - 1;
                break;


        }
    })
}