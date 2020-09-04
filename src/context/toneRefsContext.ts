import React, { useRef, MutableRefObject } from 'react'
import { PolySynth } from 'tone';
import { toneEffects } from '../store/Track/';
import Chain from '../lib/fxChain';

export interface toneRefs {
    [track: number]: {
        instrument?: PolySynth,
        effects: toneEffects[]
        chain: Chain;
    }
}

type trackRef = MutableRefObject<toneRefs> | undefined;

const toneRefsContext = React.createContext<trackRef>(undefined);

export default toneRefsContext;