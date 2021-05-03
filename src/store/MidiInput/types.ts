export interface MidiState {
    devices: {
        [device: string]: {
            [channel:number]: boolean[],
            all: boolean[],
        },
        // [device: string]: any[],
    }
    onboardRange: number,
}

export enum MidiInputActions {
    NOTE_ON = 'MIDI_ON',
    NOTE_OFF = "MIDI_OFF",
    PANIC = "PANIC",
    ADD_DEVICE = "ADD_DEVICE",
    REMOVE_DEVICE = "REMOVE_DEVICE",
    UP_OCTAVE_KEY = "UP_OCTAVE_KEY",
    DOWN_OCTAVE_KEY = "DOWN_OCTAVE_KEY",
};

export interface midiOnAction {
    type: MidiInputActions.NOTE_ON,
    payload: {
        notes: number[],
        device: string;
        channel: number | 'all',
    }
};

export interface midiOffAction {
    type: MidiInputActions.NOTE_OFF,
    payload: {
        notes: number[],
        device: string;
        channel: number | 'all',
    }
};

export interface panicAction {
    type: MidiInputActions.PANIC;
    payload: {
        device: string;
    }
}

export interface addDeviceAction {
    type: MidiInputActions.ADD_DEVICE,
    payload: {
        device: string,
    }
}

export interface removeDeviceAction {
    type: MidiInputActions.REMOVE_DEVICE,
    payload: {
        device: string,
    }
}

export interface upOctaveKeyAction {
    type: MidiInputActions.UP_OCTAVE_KEY,
}


export interface downOctaveKeyAction {
    type: MidiInputActions.DOWN_OCTAVE_KEY,
}

export const keyDict: { [key: string]: number } = {
    a: 0,
    s: 1,
    d: 2,
    f: 3,
    g: 4,
    h: 5,
    j: 6,
    k: 7,
    l: 8,
    z: 9,
    x: 10,
    c: 11,
    v: 12,
    b: 13,
    n: 14,
    m: 15
};


export const noteDict: { [key: string]: number } = {
    q: 0,
    '2': 1,
    w: 2,
    '3': 3,
    e: 4,
    r: 5,
    '5': 6,
    t: 7,
    '6': 8,
    y: 9,
    '7': 10,
    u: 11,
    i: 12,
};


export const numberNoteDict: { [key: number]: string } = {
    0: 'C',
    1: 'C#',
    2: 'D',
    3: 'D#',
    4: 'E',
    5: 'F',
    6: 'F#',
    7: 'G',
    8: 'G#',
    9: 'A',
    10: 'A#',
    11: 'B',
    12: 'C'
}

export const numberToNote = (note: number) => {
    const octave = Math.floor(note / 12) - 1;
    const noteName = numberNoteDict[note % 12]
    // console.log(`${noteName}${octave}`);
    return `${noteName}${octave}`;
}

export const blackOrWhite = (idx: number): number => {
    const reduced = idx % 12;
    const whites = [0, 2, 4, 5, 7, 9, 11];
    if (whites.includes(reduced)) return 1
    else return -1
}

export type MidiInputActionTypes = midiOnAction | midiOffAction | panicAction | addDeviceAction | removeDeviceAction | upOctaveKeyAction | downOctaveKeyAction;