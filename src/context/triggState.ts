import React, { MutableRefObject } from 'react';
import { Part } from 'tone';

export interface triggFx {
    [index: number]: Part
}

export interface triggs {
    instrument: Part
    // effects: {
    //     0: Part,
    //     1: Part,
    //     2: Part,
    //     3: Part,
    // }
    // effects: triggFx
    effects: Part[]
}

export interface triggContext {
    [pattern: number]: triggs[],
};

class fakeTrig {
    current: triggContext;
    constructor() {
        this.current = {};
    };
}

type triggRef = MutableRefObject<triggContext> | fakeTrig;

const triggContext = React.createContext<triggRef>(new fakeTrig());

export default triggContext;