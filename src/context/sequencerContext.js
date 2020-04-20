import React from 'react';

let sequencerContext = React.createContext({
        0: {
            name: 'Pattern 1',
            patternLength: 16,
            tracks: {
                0: {
                    length: 16,
                    triggState: null,
                    }
                }
            },
        activePattern: 0,
        updateSequencerContext: () => {},
        addTrackToSequencer: () => {},
        createCallback: () => {},
        updateAll: () => {},
        });

export default sequencerContext;
    