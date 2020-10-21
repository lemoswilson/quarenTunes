import React from 'react';
import Step from './Step/Step'
import { eventOptions } from '../../containers/Track/Instruments';
import { event } from '../../store/Sequencer'
import { range } from '../../lib/utility';

interface StepsProps {
    page: number,
    length: number,
    events: event[],
    activePattern: number,
    selectedTrack: number,
    selected: number[],
}

const Steps: React.FC<StepsProps> = ({
    activePattern,
    events,
    length,
    selected,
    page,
    selectedTrack,
    children
}) => {

    const finalStep = () => {
        if ((page === 0 && length <= 16)
            || (page === 1 && length <= 32)
            || (page === 2 && length <= 48)
        ) {
            return length - 1
        } else if (page === 1 && length > 32) {
            return 31
        } else if (page === 2 && length > 48) {
            return 47
        } else if (page === 2 && length > 16) {
            return 15
        }
    };

    return (
        <div>
            {range(page * 16, finalStep()).map(idx => {
                return <Step
                    activePattern={activePattern}
                    event={events[idx]}
                    index={idx}
                    selected={selected}
                    selectedTrack={selectedTrack}
                    tempo={idx + 1}
                    un={`${activePattern}:${selectedTrack}:${idx}`}
                    key={`${activePattern}:${selectedTrack}:${idx}`}
                // offset={}
                ></Step>// insert step component here
                // will also send events.offset pra cada um deles como offset props
            })}
        </div>
    )
};

export default Steps;