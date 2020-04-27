import React from 'react';

const transportContext = React.createContext({
    isPlaying: false,
    indicatorPosition: '0:0:0',
    bpm: 120,
    loopStart: 0,
    loopEnd: '4m',
    updateTrsCtx: () => {},
});

export default transportContext;