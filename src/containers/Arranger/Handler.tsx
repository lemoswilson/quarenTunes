import React, {useContext, useEffect} from 'react';
import { event } from '../../store/Sequencer';
import ToneContext from '../../context/ToneObjectsContext'
import { useTrigg } from '../../hooks/store/useProperty'
import usePrevious from '../../hooks/usePrevious';

interface Handler {
    stepEvent: event,
    stepIndex: number,
    selectedTrk: number,
    un: string,
    arrgEventIdx: number,
}

const Handler: React.FC<Handler> = ({
    arrgEventIdx,
    selectedTrk,
    stepEvent,
    stepIndex,
    un,
}) => {
    const ref_toneObjects = useContext(ToneContext);
    const previousOffset = usePrevious(stepEvent.offset);

    // useEffect(() => {console.log(`event un ${un}`)}, [])

    useTrigg(
        ref_toneObjects.current?.arranger[arrgEventIdx][selectedTrk],
        stepEvent.fx,
        stepEvent.instrument,
        stepIndex,
        previousOffset,
        un, 
    )

    return (
        <React.Fragment>
        </React.Fragment>
    )
};

export default Handler;