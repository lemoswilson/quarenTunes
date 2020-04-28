import { useRef, useContext, useState } from 'react';
import trackContext from '../../context/trackContext';
import toneContext from '../../context/toneContext';
import sequencerContext from '../../context/sequencerContext';
import arrangerContext from '../../context/arrangerContext';

const useSequencer = () => {
    let Tone = useContext(Tone),
    TrkCtx = useContext(trackContext), 
    SeqCtx = useContext(sequencerContext),
    ArrCtx = useContext(arrangerContext),
    initPart = useRef(new Tone.Part());
    initPart = initPart.current

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
        copyed: null,
        },
    );

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
        let pat = useRef(new Tone.Part());
        pat = pat.current
        setSequencer(state => {
            let copyState = {...state};
            copyState[state.counter] = {
                name: `Pattern ${state.counter + 1}`,
                patternLength: 16,
                tracks: {},
                events: Array(16).fill({}),
            };
            [...Array(TrkCtx.trackCount).keys()].map(i => {
                copyState[state.counter]['tracks'][i] = {
                    length: 16,
                    triggState: pat,
                    events: Array(16).fill({}),
                    page: 0,
                    selected: [],
                }
                return 0;
            })
            copyState['counter'] = state.counter + 1;
            return copyState;
        })
    };

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

        if (Tone.Transport.state === 'started'){
            Object.keys(sequencerState[sequencerState.activePattern]['tracks']).map(track => {
                if (sequencerState[sequencerState.activePattern]['tracks'][track]) {
                    console.log('[Sequencer.js]: stoping tracks part,', sequencerState.activePattern);
                    sequencerState[sequencerState.activePattern]['tracks'][track].triggState.stop(0);
                    console.log('[Sequencer.js]: starting tracks part,', nextPattern);
                    sequencerState[nextPattern]['tracks'][track].triggState.start(0);
                    Tone.Transport.scheduleOnce(() => {
                        Tone.Transport.loopEnd = `0:0:${loopEnd}`
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
                    console.log('[Sequencer.js]: stopping part of track', track, 'pattern', sequencerState.activePattern);
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

    return [sequencerState, setSequencer, removePattern, addPattern, changeTrackLength, changePatternLength, selectPattern, changePatternName, changePage, setNote, setVelocity, selectStep, scheduleNextPattern]

};

export default useSequencer;