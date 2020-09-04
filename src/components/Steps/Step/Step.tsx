import React from 'react';
import { useDispatch } from 'react-redux';
import { selectStep } from '../../../store/Sequencer'
import { RootState } from '../../../App';
import { defaultProps } from 'grommet';

interface StepProps {
    offset: number,
    activePattern: number,
    selectedTrack: number,
    selected: number[],
    index: number,
    tempo: number,
};

const Step: React.FC<StepProps> = ({ index, selected, activePattern, selectedTrack, tempo }) => {
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