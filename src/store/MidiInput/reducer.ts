import { MidiInputActionTypes, MidiInputActions, MidiState } from './types';
import produce from 'immer';
import { startEndRange } from '../../lib/utility';


export const initialState = {
    devices: {
        onboardKey: {all: Array(128).map(x => { return false })},
    },
    onboardRange: 4,
}

export function midiInputReducer(state: MidiState = initialState, action: MidiInputActionTypes) {
    return produce(state, (draft) => {
        switch (action.type) {
            case MidiInputActions.NOTE_ON:
                if (action.payload.channel === 'all' && action.payload.device !== 'onboardKey') {
                    startEndRange(0, 15).forEach(channel => {
                        action.payload.notes.forEach(index => {
                            draft.devices[action.payload.device][channel][index] = true
                        })
                    })
                } else {
                    action.payload.notes.forEach(index => {
                        draft.devices[action.payload.device][action.payload.channel][index] = true
                    })
                }
                break;
            case MidiInputActions.NOTE_OFF:
                if (action.payload.channel === 'all' && action.payload.device !== 'onboardKey') {
                    startEndRange(0,15).forEach(channel => {
                        action.payload.notes.forEach(index => {
                            draft.devices[action.payload.device][channel][index] = false;
                        })
                    })
                } else {
                    action.payload.notes.forEach(index => {
                        draft.devices[action.payload.device][action.payload.channel][index] = false
                    })
                }
                break;
            case MidiInputActions.PANIC:
                Object.keys(draft.devices[action.payload.device]).forEach(channel => {
                    draft.devices[action.payload.device][Number(channel)] = Array(128).map(x => false);
                })
                break;
            case MidiInputActions.ADD_DEVICE:
                if (!draft.devices[action.payload.device]) {
                    draft.devices[action.payload.device] = {
                        all: Array(128).map(x=> false)
                    } 
                    startEndRange(0, 15).forEach(channel => {
                        draft.devices[action.payload.device][channel] = Array(128).map(x => false);
                    })
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