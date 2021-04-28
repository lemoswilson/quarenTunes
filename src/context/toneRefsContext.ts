import React, { MutableRefObject } from 'react'
import { PolySynth } from 'tone';
import { toneEffects } from '../store/Track/';
import Chain from '../lib/fxChain';
import { returnInstrument } from '../containers/Xolombrisx';

export interface toneRefs {
    // returnTy
    [trackId: number]: {
        // instrument?: any,
        // instrument?: Vtypeof returnInstrument,
        instrument?: ReturnType<typeof returnInstrument> | null,
        effects: toneEffects[]
        chain: Chain;
        // c: ReturnType
    }
}

type trackRef = MutableRefObject<toneRefs> | undefined;

const toneRefsContext = React.createContext<trackRef>(undefined);

export default toneRefsContext;