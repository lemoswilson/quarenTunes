import React, { useEffect, useContext, useState } from 'react';
import './Arranger.scss'
import trackContext from '../../context/trackContext';
import sequencerContext from '../../context/sequencerContext';
import arrangerContext from '../../context/arrangerContext';
import transportContext from '../../context/transportContext';
import toneContext from '../../context/toneContext';
import usePrevious from '../../hooks/usePrevious';

const subtractBBS = (time) => {
    let timeArray = time.split(':');
    if (parseInt(timeArray[2]) > 0) {
        timeArray[2] = parseInt(timeArray[2]) - 1;
    } else {
        if (parseInt(timeArray[1]) > 0) {
            timeArray[1] = parseInt(timeArray[1]) - 1;
            timeArray[2] = 3;
        } else {
            timeArray[0] = parseInt(timeArray[0]) - 1;
            timeArray[1] = 3;
            timeArray[2] = 3;
        }
    }
    let newTime = timeArray.join(':');
    return newTime;
}

const Arranger = (props) => {
    // Initializing contexts and state and necessary variables- - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    let TrkCtx = useContext(trackContext),
        SeqCtx = useContext(sequencerContext),
        ArrCtx = useContext(arrangerContext),
        Tone = useContext(toneContext),
        TrsCtx = useContext(transportContext),
        activePattern = SeqCtx[SeqCtx.activePattern],
        activePatternNumber = SeqCtx.activePattern,
        isPlaying = TrsCtx.isPlaying,
        SequencerSubscription = SeqCtx.counter2,
        trackCount = TrkCtx.trackCount;


    const [arrangerState, setArranger] = useState({
        mode: 'pattern',
        following: false,
        directChange: false,
        patternStartTime: 0,
        selectedSong: 0,
        counter: 1,
        songs: {
            0: {
                name: 'song 1',
                events: [{
                    pattern: null,
                    start: 0,
                    end: 16,
                    repeat: null,
                    mute: [],
                    id: 0,
                }],
                counter: 1,
            },
        }, 
    }),
        modes = ['pattern', 'chain', 'song'],
        [, updateState] = React.useState(),
        forceUpdate = React.useCallback(() => updateState({}), []),
        currentSong = arrangerState['selectedSong'],
        arrangerMode = arrangerState['mode'],
        activeSongObject = arrangerState['songs'][arrangerState.selectedSong],
        previousMode = usePrevious(arrangerMode);

    // Subscribing Arranger Context to any changes in the arranger
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        ArrCtx.updateArrCtx(arrangerState);
    }, [arrangerState]);

    // Set scheduler, if SeqCtx[SeqCtx.activePattern] not available yet, 
    // setTimeout a forceRender until its available - - - - - - - - - - 
    // If in pattern mode, adding pattern to the cue, setting the loop size
    // accordingly to the selected pattern size
    // Adding callbacks to the part, if not added already
    const setupPatternMode = () => {
        if (SeqCtx[SeqCtx.activePattern]) {
            if (!Tone.Transport.loop) {
                Tone.Transport.loop = true;
            }
            Tone.Transport.loopStart = 0;
            Tone.Transport.loopEnd = `0:0:${SeqCtx[SeqCtx.activePattern]['patternLength']}`;
    
            Object.keys(activePattern['tracks']).map(ix => {
                if (activePattern['tracks'][ix]){

                    if (activePattern['tracks'][ix]['triggState'].callback !== TrkCtx[ix][3]){
                        // Adding callbacks to the part, if its not already added
                        activePattern['tracks'][ix]['triggState'].callback = TrkCtx[ix][3];
                    }
                    activePattern['tracks'][ix]['triggState'].loop = true;
                    activePattern['tracks'][ix]['triggState'].loopStart = 0;
                    activePattern['tracks'][ix]['triggState'].loopEnd = `0:0:${SeqCtx[SeqCtx.activePattern]['tracks'][ix].length}`;
                    activePattern['tracks'][ix]['triggState'].mute = false;
                    activePattern['tracks'][ix]['triggState'].start(0);
                    return '';
                }
                return '';
            });
        } else {
            console.log('[Arranger.js]: forcou update');
            setTimeout(() => {
                forceUpdate();
            }, 500)
        }        
    };

    // If in patternMode call setupPatternMode
    // If in song mode cue the first song and schedule a callback 
    // to check the state of the arranger? 
    useEffect(() => {
        if (Tone.Transport.state !== 'started'){
            if(arrangerMode === 'pattern' && previousMode === 'pattern'){
                setupPatternMode();
            } else if (arrangerMode === 'pattern' && previousMode === 'song') {
                // cancel playback and then setup pattern mode
                Tone.Transport.cancel(0);
                setupPatternMode();
            } else if ( arrangerState.mode === 'song') {
                if(previousMode === 'pattern'){
                    // stop and mute all the scheduled patterns of the last selected pattern
                    // turn of looop in the transport - - - - - - - - - - - - - - - - - - - - 
                    Tone.Transport.loop = false;
                    Object.keys(SeqCtx[SeqCtx.activePattern]['tracks']).map(track => {
                        if (SeqCtx[SeqCtx.activePattern]['tracks'][track]) {
                            console.log('[Arranger.js]: stoping track,', track, 'seq', SeqCtx.activePattern);
                            SeqCtx[SeqCtx.activePattern]['tracks'][track].triggState.stop();
                            SeqCtx[SeqCtx.activePattern]['tracks'][track].triggState.mute = true;
                        }
                        return '';
                    })
                    // if there are shceduled parts in the active song
                }
                Tone.Transport.cancel(0);
                stopSongCallback();
                scheduleFromIndex(0);
            } 
        } else {
            // The transport is playing, so any change in the transport scheduling
            // was already made in the callback function
            // do i have to do any rearranging to the song after deleting song row?
            if (arrangerMode === 'song'){
                // do I need to do anything if its a 
            }
        }
    // }, [activePattern, isPlaying, trackCount, arrangerMode, currentSong, activeSongObject]);
    }, [activePatternNumber, isPlaying, trackCount, arrangerMode, currentSong, activeSongObject]);

    //  Deleting unexisting pattern after contex update
    //  - - - - - - - - - - - - - - - - - - - - -  - - - -
    useEffect(() => {
        let newSongs = {
            ...arrangerState.songs,
        };
        Object.keys(arrangerState.songs).map(song => {
            arrangerState.songs[song].events.map((event, eventIndex) => {
                if(!SeqCtx[event.pattern]){
                    newSongs[song].events[eventIndex]['pattern'] = null;
                }
                return '';
            });
            return '';
        });
        setArranger(state => ({
            ...state,
            songs: {...newSongs}
        }));
    }, [SequencerSubscription])
    
    // State changing methods - - - - - - - - - - - - - - - - - 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const setMode = (newMode) => {
        setArranger(state => ({
            ...state,
            mode: newMode,
        }));
    };

    const stopSongCallback = () => {
        arrangerState.songs[arrangerState.selectedSong]['events'].forEach((value, index, array) => {
            if(value.pattern >= 0){
                if (index === 0 && SeqCtx[value.pattern]) {
                    Object.keys(SeqCtx[value.pattern].tracks).map(track => {
                        SeqCtx[value.pattern]['tracks'][track].triggState.stop();
                        return '';
                    });
                } else {
                    if (array[index -1].pattern === value.pattern){
                        return;
                    } else {
                        if (SeqCtx[value.pattern]){
                            Object.keys(SeqCtx[value.pattern].tracks).map(track => {
                                SeqCtx[value.pattern]['tracks'][track].triggState.stop();
                                SeqCtx[value.pattern]['tracks'][track].triggState.mute = true;
                                return '';
                            }); 
                        }
                    }
                }
            }
            return ;
        })
    }

    const scheduleFromIndex = (...args) => {
        let events = arrangerState.songs[arrangerState.selectedSong]['events'];
        if (Tone.Transport.loop){
            Tone.Transport.loop = false;
        }
        if (!args[1]){
            if (events) {
                let timeCounter = 0,
                eventsLength = events.length -1;
                events.forEach((value, index, array) => {
                    let repeat = value.repeat + 1,
                        patternOffsetTime = `0:0:${value.start}`,
                        offSetNotation = Tone.Time(patternOffsetTime).toNotation() ,
                        patternEnd = parseInt(value.end),
                        rowEnd = `0:0:${(patternEnd - parseInt(value.start))*parseInt(repeat)}`,
                        delayedTime = timeCounter > 0 ? subtractBBS(Tone.Time(timeCounter, 's').toBarsBeatsSixteenths()) : 0;
                        // timeSch = timeCounter > 0 ? Tone.Time(timeCounter, 's').toBarsBeatsSixteenths() : 0;
                    if (parseInt(value.pattern) >= 0){
                        if (index === 0){
                            console.log('[Arranger.js]: scheduling index 0, offSetNotaiton', offSetNotation, 'loop should be true');
                            Tone.Transport.schedule(time => {
                                Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                    SeqCtx[value.pattern]['tracks'][track].triggState.mute = false;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.loop = true;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.loopStart = patternOffsetTime;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.loopEnd = `0:0:${patternEnd}`;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.start('+0', offSetNotation);
                                    return '';
                                })
                            }, 0);
                        } else {
                            console.log('[Arranger.js]: scheduling index', index);
                            if (array[index - 1].pattern === value.pattern){
                                Tone.Transport.schedule(time => {
                                    Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                        SeqCtx[value.pattern]['tracks'][track].triggState.loopStart = patternOffsetTime;
                                        return '';
                                    })
                                }, delayedTime);
                            }
                            Tone.Transport.schedule(time => {
                                if (array[index -1].pattern === value.pattern){
                                    Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                        SeqCtx[value.pattern]['tracks'][track].triggState.loopEnd = `0:0:${patternEnd}`;
                                        if (SeqCtx[value.pattern]['tracks'][track].triggState.state !== 'started'){
                                            SeqCtx[value.pattern]['tracks'][track].triggState.start("+0", offSetNotation);
                                        }
                                        // return '';
                                    })
                                } else {
                                    Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                        SeqCtx[array[index -1].pattern]['tracks'][track].triggState.loop = false;
                                        SeqCtx[value.pattern]['tracks'][track].triggState.loop = true;
                                        SeqCtx[value.pattern]['tracks'][track].triggState.loopStart = patternOffsetTime;
                                        SeqCtx[value.pattern]['tracks'][track].triggState.loopEnd = `0:0:${patternEnd}`;
                                        SeqCtx[value.pattern]['tracks'][track].triggState.mute = false;
                                        SeqCtx[value.pattern]['tracks'][track].triggState.start('+0', offSetNotation);
                                        SeqCtx[array[index -1].pattern]['tracks'][track].triggState.stop();
                                        SeqCtx[array[index -1].pattern]['tracks'][track].triggState.mute = true;
                                        // return '';
                                    });
                                }
                            }, timeCounter);
                        }
                    } else {
                        if(index > 0 && array[index -1].pattern){
                            Tone.Transport.schedule(time => {
                                Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                    SeqCtx[array[index -1].pattern]['tracks'][track].triggState.stop();
                                    SeqCtx[array[index -1].pattern]['tracks'][track].triggState.mute = true; 
                                    // return '';
                                }, timeCounter);
                            });
                        }
                    }
                timeCounter = timeCounter + Tone.Time(rowEnd).toSeconds();
                });
                console.log('[Arranger.js]: Stopping last pattern at time', timeCounter);
                Tone.Transport.schedule(time => {
                    Object.keys(SeqCtx[events[eventsLength].pattern]['tracks']).map(track => {
                        SeqCtx[events[eventsLength].pattern]['tracks'][track].triggState.stop();
                        SeqCtx[events[eventsLength].pattern]['tracks'][track].triggState.mute = true;
                        // return '';
                    });
                }, timeCounter);
            }
        } else {
            console.log('[Arranger.js]: Scheduling from events passed as arguments', args[1]);
            let timeCounter = 0,
            eventsNew = args[1],
            eventsLength = args[1].length -1;
            args[1].forEach((value, index, array) => {
                let repeat = value.repeat + 1,
                    patternOffsetTime = `0:0:${value.start}`,
                    offSetNotation = Tone.Time(patternOffsetTime).toNotation() ,
                    patternEnd = parseInt(value.end),
                    rowEnd = `0:0:${(patternEnd - parseInt(value.start))*parseInt(repeat)}`,
                    delayedTime = timeCounter > 0 ? subtractBBS(Tone.Time(timeCounter, 's').toBarsBeatsSixteenths()) : 0;
                    // timeSch = timeCounter > 0 ? Tone.Time(timeCounter, 's').toBarsBeatsSixteenths() : 0;
                if (parseInt(value.pattern) >= 0 && index >= args[0]){
                    if (index === 0){
                        console.log('[Arranger.js]: scheduling index', index ,'offSetNotaiton', offSetNotation, 'loop should be true');
                        Tone.Transport.schedule(time => {
                            Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                SeqCtx[value.pattern]['tracks'][track].triggState.mute = false;
                                SeqCtx[value.pattern]['tracks'][track].triggState.loop = true;
                                SeqCtx[value.pattern]['tracks'][track].triggState.loopStart = patternOffsetTime;
                                SeqCtx[value.pattern]['tracks'][track].triggState.loopEnd = `0:0:${patternEnd}`;
                                SeqCtx[value.pattern]['tracks'][track].triggState.start('+0', offSetNotation);
                                return '';
                            });
                        }, 0);
                    } else {
                        if (array[index - 1].pattern === value.pattern){
                            Tone.Transport.schedule(time => {
                                Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                    SeqCtx[value.pattern]['tracks'][track].triggState.loopStart = patternOffsetTime;
                                    if (SeqCtx[value.pattern]['tracks'][track].triggState.state !== 'started') {
                                        SeqCtx[value.pattern]['tracks'][track].triggState.start('+0', offSetNotation);
                                    }
                                    return '';
                                });
                            }, delayedTime);
                        }
                        Tone.Transport.schedule(time => {
                            if (array[index -1].pattern === value.pattern){
                                Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                    SeqCtx[value.pattern]['tracks'][track].triggState.loopEnd = `0:0:${patternEnd}`;
                                    return '';
                                })
                            } else {
                                Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                    SeqCtx[array[index -1].pattern]['tracks'][track].triggState.loop = false;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.loop = true;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.loopStart = patternOffsetTime;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.loopEnd = `0:0:${patternEnd}`;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.mute = false;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.start('+0', offSetNotation);
                                    SeqCtx[array[index -1].pattern]['tracks'][track].triggState.stop();
                                    SeqCtx[array[index -1].pattern]['tracks'][track].triggState.mute = true;
                                    return '';
                                });
                            }
                        }, timeCounter);
                    }
                } else {
                    if(index > 0 && array[index -1].pattern){
                        Tone.Transport.schedule(time => {
                            Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                SeqCtx[array[index -1].pattern]['tracks'][track].triggState.stop();
                                SeqCtx[array[index -1].pattern]['tracks'][track].triggState.mute = true; 
                                return '';
                            }, timeCounter);
                        });
                    }
                }
            timeCounter = timeCounter + Tone.Time(rowEnd).toSeconds();
            });
            console.log('[Arranger.js]: Stopping last pattern at time', timeCounter);
            Tone.Transport.schedule(time => {
                Object.keys(SeqCtx[eventsNew[eventsLength].pattern]['tracks']).map(track => {
                    SeqCtx[eventsNew[eventsLength].pattern]['tracks'][track].triggState.stop();
                    SeqCtx[eventsNew[eventsLength].pattern]['tracks'][track].triggState.mute = true;
                    return '';
                });
            }, timeCounter);
        }
        //     let timeCounter = 0;
        //     args[1].forEach((value, index, array) => {
        //         let repeat = value.repeat + 1,
        //         patternOffsetTime = `0:0:${value.start}`,
        //         patternEnd = `0:0:${value.end}`,
        //         rowEnd = `0:0:${(parseInt(value.end) - parseInt(value.start))*parseInt(repeat)}`;
        //     if (value.pattern && args[0] <= index) {
        //         Tone.Transport.schedule((time) => {
        //             Object.keys(SeqCtx[value.pattern].tracks).map(track => {
        //                 SeqCtx[value.pattern]['tracks'][track].triggState.mute = false;
        //                 SeqCtx[value.pattern]['tracks'][track].triggState.loopStart = patternOffsetTime;
        //                 SeqCtx[value.pattern]['tracks'][track].triggState.loopEnd = patternEnd;
        //                 SeqCtx[value.pattern]['tracks'][track].triggState.loop = true;
        //                 SeqCtx[value.pattern]['tracks'][track].triggState.start('+0', patternOffsetTime);
        //             });
        //         }, timeCounter); 
        //     }  
        //     timeCounter = timeCounter + Tone.Time(rowEnd).toSeconds();
        //     });
        // }
    }

    const removeRow = (index) => {
        let parsa = [...arrangerState.songs[arrangerState.selectedSong]['events']];
        parsa.splice(index, 1);
        setArranger(state => {
            let copyState = {
                ...state,
                songs: {
                    ...state.songs,
                    [state.selectedSong]: {
                        ...state.songs[state.selectedSong],
                        events: [...state.songs[state.selectedSong]['events']]
                    }
                }
            }
            copyState.songs[state.selectedSong]['events'] = parsa;
            return copyState;
        }); 
        if (isPlaying) {
            Tone.Transport.cancel();
            scheduleFromIndex(0, parsa);
        }
    }

    const prependRow = () => {
        setArranger(state => {
            let copyState = {
                ...state,
                songs: {
                    ...state.songs,
                    [state.selectedSong]: {
                        ...state.songs[state.selectedSong],
                        events: [...state.songs[state.selectedSong]['events']]
                    }
                }
            }
            let parsa = [...state.songs[state.selectedSong]['events']];
            parsa.unshift({
                pattern: null,
                start: 0,
                end: 16,
                repeat: null,
                mute: [],
                id: state.songs[state.selectedSong]['counter'],
            })
        if (isPlaying) {
            Tone.Transport.cancel(0);
            scheduleFromIndex(0, parsa);
        }
            copyState.songs[state.selectedSong]['counter'] = state.songs[state.selectedSong]['counter'] + 1;
            copyState.songs[state.selectedSong]['events'] = parsa;
            return copyState;
        })
    }

    const addRow = (index) => {
        let parsa;
        setArranger(state => {
            let copyState = {
                ...state,
                songs: {
                    ...state.songs,
                    [state.selectedSong]: {
                        ...state.songs[state.selectedSong],
                        events: [...state.songs[state.selectedSong]['events']]
                    }
                }
            }
            parsa = [...copyState.songs[copyState.selectedSong]['events']]
            parsa.splice(index + 1, 0, {
                pattern: null,
                start: 0,
                end: 16,
                repeat: null,
                mute: [],
                id: state.songs[state.selectedSong]['counter'],
            })
            copyState.songs[state.selectedSong]['counter'] = state.songs[state.selectedSong]['counter'] + 1;
            copyState.songs[state.selectedSong]['events'] = parsa;
            return copyState;
        })
        if (isPlaying){
            Tone.Transport.cancel()
            scheduleFromIndex(0, parsa);
        }
    };

    const selectSong = (e) => {
        let songIndex = e.target.value;
        if (arrangerMode === 'song'){
            Tone.Transport.cancel(0);
        }
        if (isPlaying){
            scheduleFromIndex(0, arrangerState.songs[songIndex]['events']);
        }
        setArranger(state => {
            let copyState = {
                ...state,
                selectedSong: parseInt(songIndex),
            }
            return copyState;
        });
    };

    const addSong = () => {
        setArranger(state => ({
            ...state,
            songs: {
                ...state.songs,
                [state.counter]: {
                    name: `song ${parseInt(state.counter) + 1}`,
                    events: [{
                        pattern: null,
                        start: 0,
                        end: 16,
                        repeat: null,
                        mute: [],
                        id: 0,
                    }],
                    counter: 1, 
                }
            },
            counter: state.counter + 1
        }))
    };

    const removeSong = (e) => {
        setArranger(state => {
            let copyState = {
                ...state,
                songs: {
                    ...state.songs,
                }
            }
            delete copyState['songs'][state.selectedSong]
            Object.keys(copyState['songs']).map(key => {
                if (state['songs'][key]) {
                    copyState['selectedSong'] = key;
                }
                return '';
            })
            return copyState
        });
    }


    const setPattern = (e, eventIndex) => {
        let pat = parseInt(e.target.value),
            events;
        setArranger(state => {
            let copyState = {
                ...state,
                songs: {
                    ...state.songs,
                    [state.selectedSong]: {
                        ...state.songs[state.selectedSong],
                        events: [...state.songs[state.selectedSong]['events']],
                    }
                }
            }
            copyState.songs[state.selectedSong]['events'][eventIndex]['pattern'] = pat >= 0 ? pat : null;
            events = [...copyState.songs[state.selectedSong]['events']]
            return copyState;
        });
        if (isPlaying){
            let now = Tone.Time("+128n");
            Tone.Transport.cancel();
            scheduleFromIndex(0, events);
        }
    };

    const setRepeat = (e, eventIndex) => {
        let repeat = parseInt(e.target.value);        
        let events;
        setArranger(state => {
            let copyState = {
                ...state,
                songs: {
                    ...state.songs,
                    [state.selectedSong]: {
                        ...state.songs[state.selectedSong],
                        events: [...state.songs[state.selectedSong]['events']],
                    }
                }
            }
            copyState.songs[state.selectedSong]['events'][eventIndex]['repeat'] = repeat;
            events = [...copyState.songs[state.selectedSong]['events']];
            return copyState;
        });
        if (isPlaying){
            Tone.Transport.cancel();
            scheduleFromIndex(0, events);
        }
    };

    const setStart = (e, eventIndex) => {
        let startTime = parseInt(e.target.value);        
        let events;
        setArranger(state => {
            let copyState = {
                ...state,
                songs: {
                    ...state.songs,
                    [state.selectedSong]: {
                        ...state.songs[state.selectedSong],
                        events: [...state.songs[state.selectedSong]['events']],
                    }
                }
            }
            copyState.songs[state.selectedSong]['events'][eventIndex]['start'] = startTime;
            events = [...copyState.songs[state.selectedSong]['events']];
            return copyState;
        });
        if (isPlaying){
            Tone.Transport.cancel();
            scheduleFromIndex(0, events);
        }
    };

    const setEnd = (e, eventIndex) => {
        let endTime = parseInt(e.target.value),
            events;
        if (endTime && endTime !== ''){
            setArranger(state => {
                let copyState = {
                    ...state,
                    songs: {
                        ...state.songs,
                        [state.selectedSong]: {
                            ...state.songs[state.selectedSong],
                            events: [...state.songs[state.selectedSong]['events']],
                        }
                    }
                }
                copyState.songs[state.selectedSong]['events'][eventIndex]['end'] = endTime;
                return copyState;
            })
            if (isPlaying){
                Tone.Transport.cancel();
                scheduleFromIndex(0, events);
            }
        }
    };

    const setMute = (e, eventIndex) => {
        let events;
        if (e.keyCode === 13) {
            let mutes = e.target.value;
            if (mutes === ''){
                mutes = [];
            } else {
                mutes = mutes.split(',');
                mutes = mutes.map(e => e.trim());
            }
            setArranger(state => {
                let copyState = {
                    ...state,
                    songs: {
                        ...state.songs,
                        [state.selectedSong]: {
                            ...state.songs[state.selectedSong],
                            events: [...state.songs[state.selectedSong]['events']]
                        }
                    }
                }
                copyState.songs[state.selectedSong]['events'][eventIndex]['mute'] = mutes;
                events = [...copyState.songs[state.selectedSong]['events']];
                return copyState;
            });
            e.target.value = '';
        }
        if (isPlaying){
            Tone.Transport.cancel();
            scheduleFromIndex(0, events);
        }
    };


    //  Conditional styles, elements and properties
    //  - - - - - - - - - - - - -  - - - - - - - - - -   
    const songAmount = () => {
        let songAmount = Number();
        Object.keys(arrangerState.songs).map(songKey => {
            if(arrangerState.songs[songKey]){
                songAmount = songAmount + 1;
            }
            return ''
        })
        return songAmount;
    };

    const mutePlaceholder = (eventIndex) => {
        return arrangerState['songs'][arrangerState.selectedSong]['events'][eventIndex].mute.join(',');
    };

    const removeS = songAmount() > 1 && !isPlaying ? <div className="removeSong"onClick={ removeSong }>-</div> : null;

    return(
        <div className="arranger">
            <div className="modes">
                { modes.map(mode => {
                    return <div key={mode} 
                        className={mode}
                        onClick={() => setMode(mode)}>
                        { mode.charAt(0).toUpperCase() + mode.slice(1) }</div>
                }) }
            </div>
            <div className="songManager">
                <form>
                    <label htmlFor="songSelector">Song</label>
                    <select onChange={ selectSong } id="songSelector" defaultValue={arrangerState[arrangerState.selectedSong]}>
                        { Object.keys(arrangerState.songs).map(key => {
                            return arrangerState.songs[key] ? <option value={key} key={ `songSelector, song${key}`}> { arrangerState.songs[key].name } </option> : null;
                        }) }
                    </select>
                </form>
                <div className="addSong" onClick={ addSong } >+</div>
                        { removeS }
            </div>
            <table className="editor">
                <thead>
                    <tr>
                        <th>Pattern</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Repeat</th>
                        <th className="muteHeader">
                            Mute
                        <div onClick={ prependRow } className="addRow">
                                    +
                        </div>
                        </th>
                    </tr>
                </thead>
                { arrangerState['songs'][arrangerState.selectedSong].events.map((eventObject, ix) => {
                    return (<tbody key={`song${arrangerState.selectedSong} event${eventObject.id}`}>
                        <tr className="rowArranger" >
                            <td>
                                <select onChange={(e) => setPattern(e, ix)} id="" defaultValue={eventObject.pattern}>
                                    <option value="- - - - - ">- - - - -</option>
                                    { Object.keys(SeqCtx).map( key => {
                                        return parseInt(key) >= 0 ? <option key={ `song${arrangerState.selectedSong} event${eventObject.id} pattern${key}` } value={ key }> { SeqCtx[key].name }</option> : null;
                                    }) }
                                </select>
                            </td>
                            <td>
                                <input className="arrangerStart" type="number" min='0' max='64' onChange={(e) => setStart(e, ix) } defaultValue={ eventObject.start }/>
                            </td>
                            <td>
                                <input className="arrangerEnd" type="number" min='1' max='128' onChange={(e) => setEnd(e, ix) } defaultValue={ eventObject.end }/>
                            </td>
                            <td>
                                <input className="arrangerRepeat" type="number" min='0' max='128' onChange={(e) => setRepeat(e, ix) } defaultValue={ eventObject.repeat }/>
                            </td>
                            <td className='lastItem'>
                                <input className="arrangerMute"type="text" onKeyDown={(e) => setMute(e, ix) } placeholder={ mutePlaceholder(ix) }/>
                                <div onClick={(e) => addRow(ix) } className="addRow">
                                    +
                                </div>
                                <div onClick={(e) => removeRow(ix) } className="removeRow">
                                    -
                                </div>
                            </td>
                        </tr>
                    </tbody>)
                }) }
            </table>
        </div>
    )
}

export default Arranger;