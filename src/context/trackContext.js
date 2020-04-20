import React from 'react';

let trackContext = React.createContext({
      getSelectedTrack: () => {},
      getTrackRef: () => {},
      deleteTrackRef: () => {},
      selectedTrack: 0,
      getTrackState: () => {},
      getInstrumentId: () => {},
      trackCount: 1,
    }
);

export default trackContext;