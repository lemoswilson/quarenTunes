import { MidiInputActionTypes, MidiInputActions } from './types';

export function noteOn(notes: number[], device: string): MidiInputActionTypes {
    return {
        type: MidiInputActions.NOTE_ON,
        payload: {
            device: device,
            notes: notes,
        }
    }
};


export function noteOff(notes: number[], device: string): MidiInputActionTypes {
    return {
        type: MidiInputActions.NOTE_OFF,
        payload: {
            device: device,
            notes: notes,
        }
    }
};

export function panic(device: string): MidiInputActionTypes {
    return {
        type: MidiInputActions.PANIC,
        payload: {
            device: device,
        }
    }
};

export function addDevice(device: string): MidiInputActionTypes {
    return {
        type: MidiInputActions.ADD_DEVICE,
        payload: {
            device: device,
        }
    }
};


export function removeDevice(device: string): MidiInputActionTypes {
    return {
        type: MidiInputActions.REMOVE_DEVICE,
        payload: {
            device: device,
        }
    }
};

export function upOctaveKey(): MidiInputActionTypes {
    return {
        type: MidiInputActions.UP_OCTAVE_KEY,
    }
}


export function downOctaveKey(): MidiInputActionTypes {
    return {
        type: MidiInputActions.DOWN_OCTAVE_KEY,
    }
}