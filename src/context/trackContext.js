import React from 'react';

let trackContext = React.createContext({
      getTrackRef: () => {},
      deleteTrackRef: () => {},
      forceRender: () => {},
    }
);

export default trackContext;