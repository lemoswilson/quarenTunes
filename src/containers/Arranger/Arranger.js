import React, { useEffect, useContext, useState, useRef } from 'react';
import './Arranger.scss'
import trackContext from '../../context/trackContext';
import sequencerContext from '../../context/sequencerContext';
import arrangerContext from '../../context/arrangerContext';
import transportContext from '../../context/transportContext';
import toneContext from '../../context/toneContext';
import usePrevious from '../../hooks/usePrevious';

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
        patternTrackerRef = useRef([]),
        trackCount = TrkCtx.trackCount;


    const [arrangerState, setArranger] = useState({
        mode: 'pattern',
        following: false,
        directChange: false,
        patternStartTime: 0,
        selectedSong: 0,
        counter: 1,
        patternChangerScheduler: null,
        patternTracker: patternTrackerRef,
        songs: {
            0: {
                name: 'song 1',
                events: [{
                    pattern: null,
                    repeat: null,
                    mute: [],
                    id: 0,
                }],
                counter: 1,
            },
        }, 
    }),
        modes = ['pattern', 'song'],
        followingModes = ['free', 'following'],
        [, updateState] = React.useState(),
        forceUpdate = React.useCallback(() => updateState({}), []),
        currentSong = arrangerState['selectedSong'],
        arrangerMode = arrangerState['mode'],
        activeSongObject = arrangerState['songs'][arrangerState.selectedSong],
        isFollowing = arrangerState.following,
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
            // Setting the Tone.Transport to loop in the initial state;
            Tone.Transport.loop = true;
            Tone.Transport.loopEnd = '1m';
            setTimeout(() => {
                forceUpdate();
            }, 500)
        }        
    };

    // If in patternMode call setupPatternMode
    // If in song mode cue the first song and schedule a callback 
    // to check the state of the arranger? 
    useEffect(() => {
        // console.log('[Arranger.js]: SETTING PLAYBACK', 'arrangerMode', arrangerMode, 'previousArrangerMode', previousMode);
        if (Tone.Transport.state !== 'started'){
            if(arrangerMode === 'pattern' && previousMode === 'pattern' || !previousMode){
                console.log('[Arranger.js]: SETTING PATTERNMODE');
                setupPatternMode();
            } else if (arrangerMode === 'pattern' && previousMode === 'song') {
                // cancel playback and then setup pattern mode
                Tone.Transport.cancel(0);
                setupPatternMode();
            } else if ( arrangerState.mode === 'song') {
                Tone.Transport.loop = false;
                if(previousMode === 'pattern'){
                    // stop and mute all the scheduled patterns of the last selected pattern
                    // turn of looop in the transport - - - - - - - - - - - - - - - - - - - - 
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
                    if (array[index-1] && array[index -1].pattern === value.pattern){
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
        let events = args[1] ? args[1] : arrangerState.songs[arrangerState.selectedSong]['events'];
        if (Tone.Transport.loop){
            Tone.Transport.loop = false;
        }
        if (events) {
            let timeCounter = 0,
            eventsLength = events.length -1;
            events.forEach((value, index, array) => {
                let repeat = value.repeat + 1,
                    secondaryTime = timeCounter,
                    rowEnd = value && SeqCtx[value.pattern] ? `0:0:${SeqCtx[value.pattern]['patternLength']*parseInt(repeat)}` : 0;
                    // timeSch = timeCounter > 0 ? Tone.Time(timeCounter, 's').toBarsBeatsSixteenths() : 0;
                    console.log('[Arranger.js]: timeCounter', timeCounter, 'endRow', Tone.Time(rowEnd).toSeconds());
                if (parseInt(value.pattern) >= 0){
                    console.log('[Arranger.js]: theres a pattern at index', index, 'and it is', value.pattern, 'timeCounter', timeCounter, 'endRow', Tone.Time(rowEnd).toSeconds());
                    if (index === 0){
                        console.log('[Arranger.js]: scheduling index', index);
                        Tone.Transport.schedule(time => {
                            console.log('[Arranger.js]: should be setting patternTracker', 0);
                            // setArranger(state => ({
                            //     ...state,
                            //     patternTracker: [value.pattern, 0],
                            // }))
                            arrangerState.patternTracker.current = [value.pattern, 0]
                            Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                let trackLength = SeqCtx[value.pattern]['tracks'][track]['length']
                                SeqCtx[value.pattern]['tracks'][track].triggState.mute = false;
                                SeqCtx[value.pattern]['tracks'][track].triggState.loop = true;
                                SeqCtx[value.pattern]['tracks'][track].triggState.loopEnd = `0:0:${trackLength}`;
                                SeqCtx[value.pattern]['tracks'][track].triggState.start('+0');
                                return '';
                            })
                        }, 0);
                    } else {
                        console.log('[Arranger.js]: scheduling index', index);
                        Tone.Transport.schedule(time => {
                            console.log('[Arranger.js]: should be setting patternTracker', secondaryTime);
                            // setArranger(state => ({
                            //     ...state,
                            //     patternTracker: [value.pattern, secondaryTime],
                            // }));
                            arrangerState.patternTracker.current = [value.pattern, secondaryTime];
                            if (array[index -1].pattern === value.pattern){
                                Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                    if (SeqCtx[value.pattern]['tracks'][track].triggState.state !== 'started'){
                                        SeqCtx[value.pattern]['tracks'][track].triggState.start("+0");
                                    }
                                })
                            } else {
                                Object.keys(SeqCtx[value.pattern]['tracks']).map(track => {
                                    let trackLength = SeqCtx[value.pattern]['tracks'][track]['length'];
                                    if (parseInt(array[index-1].pattern) >= 0) {
                                        SeqCtx[array[index -1].pattern]['tracks'][track].triggState.stop();
                                        SeqCtx[array[index -1].pattern]['tracks'][track].triggState.mute = true;
                                        SeqCtx[array[index -1].pattern]['tracks'][track].triggState.loop = false;
                                    }
                                    SeqCtx[value.pattern]['tracks'][track].triggState.loop = true;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.loopEnd = `0:0:${trackLength}`;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.mute = false;
                                    SeqCtx[value.pattern]['tracks'][track].triggState.start('+0');
                                    // return '';
                                });
                            }
                        }, timeCounter);
                    }
                } else {
                    console.log('[Arranger.js]: theres not a pattern at index', index, 'pattern', value.pattern)
                    if(index > 0 && parseInt(array[index -1].pattern) >= 0){
                        console.log('[Arranger.js]: scheduling pattern stop behind an empty song row at', timeCounter);
                        Tone.Transport.schedule(time => {
                            console.log('[Arranger.js]: should be setting patternTracker, and stoping pattern vefore which is', array[index-1].pattern);
                            // setArranger(state => ({
                            //     ...state,
                            //     patternTracker: [null, secondaryTime],
                            // })); 
                            // arrangerState.patternTracker.current = [null, secondaryTime];
                            Object.keys(SeqCtx[array[index-1].pattern]['tracks']).map(track => {
                                SeqCtx[array[index -1].pattern]['tracks'][track].triggState.stop();
                                SeqCtx[array[index -1].pattern]['tracks'][track].triggState.mute = true; 
                                // return '';
                            // }, timeCounter);
                            });
                        }, timeCounter);
                    }
                }
            console.log('[Arranger.js] should be summing rowEnd', rowEnd, 'timeCounter', timeCounter);
            timeCounter = timeCounter + Tone.Time(rowEnd).toSeconds();
            });
            // if (SeqCtx[events[eventsLength]] && SeqCtx[events[eventsLength]].pattern){
            if (SeqCtx[events[eventsLength].pattern]){
                console.log('[Arranger.js]: Stopping last pattern at time', timeCounter, 'events', events, 'eventsLength', eventsLength, 'CTX', SeqCtx, 'naa', SeqCtx[events[eventsLength].pattern]);
                Tone.Transport.schedule(time => {
                    console.log('[Arranger.js]: should be stopping fucking pattern');
                    // setArranger(state => ({
                    //     ...state,
                    //     patternTracker: [],
                    // }));  
                    arrangerState.patternTracker.current = [];
                    // arrangerState.patternTracker.current = [0];
                    Object.keys(SeqCtx[events[eventsLength].pattern]['tracks']).map(track => {
                        SeqCtx[events[eventsLength].pattern]['tracks'][track].triggState.stop();
                        SeqCtx[events[eventsLength].pattern]['tracks'][track].triggState.mute = true;
                        // return '';
                    });
                }, timeCounter);
            }
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
            let events = [...state.songs[state.selectedSong]['events']];
            events.unshift({
                pattern: null,
                start: 0,
                end: 16,
                repeat: null,
                mute: [],
                id: state.songs[state.selectedSong]['counter'],
            })
        if (isPlaying) {
            Tone.Transport.cancel(0);
            scheduleFromIndex(0, events);
        }
            copyState.songs[state.selectedSong]['counter'] = state.songs[state.selectedSong]['counter'] + 1;
            copyState.songs[state.selectedSong]['events'] = events;
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
        if (repeat >= 0) {
            
        } else {
            repeat = 0;
        }
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
    
    const selectedFollow = (mode) => {
        if (mode === 'following' && !isFollowing) {
            setArranger(state => ({
                ...state,
                following: true,
            }));
        } else if (mode === 'free' && isFollowing) {
            setArranger(state => ({
                ...state,
                following: false,
            }));
        }
    }

    const followStyle = (mode) => {
        if ((isFollowing && mode === 'following') 
        || (!isFollowing && mode === 'free')) {
            return ' selected'
        } else {
            return ''
        }
    }

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
            <div className="followMode">
                { followingModes.map(mode => {
                    return <div className={`${mode}${followStyle(mode)}`} onClick={(e) => selectedFollow(mode)} key={mode}>{mode}</div>
                }) }
            </div>
            <div className="songManager">
                <form>
                    <label htmlFor="songSelector">Song</label>
                    <select onChange={ selectSong } id="songSelector" defaultValue={arrangerState.songs[arrangerState.selectedSong]}>
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