import React, { MutableRefObject } from 'react'
import { PolySynth, Part } from 'tone';
import { toneEffects } from '../store/Track';
import Chain from '../lib/fxChain';
import { returnInstrument } from '../containers/Xolombrisx';

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

export interface ToneObjects {
    tracks: trackObjects[],
    patterns: triggObjects,
}

class Dummy {
    current: ToneObjects | null;
    constructor(obj?: ToneObjects | null){
        if (obj)
            this.current = obj
        else
            this.current = {
                tracks: [{chain: new Chain(), effects: [], instrument: undefined}],
                patterns: {
                    0: [{instrument: new Part(), effects: []}]
                }
            }
    }
}

const ToneObjectsContext = React.createContext<MutableRefObject<ToneObjects | null> |  Dummy>(new Dummy(null));

export default ToneObjectsContext;