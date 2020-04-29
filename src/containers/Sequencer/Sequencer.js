import React, { useContext, useState, useEffect } from 'react';
import trackContext from '../../context/trackContext';
import toneContext from '../../context/toneContext';
import sequencerContext from '../../context/sequencerContext';
import './Sequencer.scss'
import Steps from './Steps/Steps.js'
import StepsEdit from './Steps/StepsEdit'
import arrangerContext from '../../context/arrangerContext';
// import { useCallback } from 'react';

export const returnPartArray = (length) => {
    return [...Array(length).keys()].map(i => {
        return {time: `0:0:${i}`, velocity: 127}
    })
}

const Sequencer = (props) => {
    // Initializing contexts and state - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    let TrkCtx = useContext(trackContext), 
        SeqCtx = useContext(sequencerContext),
        ArrCtx = useContext(arrangerContext),
        Tone = useContext(toneContext), 
        initPart = new Tone.Part();

    const [sequencerState, setSequencer] = useState({
        0: {
            name: 'Pattern 1',
            patternLength: 16,
            chainAfter: null,
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
        counter2: 1,
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
        console.log('[Sequencer.js]: updating sequencer context, state', sequencerState);
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
            copyState.counter2 = state.counter2 + 1;
            return copyState;
        });
        
    };

    const addPattern = () => {
        setSequencer(state => {
            let copyState = {...state};
            copyState[state.counter] = {
                chainAfter: null,
                name: `Pattern ${state.counter + 1}`,
                patternLength: 16,
                tracks: {},
            };
            [...Array(TrkCtx.trackCount).keys()].map(i => {
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
            copyState['counter2'] = state.counter2 + 1;
            return copyState;
        })
    }
    
    const changeTrackLength = (newLength, Ref) => {
        if (newLength <= 64 && newLength >= 1) {
            // Setting the new length in the Tone.Part object
            sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].loopEnd = `0:0:${newLength}`;
            // Setting the State
            setSequencer(state => {
                let eventArray = [...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events']];
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
                            [TrkCtx.selectedTrack]: {
                                ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack],
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
        if (newLength >= 1){
        // if (newLength <= 64 && newLength >= 1){

            // Setting the pattern loop if the current playing mode = pattern
            if (ArrCtx.mode === 'pattern') {
                Tone.Transport.loopEnd = `0:0:${newLength}`;
            }
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
        e.preventDefault();
        let nextPattern = e.target.value,
            loopEnd = parseInt(sequencerState[nextPattern]['patternLength']);

        // Sheduling pattern change if the transport is running
        // - - - - - - - - - - - - - - - - - - - -  - - - - - - 
        if (Tone.Transport.state === 'started'){
            Object.keys(sequencerState[sequencerState.activePattern]['tracks']).map(track => {
                if (sequencerState[sequencerState.activePattern]['tracks'][track]) {
                // Stopping the current playing pattern, and scheduling the next to start at 0;
                    sequencerState[sequencerState.activePattern]['tracks'][track].triggState.stop(0);
                    sequencerState[nextPattern]['tracks'][track].triggState.start(0);
                    Tone.Transport.scheduleOnce(() => {
                        // scheduling the new loop size (acordingly to the new length)
                        Tone.Transport.loopEnd = `0:0:${loopEnd}`
                        // muting the previous pattern, and unmuting the current one
                        sequencerState[sequencerState.activePattern]['tracks'][track].triggState.mute = true;
                        sequencerState[nextPattern]['tracks'][track].triggState.mute = false;
                    }, `0:0:0`)
                }
                return '';
            });
            Tone.Transport.scheduleOnce((time) => {
                Tone.Draw.schedule(() => {
                    setSequencer(state => {
                        let newState = {
                            ...state,
                            activePattern: parseInt(nextPattern),
                        }
                        return newState;
                    });
                }, time);
            }, '0:0:0')
        } else {
            Object.keys(sequencerState[sequencerState.activePattern]['tracks']).map(track => {
                if (sequencerState[sequencerState.activePattern]['tracks'][track]) {
                    sequencerState[sequencerState.activePattern]['tracks'][track].triggState.stop();
                }
                return '';
            });
            setSequencer(state => {
                let newState = {
                    ...state,
                    activePattern: parseInt(nextPattern),
                }
                return newState;
            });
        }
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
                        [TrkCtx.selectedTrack]: {
                            ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack],
                            page: parseInt(pageIndex),
                        }
                    }
                }
            }
            return copyState;
        })
    };

    const setNote = (note) => {
        sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'].map(index => {
            let time = `0:0:${index}`;
            let event = { ...sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].at(time) };
            if (note) {
                event['note'] = note;
                sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].at(time, event);
            } else {
                sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].remove(time);
            }
            return '';
        })

        setSequencer(state => {
            let copyState = {
                ...state, 
                [state.activePattern]: {
                    ...state[state.activePattern],
                    'tracks': {
                        ...state[state.activePattern]['tracks'],
                        [TrkCtx.selectedTrack]: {
                            ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack],
                            'events': [...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events']]
                        }
                    }
                }
            }
            state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'].map(e => {
                copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e] = {
                    ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e],
                    note: note,
                };
                return '';
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
                        [TrkCtx.selectedTrack]: {
                            ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack],
                            'events': [...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events']]
                        }
                    }
                }
            }
            state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'].map(e => {
                copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e] = {
                    ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e],
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
                        [TrkCtx.selectedTrack]: {
                            ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack],
                            selected: [...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['selected']],
                        }
                    }
                }
            };
            if (!copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'].includes(index)) {
                copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'].push(index); 
            } else {
                const newSelected = copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'].filter((element) => {
                    return element === index ? false : true;
                });
                copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'] = newSelected;
            }
            return copyState;
        });
    };

    // Transport scheduler handlers
    // - - - - - - - - - - - - - - - - -
    const scheduleNextPattern = (nextPattern) => {
        console.log('[Sequencer.js]: scheduleNextPattern');
        Object.keys(sequencerState[sequencerState.activePattern]['tracks']).map(track => {
            if(sequencerState[sequencerState.activePattern]['tracks'][track]) {
                sequencerState[sequencerState.activePattern]['tracks'][track]['triggState'].stop(); 
                return ''
            }
        })
        Object.keys(sequencerState[nextPattern]['tracks']).map(track => {
            if(sequencerState[nextPattern]['tracks'][track]) {
                console.log('[Sequencer.js]: triggStates',sequencerState[nextPattern]['tracks'][track]['triggState']);
                sequencerState[nextPattern]['tracks'][track]['triggState'].start(); 
                return ''
            }
        })
        setSequencer(state => {
            let newState = {
                ...state,
                activePattern: parseInt(nextPattern),
            }
            return newState;
        }); 
    }

    // Conditional components logic - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // const StepsComponent =  sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] ? 
    const StepsComponent =  sequencerState[sequencerState.activePattern] ? 
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