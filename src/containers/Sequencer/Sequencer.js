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
        counter: 1,
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
}, [sequencerState]);

    const removePattern = () => {
        setSequencer(state => {
            let copyState = {...state};
            copyState[state.activePattern] = {...state[state.activePattern]};
            delete copyState[state.activePattern];
            if (copyState[copyState.activePattern - 1]) {
                copyState.activePattern = state.activePattern - 1
            } else {
                let lastNumber;
                Object.keys(state).map(key => {
                    if (parseInt(key) >= 0) {
                        lastNumber = parseInt(key);
                        return 0
                    }
                    return 0;
                });
                if (lastNumber) {
                    copyState.activePattern = lastNumber;
                }
            }
            return copyState;
        });
    };

    const addPattern = () => {
        setSequencer(state => {
            let copyState = {...state};
            copyState[state.counter] = {
                name: `Pattern ${state.counter + 1}`,
                patternLength: 16,
                tracks: {},
            };
            [...Array(TrackContext.trackCount).keys()].map(i => {
                copyState[state.counter]['tracks'][i] = {
                    length: 16,
                    triggState: new Tone.Part(() => {}, returnPartArray(16)),
                }
                return 0;
            })
            copyState['counter'] = state.counter + 1;
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
                            activePattern = {sequencerState.activePattern} 
                            setNote={setNote}></Steps> : null ;

    const StepsToRender = sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack] ? StepsComponent : <div className="steps"></div>;

    const selectPattern = (e) => {
        let valor = e.target.value
        setSequencer(state => {
            let newState = {
                ...state,
                activePattern: parseInt(valor),
            }
            return newState;
        })
    };

    const changePatternName = (name) => {
        setSequencer(state => {
            let copyState = {...state};
            copyState[state.activePattern] = {...state[state.activePattern]};
            copyState[state.activePattern]['name'] = name;
            return {
                ...state,
                ...copyState,
            };
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
                        changePatternName={changePatternName}
                        activePattern={sequencerState.activePattern}
                        removePattern={removePattern}></StepsEdit>
            </div>
        )
}

export default Sequencer;