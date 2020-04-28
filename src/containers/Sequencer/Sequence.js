import React, { useContext, useState, useEffect, useRef } from 'react';
import sequencerContext from '../../context/sequencerContext';
import './Sequencer.scss'
import Steps from './Steps/Steps.js'
import StepsEdit from './Steps/StepsEdit'
import useSequence from '../../hooks/useSequencer';
import trackContext from '../../context/trackContext';

export const returnPartArray = (length) => {
    return [...Array(length).keys()].map(i => {
        return {time: `0:0:${i}`, velocity: 127}
    })
}

const Sequencer = (props) => {
    let SeqCtx = useContext(sequencerContext),
        TrkCtx = useContext(trackContext);
    const [sequencerState, setSequencer, removePattern, 
        addPattern, changeTrackLength, changePatternLength, 
        selectPattern, changePatternName, changePage, 
        setNote, setVelocity, selectStep, scheduleNextPattern] = useSequence()


    // Callback to update de sequencer context from within the Sequencer Container 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const updateSequencer = (newState) => {
        setSequencer(newState);
    };

    // Updating SequencerContext as Sequence component did mount
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        if (!SeqCtx.updateSequencerState) {
            SeqCtx.createCallback('updateSequencerState', updateSequencer);
        }
        if (sequencerState !== sequencerContext){
            SeqCtx.updateAll(sequencerState);
        }

    }, []);


    // Subscribing SequencerContext to any change in the Sequenecer Context
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        SeqCtx.updateAll(sequencerState);
    }, [sequencerState]);



    // Conditional components logic - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    const StepsComponent =  sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] ? 
        <Steps length={sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['length']} 
            events={sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['events']} 
            patternName={sequencerState[sequencerState.activePattern]['name']} 
            patternLength={sequencerState[sequencerState.activePattern]['patternLength']}
            activePattern = {sequencerState.activePattern} 
            selectStep={selectStep}
            selected={sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['selected']}
            page={sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['page']}></Steps> : 
        null ;

    const StepsToRender = sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] ? StepsComponent : <div className="steps"></div>;

    const TrackLength = sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] ? parseInt(sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['length']) : null

    const page = sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] ? sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack][['page']] : null;

        return(
            <div className="sequencer">
                { StepsToRender }
                <StepsEdit sequencerState={sequencerState} 
                        PatternLength={sequencerState[sequencerState.activePattern]['patternLength']}
                        TrackLength={TrackLength} 
                        changeTrackLength={changeTrackLength}
                        changePatternLength={changePatternLength} 
                        addPattern={addPattern}
                        selectPattern={selectPattern}
                        changePatternName={changePatternName}
                        activePattern={sequencerState.activePattern}
                        removePattern={removePattern}
                        page={page}
                        setNote={setNote}
                        changePage={changePage}
                        setVelocity={setVelocity}></StepsEdit>
                <p> {`${sequencerState[sequencerState.activePattern]['name']}`} </p>
            </div>
        )
}

export default Sequencer;