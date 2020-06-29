import React, { useContext, useState, useEffect, useRef } from 'react';
import trackContext from '../../context/trackContext';
import toneContext from '../../context/toneContext';
import sequencerContext from '../../context/sequencerContext';
import './Sequencer.scss';
import Steps from './Steps/Steps.js';
import StepsEdit from './Steps/StepsEdit';
import arrangerContext from '../../context/arrangerContext';
import transportContext from '../../context/transportContext';
import usePrevious from '../../hooks/usePrevious';

export const returnPartArray = (length) => {
    return [...Array(length).keys()].map(i => {
        return {time: `0:0:${i}`, velocity: 127}
    })
}

export const to16 = (time) => {
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
        setNoteMIDIRef = useRef(),
        setPlaybackInputRef = useRef(),
        setNoteLengthPlaybackRef = useRef(),
        override = useRef(true),
        quantizeRecording = useRef(false),
        isFollowing = ArrCtx.following;
        

    const [sequencerState, setSequencer] = useState({
        0: {
            name: 'Pattern 1',
            patternLength: 16,
            tracks: {
                0: {
                    length: 16,
                    noteLength: '16n',
                    triggState: new Tone.Part(),
                    events: Array(16).fill({}),
                    page: 0,
                    selected: [],
                    }
                }
            },
        activePattern: 0,
        setNoteMIDI: setNoteMIDIRef,
        setPlaybackInput: setPlaybackInputRef,
        setNoteLengthPlayback: setNoteLengthPlaybackRef,
        step: null,
        followSchedulerID: null,
        stepFollowerID: null,
        counter: 1,
        counter2: 1,
        copyed: null,
        override: true,
        quantizeRecording: false,
        }
    );
    let activePatternRef = useRef(sequencerState.activePattern);
    let selectedTrackRef = TrkCtx.selectedTrackRef;
    let activePageRef = useRef(0);
    let sequencerEvents = Object.keys(sequencerState[activePatternRef.current]['tracks']).map(track => {
            if (track){
                return sequencerState[activePatternRef.current]['tracks'] && sequencerState[activePatternRef.current]['tracks'][track] ? sequencerState[activePatternRef.current]['tracks'][track]['events'] : null ;
            }
        });
    let eventsRef = useRef(sequencerEvents);
    let triggStates = Object.keys(sequencerState[activePatternRef.current]['tracks']).map(track => {
        if (track) {
            return sequencerState[activePatternRef.current]['tracks'] && sequencerState[activePatternRef.current]['tracks'][track] ? sequencerState[activePatternRef.current]['tracks'][track]['triggState'] : null ;
        }
    });
    let triggStatesRef = useRef(triggStates); 
    let selected = selectedTrackRef && selectedTrackRef.current && sequencerState[sequencerState.activePattern]['tracks'] && sequencerState[sequencerState.activePattern]['tracks'][selectedTrackRef.current] && sequencerState[sequencerState.activePattern]['tracks'][selectedTrackRef.current]['selected'] ? sequencerState[sequencerState.activePattern]['tracks'][selectedTrackRef.current]['selected']: [] ;
    let selectedRef = useRef(selected);
    let schedulerID = sequencerState.followSchedulerID;
    let stepFollowerID = sequencerState.stepFollowerID;
    let selLen = sequencerState[activePatternRef.current]['tracks'] && sequencerState[activePatternRef.current]['tracks'][TrkCtx.selectedTrack] && sequencerState[activePatternRef.current]['tracks'][TrkCtx.selectedTrack]['length']? sequencerState[activePatternRef.current]['tracks'][TrkCtx.selectedTrack]['length'] : null ;
    let selLenRef = useRef(selLen);

    // setting subscripition of the seleted ref to the sequencerEvents
    useEffect(() => {
        if (selectedRef.current !== selected) {
            selectedRef.current = [...selected];
        }
    }, [selected])

    useEffect(() => {
        selLenRef.current = selLen;
    }, [selLen]);


    // Set following scheduler
    // - - - - - - - - - - - - - - - 
    useEffect(() => {
        let newSchedulerId,
            schedulerPart;
        if (isFollowing && !schedulerID && arrangerMode === 'song'){
            schedulerPart = new Tone.Part(() => {
                goToActive();
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
            SeqCtx.createCallback('updateTriggStateRef', updateTriggStateRef);
            // SeqCtx.createCallback('setNoteMIDI', setNoteMIDI);
        }
        if (sequencerState !== sequencerContext){
            SeqCtx.updateAll(sequencerState);
        }
        setNoteMIDIRef.current = setNoteMIDI;
        setPlaybackInputRef.current = setPlaybackInput;
        setNoteLengthPlaybackRef.current = setNoteLengthPlayback;
        document.onkeydown = keydown;
        document.onkeyup = keyup;
    }, []);

    // Updating setNoteMIDI callback e

    // Setting the step tracker as soon as the transport starts
    useEffect(() => {
        let newStepID;
        if (isPlaying && !previousPlaying && !stepFollowerID) {
            newStepID = Tone.Transport.scheduleRepeat(() => {
                let newStep = returnStep();
                // console.log('[Sequencer.js]: gettin current step', newStep);
                setSequencer(state => ({
                    ...state, 
                    step: newStep,
                }))
            }, "16n");
            setSequencer(state => ({
                ...state,
                stepFollowerID: newStepID,
            }));
        } else if (!isPlaying && previousPlaying && stepFollowerID) {
            Tone.Transport.clear(sequencerState.stepFollowerID);
            setSequencer(state => ({
                ...state,
                stepFollowerID: null,
                step: null,
            }));
        }
    });


    // Update the triggState ref (mostly because when you add a track 
    // you have to callback a function to update the triggState ref) 
    const updateTriggStateRef = (newRef) => {
        triggStatesRef.current = [...newRef];
    };

    // Subscribing SequencerContext to any change in the Sequenecer Context
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        SeqCtx.updateAll(sequencerState);
    }, [sequencerState]);

    // Subscribing event Refs to any change in its events
    // - - - - - - -  - - - - - - - - - - - - - - - -  -
    useEffect(() => {
        sequencerEvents.forEach((v,i,a) => {
            if (TrkCtx[i][4] != v){
            TrkCtx.getTrackEventRef(i, v);
            }
        });
        eventsRef.current = sequencerEvents;

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

    const setNoteLengthPlayback = (note, pattern, track, step, length, pastEvent) => {
        setSequencer(state => {
            console.log('[Sequencer.js]: setingLength and note of previously pressed note.', note, 'pattern', pattern, 'track', track, 'step', step, 'length', length, 'pastEvent', pastEvent);
            let copyState = {
                ...state, 
                [state[pattern]]: {
                    ...state[pattern],
                    'tracks': {
                        ...state[pattern]['tracks'],
                        [track]: {
                            ...state[pattern]['tracks'][track],
                            'events': [...state[pattern]['tracks'][track]['events']]
                        }
                    }
                }
            }
            let event = { 
                ...pastEvent,
                length: length,
            };
            let time = {
                '16n': step,
                '128n': event.offset ? event.offset : 0,
            };
            // if (sequencerState.override){
            if (override.current){
                console.log('[Sequencer.js]: overriding');
                event.note = [note];
            // } else if (!sequencerState.override && !event.note.includes(note)) {
            } else if (!override.current && !event.note.includes(note)) {
                console.log('[Sequencer.js]: NOT overriding');
                event.note.push(note);
            }
            state[pattern]['tracks'][track]['triggState'].at(time, event);
            eventsRef.current[track][step] = {
                ...eventsRef.current[track][step],
                length: length,
            }
            copyState[state[pattern]]['tracks'][track]['events'][step] = {
                // ...state[pattern]['tracks'][track]['events'][step],
                // length: length, 
                ...event,
            };
            console.log('[Sequencer.js]: the new event is', event);
            return copyState
        });
    }

    // const setPlaybackInput = (pattern, track, step, offset, note, velocity, length) => {
    const setPlaybackInput = (pattern, track, step, offset, note, velocity) => {
        setSequencer(state => {
            console.log('[Sequencer.js]: state is', state, state[pattern]);
            let copyState = {
                ...state, 
                [pattern]: {
                    ...state[pattern],
                    'tracks': {
                        ...state[pattern]['tracks'],
                        [track]: {
                            ...state[pattern]['tracks'][track],
                            'events': [...state[pattern]['tracks'][track]['events']]
                        }
                    }
                }
            }
            let event = { 
                ...state[pattern]['tracks'][track]['events'][step],
                note: [],
            };
            let pastTime = {
                '16n': step,
                '128n': event.offset ? event.offset : 0,
            };
            event.offset = offset;
            event.velocity = velocity;
            // event.length = length;
            if (sequencerState.override){
                event.note = [note];
            } else if (!sequencerState.override && !event.note.includes(note)) {
                event.note.push(note);
            }
            state[pattern]['tracks'][track]['triggState'].remove(pastTime);
            // state[pattern]['tracks'][track]['triggState'].remove(pastTime);
            // state[pattern]['tracks'][track]['triggState'].at(newTime, event);
            // sequencerState[pattern]['tracks'][track]['triggState'].add(newTime, event);
            eventsRef.current[track][step] = {
                ...eventsRef.current[track][step],
                note: event.note,
                offset: event.offset,
                velocity: event.velocity,
                // length: event.length,
            }
            copyState[pattern]['tracks'][track]['events'][step] = {
                ...state[pattern]['tracks'][track]['events'][step],
                note: event.note,
                velocity: event.velocity,
                offset: event.offset,
                // length: event.length,
            };
        return copyState
        });
    }

    const goToActive = () => {
        let nowTime = Tone.Transport.position.split('.')[0];
        let pageToGo = null,
        patternToUse = patternTracker.current[0] ? patternTracker.current[0] : ArrCtx['songs'][ArrCtx.selectedSong]['events'][0]['pattern'],
        timeb = patternTracker.current[1] ? patternTracker.current[1] : 0,
        patternToGo = patternToUse;
        let timeBBS = Tone.Time(timeb, 's').toBarsBeatsSixteenths(),
            step = to16(nowTime) - to16(timeBBS),
            patternLocation = step % parseInt(sequencerState[ArrCtx.patternTracker.current[0]]['patternLength']),
            trackStep = sequencerState[patternToUse]['tracks'][TrkCtx.selectedTrack]['length'] < parseInt(sequencerState[ArrCtx.patternTracker.current[0]]['patternLength']) ? patternLocation % sequencerState[ArrCtx.patternTracker.current[0]]['tracks'][TrkCtx.selectedTrack]['length'] : patternLocation ;
            pageToGo = Math.floor(trackStep/16);
        if (activePatternRef.current !== patternToGo 
        && activePageRef.current !== pageToGo) {
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
                let triggStateNow = Object.keys(state[patternToGo]['tracks']).map(track => {
                    return state[patternToGo]['tracks'][track]['triggState'];
                });
                updateTriggStateRef(triggStateNow);
                return copyState;
            })
        } else if(activePatternRef.current === patternToGo 
        &&  activePageRef.current !== pageToGo) {
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

    const toggleOverride = () => {
        override.current = !override.current;
        setSequencer(state => ({
            ...state,
            override: !state.override
        }));
    }

    const toggleRecordingQuantization = () => {
        quantizeRecording.current = !quantizeRecording.current;
        setSequencer(state => ({
            ...state,
            quantizeRecording: !state.quantizeRecording,
        }));
    }

    const returnStep = () => {
        let result;
        let nowTime = Tone.Transport.position.split('.')[0]; 
        if (ArrCtx.mode === 'pattern') {
            // console.log('[Sequencer.js]: nowTime', nowTime);
            let trackSteps = sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['length'];
            let patternLength = sequencerState[sequencerState.activePattern]['patternLength'];
            result = trackSteps >= patternLength ? to16(nowTime) : to16(nowTime) % trackSteps;
            return result
        } else if (ArrCtx.mode === 'song') {
            let patternToUse = patternTracker.current[0] ? patternTracker.current[0] : ArrCtx['songs'][ArrCtx.selectedSong]['events'][0]['pattern'],
            timeb = patternTracker.current[1] ? patternTracker.current[1] : 0;
            let timeBBS = Tone.Time(timeb, 's').toBarsBeatsSixteenths(),
            step = to16(nowTime) - to16(timeBBS);
            let patternLocation = sequencerState[ArrCtx.patternTracker.current[0]] ? step % parseInt(sequencerState[ArrCtx.patternTracker.current[0]]['patternLength']) : null;
            if (!patternLocation)
                return false;
            let trackStep = sequencerState[patternToUse]['tracks'][TrkCtx.selectedTrack]['length'] < parseInt(sequencerState[ArrCtx.patternTracker.current[0]]['patternLength']) ? patternLocation % sequencerState[ArrCtx.patternTracker.current[0]]['tracks'][TrkCtx.selectedTrack]['length'] : patternLocation,
            result = trackStep;
            // console.log('[Sequencer.js]: song mode, nowTime', nowTime, 
            //             'patternToUse', patternToUse, 
            //             'timeb', timeb, 
            //             'timeBBS', timeBBS, 
            //             'step', step,
            //             'patternLocation', patternLocation,
            //             'trackStep', trackStep);
            return result;
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
                    noteLength: '16n', 
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
                        let triggStateNow = Object.keys(state[nextPattern]['tracks']).map(track => {
                            return state[nextPattern]['tracks'][track]['triggState'];
                        });
                        updateTriggStateRef(triggStateNow);
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
                let triggStateNow = Object.keys(state[nextPattern]['tracks']).map(track => {
                    return state[nextPattern]['tracks'][track]['triggState'];
                });
                updateTriggStateRef(triggStateNow);
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
        });
    };

    const setOffset = (direction) => {
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
                let event = {
                    ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e],
                }
                let currOffset = event.offset ? event.offset : 0; 
                let pastEventTime = {
                    '16n': e,
                    '128n': currOffset,
                };
                if ((direction > 0 && currOffset + direction <= 128)
                ||  (direction < 0 && currOffset + direction >= -128)) {
                    let offset = currOffset + direction;
                    // let newEventTime = offset > 0 ? `0:0:${e}.${offset}` : `0:0:${e-1}.${1000-offset}`;
                    let newEventTime = {
                        '16n': e,
                        '128n': offset,
                    }
                    copyState[copyState.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].remove(pastEventTime);
                    copyState[copyState.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].at(newEventTime, event);
                    eventsRef.current[TrkCtx.selectedTrack][e] = {
                        ...eventsRef.current[TrkCtx.selectedTrack][e],
                        offset: offset,
                    }
                    copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e] = {
                        ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e],
                        offset: offset,
                    };
                    return '';
                } 
            })
            return copyState
        });
    };

    // vou deixar comentado de fora a versao do setnote em que o setter da Part
    // esta fora do setSequencer call
    // const setNote = (note) => {
    //     sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'].map(index => {
    //         let event = { 
    //             ...sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][index],
    //         };
    //         let time = `0:0:${index}`;
    //         event['note'] = note ? note : null;
    //         sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].at(time, event);
    //         return '';
    //     })

    //     setSequencer(state => {
    //         let copyState = {
    //             ...state, 
    //             [state.activePattern]: {
    //                 ...state[state.activePattern],
    //                 'tracks': {
    //                     ...state[state.activePattern]['tracks'],
    //                     [TrkCtx.selectedTrack]: {
    //                         ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack],
    //                         'events': [...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events']]
    //                     }
    //                 }
    //             }
    //         }
    //         state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'].map(e => {
    //             eventsRef.current[TrkCtx.selectedTrack][e] = {
    //                 ...eventsRef.current[TrkCtx.selectedTrack][e],
    //                 note: note,
    //             }
    //             copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e] = {
    //                 ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e],
    //                 note: note,
    //             };
    //             return '';
    //         })
    //         return copyState
    //     });
    // };

    const setNote = (note) => {
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
                let event = { 
                    ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e],
                };
                let time = {
                    '16n': e,
                    '128n': event.offset
                };
                event['note'] = note ? note : null;
                state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].at(time, event); 
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
        });
    };

    const setPatternNoteLength = (length) => {
        setSequencer(state => {
            let copyState = {
                ...state, 
                [state.activePattern]: {
                    'tracks':{
                        ...state[state.activePattern]['tracks'],
                        [TrkCtx.selectedTrack]: {
                            ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack],
                            'noteLength': length,
                        }
                    }
                }
            };
            return copyState
        })
    }

    const setNoteLength = (length) => {
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
                let event = { 
                    ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e],
                };
                let time = {
                    '16n': e,
                    '128n': event.offset
                };
                event['length'] = length ? length : null;
                state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].at(time, event); 
                eventsRef.current[TrkCtx.selectedTrack][e] = {
                    ...eventsRef.current[TrkCtx.selectedTrack][e],
                    length: length,
                }
                copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e] = {
                    ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e],
                    length: length,
                };
                return '';
            })
            return copyState
        }); 
    } ;

    const deleteEvents = () => {
        if (selectedRef.current.length >= 1) {
            console.log('[Sequencer.js]: deleting events');
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
                    let event = { 
                        ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e],
                    };
                    let time = {
                        '16n': e,
                        '128n': event.offset
                    };
                    state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].remove(time); 
                    eventsRef.current[TrkCtx.selectedTrack][e] = {};
                    copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][e] = {};
                    return '';
                })
                return copyState
            });
        }
    }

    const setNoteMIDI = (trackIndex, note, velocity) => {
        selectedRef.current.map(index => {
            let event = { 
                ...eventsRef.current[trackIndex][index],
            };
            let time = {
                '16n': index,
                '128n': event.offset ? event.offset : 0,
            };
            // console.log('[FMSynth]: event', event);
            let notes = event && event.note ? [...event['note']] : [];
            if (notes.includes(note)){
                notes = notes.filter(n => n !== note);
            } else {
                notes.push(note)
            }
            event['note'] = notes ? notes : null;
            event['velocity'] = velocity;
            triggStatesRef.current[trackIndex].at(time, event);
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
            state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'].map(index => {
                let event = { 
                    ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][index],
                };
                let notes = event && event.note ? [...event['note']] : [];
                if (notes.includes(note)){
                    notes = notes.filter(n => n !== note);
                } else {
                    notes.push(note)
                }
                event['note'] = notes ? notes : null;
                eventsRef.current[TrkCtx.selectedTrack][index] = {
                    ...eventsRef.current[TrkCtx.selectedTrack][index],
                    note: notes ? notes : null,
                    velocity: velocity,
                }
                copyState[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][index] = {
                    ...state[state.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][index],
                    note: notes ? notes : null,
                    velocity: velocity, 
                };
                return '';
            })
            return copyState
        })
    };

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
        selectedRef.current.map(index => {
            let time = `0:0:${index}`;
            let event = { 
                ...eventsRef.current[trackIndex][index], 
                ...parameterObject,
            };
            triggStatesRef.current[trackIndex].at(time, event);
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

    // Keyboard commands
    const keyDict = {
        a: 0,
        s: 1,
        d: 2,
        f: 3,
        g: 4,
        h: 5, 
        j: 6,
        k: 7,
        l: 8,
        z: 9,
        x: 10,
        c: 11,
        v: 12,
        b: 13,
        n: 14,
        m: 15
    };

    function keydown(e) {
        let char = String.fromCharCode(e.keyCode).toLowerCase();
        if (e.target.tagName.toLowerCase() !== "input"){
            if (Object.keys(keyDict).includes(char)) {
                if (e.repeat) { return }
                let index = (activePageRef.current + 1) * keyDict[char];
                console.log('[Sequencer.js]: activePatternRef', activePatternRef, 'state', sequencerState);
                // if (index <= sequencerState[activePatternRef.current]['tracks'][TrkCtx.selectedTrack]['length']) {
                if (index <= selLenRef.current) {
                    selectStep(index);
                }
            } else if (e.keyCode === 37 && selectedRef.current.length >= 1) {
                e.shiftKey ? setOffset(-10) : setOffset(-1);
            } else if (e.keyCode === 39 && selectedRef.current.length >= 1) {
                e.shiftKey ? setOffset(10) : setOffset(1);
            } else if (e.keyCode === 46 || e.keyCode === 8) {
                deleteEvents();
            } 
        }
    };

    function keyup(e) {
        let char = String.fromCharCode(e.keyCode).toLowerCase();
        if (e.target.tagName.toLowerCase() !== "input"){
            if (Object.keys(keyDict).includes(char)) {
                if (e.repeat) { return }
                let index = (activePageRef.current + 1) * keyDict[char];
                console.log('[Sequencer.js]: activePatternRef', activePatternRef, 'state', sequencerState);
                // if (index <= sequencerState[activePatternRef.current]['tracks'][TrkCtx.selectedTrack]['length']) {
                if (index <= selLenRef.current) {
                    selectStep(index);
                }
            } 
        }
    }




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
                        patternNoteLength = { sequencerState[sequencerState.activePattern]['tracks'] && sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] && sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['noteLength'] ? sequencerState[sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['noteLength'] : null }
                        page={page}
                        setNote={setNote}
                        setPatternNoteLength={setPatternNoteLength}
                        changePage={changePage}
                        setNoteLength={setNoteLength}
                        setVelocity={setVelocity}></StepsEdit>
                <p> {`${sequencerState[sequencerState.activePattern]['name']}`} </p>
            </div>
        )
}

export default Sequencer;