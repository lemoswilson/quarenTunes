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
    // Initializing contexts and state - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    let TrackContext = useContext(trackContext), 
        Tone = useContext(toneContext), 
        SequencerContext = useContext(sequencerContext),
        initPart = new Tone.Part();

    const [sequencerState, setSequencer] = useState({
        0: {
            name: 'Pattern 1',
            patternLength: 16,
            tracks: {
                0: {
                    length: 16,
                    triggState: initPart,
                    events: Array(16).fill({}),
                    page: 0,
                    selected: [],
                    }
                }
            },
        activePattern: 0,
        counter: 1,
        copyed: null,
        },
    );

    // Callback to update de sequencer context from within the Sequencer Container 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const updateSequencer = (newState) => {
        setSequencer(newState);
    };

    // Updating SequencerContext as Sequence component did mount
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        SequencerContext.createCallback('updateSequencerState', updateSequencer);
        if (sequencerState !== sequencerContext){
            SequencerContext.updateAll(sequencerState);
        }
    }, []);

    // Subscribing SequencerContext to any change in the Sequenecer Context
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        SequencerContext.updateAll(sequencerState);
    }, [sequencerState]);


    // State editing methods that will be passed to STEPS EDIT
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
                events: Array(16).fill({}),
            };
            [...Array(TrackContext.trackCount).keys()].map(i => {
                copyState[state.counter]['tracks'][i] = {
                    length: 16,
                    triggState: new Tone.Part(),
                    events: Array(16).fill({}),
                    page: 0,
                    selected: [],
                }
                return 0;
            })
            copyState['counter'] = state.counter + 1;
            return copyState;
        })
    }
    
    const changeTrackLength = (newLength, Ref) => {
        if (newLength <= 64 && newLength >= 1) {
            setSequencer(state => {
                let eventArray = [...state[state.activePattern]['tracks'][TrackContext.selectedTrack]['events']];
                if (eventArray.length < newLength) {
                    let toAdd = Array(newLength - eventArray.length).fill({});
                    eventArray = eventArray.concat(toAdd);
                }
                let copyState = {
                    ...state,
                    [state.activePattern]: {
                        ...state[state.activePattern],
                        tracks: {
                            ...state[state.activePattern]['tracks'],
                            [TrackContext.selectedTrack]: {
                                ...state[state.activePattern]['tracks'][TrackContext.selectedTrack],
                                length: parseInt(newLength),
                                events: eventArray,
                            },
                        }
                    }
                };
                Ref.current.reset()
                return copyState;
            });
        }
    };

    const changePatternLength = (newLength, Ref) => {
        if (newLength <= 64 && newLength >= 1){
            setSequencer(state => {
                let copyState = {...state};
                copyState[state.activePattern] = {
                    ...state[state.activePattern]
                };
                copyState[state.activePattern]['patternLength'] = parseInt(newLength);
                Ref.current.reset();
                return copyState;
            })
        }
    };

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

    const changePage = (pageIndex) => {
        setSequencer(state => {
            let copyState = {
                ...state,
                [state.activePattern]: {
                    ...state[state.activePattern],
                    'tracks': {
                        ...state[state.activePattern]['tracks'],
                        [TrackContext.selectedTrack]: {
                            ...state[state.activePattern]['tracks'][TrackContext.selectedTrack],
                            page: parseInt(pageIndex),
                        }
                    }
                }
            }
            return copyState;
        })
    };

    const setNote = (note) => {
        sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]['selected'].map(index => {
            let time = `0:0:${index}`;
            let event = { ...sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]['triggState'].at(time) };
            event['note'] = note;
            sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]['triggState'].at(time, event);
        })

        setSequencer(state => {
            let copyState = {
                ...state, 
                [state.activePattern]: {
                    ...state[state.activePattern],
                    'tracks': {
                        ...state[state.activePattern]['tracks'],
                        [TrackContext.selectedTrack]: {
                            ...state[state.activePattern]['tracks'][TrackContext.selectedTrack],
                            'events': [...state[state.activePattern]['tracks'][TrackContext.selectedTrack]['events']]
                        }
                    }
                }
            }
            state[state.activePattern]['tracks'][TrackContext.selectedTrack]['selected'].map(e => {
                copyState[state.activePattern]['tracks'][TrackContext.selectedTrack]['events'][e] = {
                    ...state[state.activePattern]['tracks'][TrackContext.selectedTrack]['events'][e],
                    note: note,
                };
                return '';
                // copyState[state.activePattern]['tracks'][TrackContext.selectedTrack]['events'][e] = note;
            })
            return copyState
        })
    }

    const setVelocity = (velocity) => {
        setSequencer(state => {
            let copyState = {
                ...state, 
                [state.activePattern]: {
                    ...state[state.activePattern],
                    'tracks': {
                        ...state[state.activePattern]['tracks'],
                        [TrackContext.selectedTrack]: {
                            ...state[state.activePattern]['tracks'][TrackContext.selectedTrack],
                            'events': [...state[state.activePattern]['tracks'][TrackContext.selectedTrack]['events']]
                        }
                    }
                }
            }
            state[state.activePattern]['tracks'][TrackContext.selectedTrack]['selected'].map(e => {
                copyState[state.activePattern]['tracks'][TrackContext.selectedTrack]['events'][e] = {
                    ...state[state.activePattern]['tracks'][TrackContext.selectedTrack]['events'][e],
                    velocity: velocity,
                };
                return '';
                // copyState[state.activePattern]['tracks'][TrackContext.selectedTrack]['events'][e] = note;
            })
            return copyState
        })
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // State editing methods that will be passed to STEPS - - - 
    const selectStep = (index) => {
        setSequencer(state => {
            let copyState = {
                ...state,
                [state.activePattern]: {
                    ...state[state.activePattern],
                    'tracks': {
                        ...state[state.activePattern]['tracks'],
                        [TrackContext.selectedTrack]: {
                            ...state[state.activePattern]['tracks'][TrackContext.selectedTrack],
                            selected: [...state[state.activePattern]['tracks'][TrackContext.selectedTrack]['selected']],
                        }
                    }
                }
            };
            if (!copyState[state.activePattern]['tracks'][TrackContext.selectedTrack]['selected'].includes(index)) {
                copyState[state.activePattern]['tracks'][TrackContext.selectedTrack]['selected'].push(index); 
            } else {
                const newSelected = copyState[state.activePattern]['tracks'][TrackContext.selectedTrack]['selected'].filter((element) => {
                    return element === index ? false : true;
                });
                copyState[state.activePattern]['tracks'][TrackContext.selectedTrack]['selected'] = newSelected;
            }
            return copyState;
        });
    };

    // Conditional components logic - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    const StepsComponent =  sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack] ? 
        <Steps length={sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]['length']} 
            events={sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]['events']} 
            patternName={sequencerState[sequencerState.activePattern]['name']} 
            patternLength={sequencerState[sequencerState.activePattern]['patternLength']}
            activePattern = {sequencerState.activePattern} 
            selectStep={selectStep}
            selected={sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]['selected']}
            page={sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]['page']}></Steps> : 
        null ;

    const StepsToRender = sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack] ? StepsComponent : <div className="steps"></div>;

    const TrackLength = sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack] ? parseInt(sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack]['length']) : null

    const page = sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack] ? sequencerState[sequencerState.activePattern]['tracks'][TrackContext.selectedTrack][['page']] : null;

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
            </div>
        )
}

export default Sequencer;