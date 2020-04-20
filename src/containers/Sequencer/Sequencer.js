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
    let TrackContext = useContext(trackContext), 
        Tone = useContext(toneContext), 
        SequencerContext = useContext(sequencerContext);

    const initPart = new Tone.Part(() => {}, returnPartArray(16));

    const [sequencerState, setSequencer] = useState({
        0: {
            name: 'Pattern 1',
            patternLength: 16,
            tracks: {
                0: {
                    length: 16,
                    triggState: initPart,
                    }
                }
            },
        activePattern: 0,
        },
    );

    const updateSequencer = (newState) => {
        setSequencer(newState);
    };

    useEffect(() => {
        SequencerContext.createCallback('updateSequencerState', updateSequencer);
        if (sequencerState !== sequencerContext){
            SequencerContext.updateAll(sequencerState);
        }
    }, []);

    useEffect(() => {
        SequencerContext.updateAll(sequencerState);
}, [sequencerState])

    const addPattern = () => {
        let lastNumber;
        Object.keys(sequencerState).map(keys => {
            if (parseInt(keys) >= 0 && sequencerState[keys]) {
                lastNumber = parseInt(keys);
            };
            return;
        });
        setSequencer(state => {
            let copyState = {...state};
            copyState[lastNumber + 1] = {
                name: `Pattern ${lastNumber + 2}`,
                patternLength: 16,
                tracks: {},
            };
            [...Array(TrackContext.trackCount).keys()].map(i => {
                copyState[lastNumber + 1]['tracks'][i] = {
                    length: 16,
                    triggState: new Tone.Part(() => {}, returnPartArray(16))
                }
            });
            return copyState;
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
        });
    };

    const StepsComponent =  sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack] ? <Steps pattern={sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]['triggState']['_events']} 
                            patternName={sequencerState[sequencerState.activePattern]['name']} 
                            patternLength={sequencerState[sequencerState.activePattern]['length']} 
                            setNote={setNote}></Steps> : null ;

    const StepsToRender = sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack] ? StepsComponent : <div className="steps"></div>;

    const selectPattern = (patternIndex) => {

    };

    const changePatternName = (name) => {
        setSequencer((state) => {
            let copyState = {...state};
            copyState[state.activePattern]['name'] = name;
            return copyState;
        })
    };

        return(
            <div className="sequencer">
                { StepsToRender }
                <StepsEdit sequencerState={sequencerState} 
                        length={sequencerState[sequencerState.activePattern]['patternLength']} 
                        changeLength={changeLength} 
                        addPattern={addPattern}
                        selectPattern={selectPattern}
                        changePatternName={changePatternName}></StepsEdit>
            </div>
        )
}

export default Sequencer;