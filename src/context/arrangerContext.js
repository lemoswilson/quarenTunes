import React from 'react';

const arrangerContext = React.createContext({
    mode: 'pattern',
    following: false,
    directChange: false,
    patternStartTime: 0,
    updateArrCtx: () => {},
})

export default arrangerContext;