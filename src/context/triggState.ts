import React, { MutableRefObject } from 'react';
import { Part } from 'tone';

export interface triggContext {
    [pattern: number]: Part[],
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