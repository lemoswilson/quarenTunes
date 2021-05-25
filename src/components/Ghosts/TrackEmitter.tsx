import React, { useContext } from 'react';
import useTrackEmitter from '../../hooks/emitters/useTrackEmitter';
import ToneObjectsContext from '../../context/ToneObjectsContext';

const TrackEmitterComponent = () => {
    const ref_toneObjects = useContext(ToneObjectsContext);

    useTrackEmitter(ref_toneObjects)

    return (
        <React.Fragment></React.Fragment>
    ) 
}

export default TrackEmitterComponent;