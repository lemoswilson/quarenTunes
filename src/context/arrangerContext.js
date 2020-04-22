import React from 'react';

const arrangerContext = React.createContext({
    mode: 'pattern',
    following: false,
    updateArrCtx: () => {},
})

export default arrangerContext;