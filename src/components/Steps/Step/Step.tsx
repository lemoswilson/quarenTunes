import React, { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { eventOptions } from '../../../containers/Track/Instruments';
import { event } from '../../../store/Sequencer'
import TriggCtx from '../../../context/triggState'
import usePrevious from '../../../hooks/usePrevious';
import { useTrigg } from '../../../hooks/useProperty';
import { selectStep } from '../../../store/Sequencer'

interface StepProps {
    offset: number,
    activePattern: number,
    selectedTrack: number,
    selected: number[],
    index: number,
    tempo: number,
    event: event
};

const Step: React.FC<StepProps> = ({
    index,
    selected,
    activePattern,
    selectedTrack,
    tempo,
    event
}) => {
    const previousOffset = usePrevious(event.offset);
    const triggRefs = useContext(TriggCtx)

    useTrigg(
        triggRefs.current[activePattern][selectedTrack].instrument,
        triggRefs.current[activePattern][selectedTrack].effects,
        event.fx,
        event.instrument,
        index,
        previousOffset
    )

    const dispatch = useDispatch();
    const selStep = () => {
        dispatch(selectStep(activePattern, selectedTrack, index));
    };


    const sel = (): string => {
        if (selected.length >= 1 && selected.includes(index))
            return 'selected';
        else
            return '';
    }

    return (
        <div className={`step${sel()}`} onClick={selStep}>
            {tempo}
        </div>
    )
}

export default Step;