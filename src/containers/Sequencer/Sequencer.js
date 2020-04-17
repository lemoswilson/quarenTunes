import React, { useContext, useState, useEffect } from 'react';
import trackContext from '../../context/trackContext';
import toneContext from '../../context/toneContext';
import sequencerContext from '../../context/sequencerContext';
import './Sequencer.scss'
import Steps from './Steps/Steps.js'
import StepsEdit from './Steps/StepsEdit'
// import { useCallback } from 'react';

export const returnPartArray = (length) => {
    return [...Array(length).keys()].map(i => {
        return {time: `0:0:${i}`, velocity: 127}
    })
}

const Sequencer = (props) => {
    let TrackContext = useContext(trackContext);
    let Tone = useContext(toneContext);
    let SequencerContext = useContext(sequencerContext)
    const newPart = new Tone.Part(() => {}, returnPartArray(16));



    const [sequencerState, setSequencer] = useState({
        0: {
            name: 'Pattern 1',
            patternLength: 16,
            tracks: {
                0: {
                    length: 16,
                    triggState: newPart,
                    }
                }
            },
        activePattern: 0,
        },
    );

    const updateSequencer = (newState) => {
        setSequencer(newState);
    }

    // const updateSequencerState = useCallback(() => {
    //     SequencerContext.updateSequencerState(patterns.activePattern, patterns[patterns.activePattern]);
    // }, [patterns, TrackContext]);

    // useEffect(() => {
    //     SequencerContext.updateSequencerState(patterns.activePattern, patterns[patterns.activePattern]);
    // }, [patterns]);

    useEffect(() => {
        SequencerContext.createCallback('updateSequencerState', updateSequencer);
        if (sequencerState !== sequencerContext){
            SequencerContext.updateSequencerContext(sequencerState.activePattern, sequencerState[sequencerState.activePattern]);
        }
    }, []);

    const addPattern = () => {
        setSequencer(state => {
            let copyState = state;
            let keyNumbers = Object.keys(state);
            let lastNumber;
            for (const key in keyNumbers) {
                if (state[key] || keyNumbers !== 'activePattern'){
                    lastNumber = key;
                    continue
                } else if (!state[key]) {
                    copyState[key] = {
                        name: `Pattern ${key}`,
                        patternLength: 16,
                        tracks: {
                            0: {
                                length: 16,
                                triggState: new Tone.Part()
                                }
                            }
                        }
                    return copyState
                }
            }
            copyState[lastNumber + 1] = {
                name: `Pattern ${lastNumber + 1}`,
                patternLength: 16,
                tracks: {
                    0: {
                        length: 16,
                        triggState: new Tone.Part(),
                        }
                    }
                }
        })
    }

    const setNote = (note, time) => {
        setSequencer(state => {
            let copyState = state;
            copyState[state.activePattern][TrackContext.selectedTrack]['triggState']['  '][time].note = note;
        });
    };



    const changeLength = (newLength) => {
        setSequencer(state => {
            let stateCopy = state
            state[state.activePattern][TrackContext.selectedTrack]['length'] = newLength;
            return {
                ...stateCopy,
            }
        })
    }

    const StepsToRender = sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]? <Steps pattern={sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]['triggState']['_events']} patternName={sequencerState[sequencerState.activePattern]['name']} patternLength={sequencerState[sequencerState.activePattern]['length']} setNote={setNote}></Steps> : <div className="steps"></div>

    // const StepsToRender = SequencerContext[SequencerContext.activePattern]['tracks'][TrackContext.selectedTrack]? <Steps pattern={SequencerContext[SequencerContext.activePattern]['tracks'][TrackContext.selectedTrack]['triggState']['_events']} patternName={SequencerContext[SequencerContext.activePattern]['name']} patternLength={SequencerContext[SequencerContext.activePattern]['length']} setNote={setNote}></Steps> : <div className="steps"></div>

        return(
            <div className="sequencer">
                { StepsToRender }
                <StepsEdit length={sequencerState[sequencerState.activePattern]['patternLength']} changeLength={changeLength} addPattern={addPattern}></StepsEdit>
            </div>
        )
}

export default Sequencer;