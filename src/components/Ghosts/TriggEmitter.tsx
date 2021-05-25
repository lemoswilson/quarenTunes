import React, { useContext } from 'react';
import ToneObjectsContext from '../../context/ToneObjectsContext';
import useTriggEmitter from '../../hooks/emitters/useTriggEmitter';

const TriggEmitterComponent: React.FC = () => {
    const ref_toneObjects = useContext(ToneObjectsContext);

    useTriggEmitter(ref_toneObjects);
    return (
        <React.Fragment></React.Fragment>
    )
}

export default TriggEmitterComponent;