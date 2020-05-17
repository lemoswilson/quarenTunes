import React, { useContext, useState, useEffect, useRef } from 'react';
import trackContext from '../../context/trackContext';
import toneContext from '../../context/toneContext';
import sequencerContext from '../../context/sequencerContext';
import './Sequencer.scss'
import Steps from './Steps/Steps.js'
import StepsEdit from './Steps/StepsEdit'
import arrangerContext from '../../context/arrangerContext';
import transportContext from '../../context/transportContext';
import usePrevious from '../../hooks/usePrevious';

export const returnPartArray = (length) => {
    return [...Array(length).keys()].map(i => {
        return {time: `0:0:${i}`, velocity: 127}
    })
}

const to16 = (time) => {
    let result = Number(),
    timeArray = time.split(':');
    timeArray.forEach((value, index, array) => {
        if (index === 0) {
            result = result + parseInt(value)*16
        } else if (index === 1) {
            result = result + parseInt(value)*4
        } else {
            result = result + parseInt(value)
        }
    });
    return result;
}

const Sequencer = (props) => {
    // Initializing contexts and state - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    let TrkCtx = useContext(trackContext), 
        SeqCtx = useContext(sequencerContext),
        ArrCtx = useContext(arrangerContext),
        Tone = useContext(toneContext),
        TrsCtx = useContext(transportContext),
        isPlaying = TrsCtx.isPlaying,
        previousPlaying = usePrevious(isPlaying),
        arrangerMode = ArrCtx.mode,
        patternTracker = ArrCtx.patternTracker,
        isFollowing = ArrCtx.following;
        

    const [sequencerState, setSequencer] = useState({
        0: {
            name: 'Pattern 1',
            patternLength: 16,
            tracks: {
                0: {
                    length: 16,
                    triggState: new Tone.Part(),
                    events: Array(16).fill({}),
                    page: 0,
                    selected: [],
                    }
                }
            },
        activePattern: 0,
        followSchedulerID: null,
        counter: 1,
        counter2: 1,
        copyed: null,
        }
    );
    let activePatternRef = useRef(sequencerState.activePattern);
    let selectedTrack = TrkCtx.selectedTrack;
    let selectedTrackRef = TrkCtx.selectedTrackRef;
    let activePageRef = useRef(0);
    let sequencerEvents = Object.keys(sequencerState[activePatternRef.current]['tracks']).map(track => {
            if (track){
                return sequencerState[activePatternRef.current]['tracks'][track]['events'];
            }
        });
    let eventsRef = useRef(sequencerEvents);
    let selected = selectedTrackRef && selectedTrackRef.current ? sequencerState[sequencerState.activePattern]['tracks'][selectedTrackRef.current]['selected']: sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'] ; 
    let selectedRef = useRef(selected);
    let schedulerID = sequencerState.followSchedulerID;

    // setting subscription of the events ref to the sequencerEvents;
    useEffect(() => {

    }, [selectedTrack])

    // setting subscripition of the seleted ref to the sequencerEvents
    useEffect(() => {
        if (selectedRef.current !== selected) {
            selectedRef.current = [...selected];
        }
    }, [selected])
    // Set following scheduler
    // - - - - - - - - - - - - - - - 
    useEffect(() => {
        let newSchedulerId,
            schedulerPart;
        if (isFollowing && !schedulerID && arrangerMode === 'song'){
            // newSchedulerId = Tone.Transport.scheduleRepeat(() => {
            //     goToActive();
            //     console.log('[Arranger.js]: scheduling repeat patternTracker', patternTracker);
            // }, "16n", "0");
            schedulerPart = new Tone.Part(() => {
                goToActive();
                // console.log('[Sequencer.js]: scheduling repeat patternTracker', patternTracker.current);
            }, [0]);
            schedulerPart.start(0);
            schedulerPart.loop = true;
            schedulerPart.loopEnd = '16n';
            newSchedulerId = 1;
            setSequencer(state => ({
                ...state,
                followSchedulerID: newSchedulerId,
            }))
        } else if ((!isFollowing && schedulerID) || (!isPlaying && previousPlaying)) {
            // Tone.Transport.clear(schedulerID);
            setSequencer(state => ({
                ...state,
                followSchedulerID: null,
            }))
        }
    }, [isFollowing, schedulerID, isPlaying, previousPlaying, arrangerMode]);
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
            SeqCtx.createCallback('parameterLock', parameterLock);
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

    // Subscribing event Refs to any change in its events
    // - - - - - - -  - - - - - - - - - - - - - - - -  -
    useEffect(() => {
        sequencerEvents.forEach((v,i,a) => {
            if (TrkCtx[i][4] != v){
            TrkCtx.getTrackEventRef(i, v);
            }
        })
    }, [sequencerEvents])

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



    const goToActive = () => {
        let nowTime = Tone.Transport.position.split('.')[0];
        let pageToGo = null,
        patternToUse = patternTracker.current[0] ? patternTracker.current[0] : ArrCtx['songs'][ArrCtx.selectedSong]['events'][0]['pattern'] ,
        timeb = patternTracker.current[1] ? patternTracker.current[1] : 0,
        patternToGo = patternToUse;
        let timeBBS = Tone.Time(timeb, 's').toBarsBeatsSixteenths(),
            step = to16(nowTime) - to16(timeBBS),
            patternLocation = step % parseInt(sequencerState[ArrCtx.patternTracker.current[0]]['patternLength']),
            trackStep = sequencerState[patternToUse]['tracks'][TrkCtx.selectedTrack]['length'] < parseInt(sequencerState[ArrCtx.patternTracker.current[0]]['patternLength']) ? patternLocation % sequencerState[ArrCtx.patternTracker.current[0]]['tracks'][TrkCtx.selectedTrack]['length'] : patternLocation ;
            pageToGo = Math.floor(trackStep/16);
            console.log('[Sequencer.js]: nowTime', nowTime, 
                        'timeb', timeb, 
                        'timeBBS', timeBBS, 
                        'step', step, 
                        'patternTracker', patternTracker,
                        'patternLocation', patternLocation,
                        'trackStep', trackStep,
                        'pageToGo', pageToGo,
                        'patternToGo', patternToGo,
                        'activePattern', activePatternRef.current,
                        'activePage', activePageRef.current,
                        'selectedTrack', selectedTrackRef.current);
        if (activePatternRef.current !== patternToGo 
        && activePageRef.current !== pageToGo) {
            console.log('[Sequencer.js]: setting new page and patter');
            activePatternRef.current = patternToGo;
            activePageRef.current = pageToGo;
            setSequencer(state => {
                let copyState = {
                    ...state,
                    activePattern: patternToGo,
                    [patternToGo]: {
                        ...state[patternToGo],
                        tracks: {
                            ...state[patternToGo]['tracks'],
                            [TrkCtx.selectedTrack]: {
                                ...state[patternToGo]['tracks'][TrkCtx.selectedTrack],
                                page: pageToGo,
                            }
                        }
                    }
                }
                return copyState;
            })
        } else if(activePatternRef.current === patternToGo 
        &&  activePageRef.current !== pageToGo) {
            console.log('[Sequencer.js]: setting new page');
            changePage(pageToGo);
        } else if (activePatternRef.current !== patternToGo && pageToGo === activePageRef.current) {
            activePatternRef.current = patternToGo;
            setSequencer(state => {
                let copyState = {
                    ...state,
                    activePattern: patternToGo,
                }
                return copyState;
            });
        }
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
                        activePatternRef.current = parseInt(nextPattern);
                        activePageRef.current = parseInt(sequencerState[nextPattern]['tracks'][selectedTrackRef.current]['page'])
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
                activePatternRef.current = parseInt(nextPattern);
                activePageRef.current = parseInt(sequencerState[nextPattern]['tracks'][selectedTrackRef.current]['page']);
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
            activePatternRef.current = parseInt(nextPattern);
            activePageRef.current = parseInt(sequencerState[nextPattern]['tracks'][selectedTrackRef.current]['page']);
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
        activePageRef.current = pageIndex;
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
            let event = { 
                ...sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][index],
            };
            event['note'] = note ? note : null;
            sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].at(time, event);
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
                eventsRef.current[TrkCtx.selectedTrack][e] = {
                    ...eventsRef.current[TrkCtx.selectedTrack][e],
                    note: note,
                }
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
                eventsRef.current[TrkCtx.selectedTrack][e] = {
                    ...eventsRef.current[TrkCtx.selectedTrack][e],
                    velocity: velocity,
                }
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

    const parameterLock = (trackIndex, parameterObject) => {
        console.log('[Sequencer.js]: locking parameter, event state now', parameterObject);
        selectedRef.current.map(index => {
            let time = `0:0:${index}`;
            let event = { 
                ...sequencerState[sequencerState.activePattern]['tracks'][trackIndex]['events'][index], 
                ...parameterObject,
            };
            // console.log('[Sequencer.js] updating triggState at time', time, 'event', event);
            // sequencerState[sequencerState.activePattern]['tracks'][trackIndex]['triggState'].at(time, event);
            sequencerState[sequencerState.activePattern]['tracks'][trackIndex]['triggState'].at(time, event);
        });
        setSequencer(state => {
            let copyState = {
                ...state, 
                [state.activePattern]: {
                    ...state[state.activePattern],
                    'tracks': {
                        ...state[state.activePattern]['tracks'],
                        [trackIndex]: {
                            ...state[state.activePattern]['tracks'][trackIndex],
                            'events': [...state[state.activePattern]['tracks'][trackIndex]['events']]
                        }
                    }
                }
            }
            state[state.activePattern]['tracks'][trackIndex]['selected'].map(e => {
                eventsRef.current[TrkCtx.selectedTrack][e] = {
                    ...eventsRef.current[TrkCtx.selectedTrack][e],
                    ...parameterObject,
                } 
                copyState[state.activePattern]['tracks'][trackIndex]['events'][e] = {
                    ...state[state.activePattern]['tracks'][trackIndex]['events'][e],
                    ...parameterObject,
                };
                return '';
            })
            console.log('[Sequencer.js]: setting new state after parameter locking');
            return copyState
        }) 
    };

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


    // Conditional components logic - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // const StepsComponent =  sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] ? 
    const StepsComponent =  sequencerState[sequencerState.activePattern] && sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]? 
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