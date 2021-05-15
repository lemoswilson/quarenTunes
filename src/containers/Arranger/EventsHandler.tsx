import { getFinalStep, startEndRange } from '../../lib/utility';
import { event } from '../../store/Sequencer';
import React, { useEffect } from 'react';
import Handler from './Handler';

interface EventsHandlerProps {
    page: number,
    selectedTrkPattLen: number,
    stepEvents: event[]
    activePatt: number,
    selectedTrk: number,
    arrgEventIdx: number,
    arrgEventId: number,
    song: number,
    selectedTrkId: number,
}

const EventsHandler: React.FC<EventsHandlerProps> = ({
    stepEvents: events, 
    page, 
    selectedTrkPattLen,
    selectedTrk,
    selectedTrkId,
    song,
    arrgEventIdx,
    arrgEventId,
    activePatt,
}) => {

    // useEffect(() => {
    //     console.log(`get final step should be`, getFinalStep(page, selectedTrkPattLen));
    //     console.log(`events handler is mounted`)
    // }, [])

    return (
        <React.Fragment>
            {startEndRange(page * 16, getFinalStep(page, selectedTrkPattLen)).map(
                (step, idx, __) => {
                    // console.log(`should be rendering handler`);
                    return (
                        <Handler 
                            stepEvent={events[step]}
                            stepIndex={step}
                            selectedTrk={selectedTrk}
                            un={`song${song}:event:${arrgEventId}:pattern:${activePatt}:track:${selectedTrkId}step${step}`}
                            key={`song${song}:event:${arrgEventId}:pattern:${activePatt}:track:${selectedTrkId}step${step}`}
                            arrgEventIdx={arrgEventIdx}
                        />
                    )
                }
            )} 
        </React.Fragment>
    )
};

export default EventsHandler;