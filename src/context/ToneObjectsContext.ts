import React, { MutableRefObject } from 'react'
import { PolySynth, Part } from 'tone';
import { toneEffects } from '../store/Track';
import Chain from '../lib/Tone/fxChain';
import { returnInstrument } from '../lib/Tone/initializers';

export interface triggs {
    instrument: Part
    effects: Part[]
}

export interface triggObjects {
    [patternId: number]: triggs[]
};

export interface trackObjects {
    instrument?: ReturnType<typeof returnInstrument> | null,
    effects: toneEffects[]
    chain: Chain;
}


export interface flagOption {
    callback: any,
    flag: boolean,
}

export interface flagObjects {
    instrument: flagOption,
    effects: flagOption[]
}

export interface ToneObjects {
    tracks: trackObjects[],
    patterns: triggObjects,
    arranger: triggs[][],
    flagObjects: flagObjects[],
}


class Dummy implements refWrapper<ToneObjects> {
    current: ToneObjects | null;
    constructor(obj?: ToneObjects | null){
        if (obj)
            this.current = obj
        else
            this.current = {
                tracks: [{chain: new Chain(), effects: [], instrument: undefined}],
                patterns: {
                    0: [{instrument: new Part(), effects: []}]
                },
                arranger: [],
                flagObjects: [{instrument: {callback: undefined, flag: false}, effects: [{callback: undefined, flag: false}]}]
            }
    }
}

export interface refWrapper<T> {
    current: T | null; 
}

const ToneObjectsContext = React.createContext<MutableRefObject<ToneObjects | null> |  Dummy>(new Dummy(null));

export default ToneObjectsContext;