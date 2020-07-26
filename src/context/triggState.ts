import React from 'react';
import { Part } from 'tone';

export interface triggContext {
    [pattern: number]: {
        [track: number]: Part
    }
};

const triggContext = React.createContext<any>({});

export default triggContext;