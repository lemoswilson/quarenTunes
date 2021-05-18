import React, { MutableRefObject } from 'react';
import { refWrapper } from './ToneObjectsContext';

class Dummy implements refWrapper<number> {
    current: number | null;
    constructor(counter?: number){
        if (counter)
            this.current = counter;
        else 
            this.current = -1;
    }
}

const CounterContext = React.createContext<MutableRefObject<number | null > | Dummy>(new Dummy());

export default CounterContext;