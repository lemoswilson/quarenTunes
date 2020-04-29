import React, { useEffect, useContext, useState } from 'react';
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
        isLooping = TrsCtx.loop,
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
        }
    }),
        modes = ['pattern', 'chain', 'song'],
        [, updateState] = React.useState(),
        forceUpdate = React.useCallback(() => updateState({}), []),
        currentSong = arrangerState['selectedSong'],
        previousSong = usePrevious(currentSong),
        arrangerMode = arrangerState['mode'],
        previousMode = usePrevious(arrangerMode);

    // Subscribing Arranger Context to any changes in the arranger
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        ArrCtx.updateArrCtx(arrangerState);
    }, [arrangerState]);

    // Set scheduler, if SeqCtx[SeqCtx.activePattern] not available yet, 
    // setTimeout a forceRender until its available - - - - - - - - - - 
    useEffect(() => {
        if (Tone.Transport.state !== 'started'){
            if(arrangerState.mode === 'pattern'){
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
                    });
                } else {
                    console.log('[Arranger.js]: forcou update');
                    setTimeout(() => {
                        forceUpdate();
                    }, 500)
                }
            } else if ( arrangerState.mode === 'song') {
                if(previousSong !== currentSong){
                    // stop and mute all the scheduled patterns of the last selected sng
                }
               if(Tone.Transport.loop) {
                    Tone.Transport.loop = false;
                    // scheduling the parts selected on the songs;
                    arrangerState.song[arrangerState.selectedSong]['events'].forEach((value, index, array) => {
                        
                    })
               } 
            } 
        } else {
            // rearranging song after deleting song row
        }
    }, [activePattern, isPlaying, arrangerState.mode, trackCount, arrangerMode])

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
            });
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

    const removeRow = (index) => {
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
            let parsa = [...copyState.songs[copyState.selectedSong]['events']]
            parsa.splice(index, 1);
            copyState.songs[state.selectedSong]['events'] = parsa;
            return copyState;
        }) 
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
            let parsa = [...copyState.songs[copyState.selectedSong]['events']]
            parsa.unshift({
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
    }

    const addRow = (index) => {
        console.log('[Arranger.js]: should be adding a new row')
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
            let parsa = [...copyState.songs[copyState.selectedSong]['events']]
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
    };

    const selectSong = (e) => {
        let songIndex = e.target.value;
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

    const setName = (newName) => {

    };

    const setPattern = (e, eventIndex) => {
        let pat = parseInt(e.target.value);        
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
                return copyState;
            })
    };

    const setRepeat = (e, eventIndex) => {
        let repeat = parseInt(e.target.value);        
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
                return copyState;
            })
    };

    const setStart = (e, eventIndex) => {
        let startTime = parseInt(e.target.value);        
        // if (startTime && startTime != ''){
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
                return copyState;
            })
        // }
    };

    const setEnd = (e, eventIndex) => {
        let endTime = parseInt(e.target.value);        
        if (endTime && endTime != ''){
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
        }
    };

    const setMute = (e, eventIndex) => {
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
                return copyState;
            });
            e.target.value = '';
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

    const removeS = songAmount() > 1 ? <div className="removeSong"onClick={ removeSong }>-</div> : null;

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
                            if (arrangerState.songs[key]) {
                            return <option value={key} key={ `songSelector, song${key}`}> { arrangerState.songs[key].name } </option>
                            }
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
                                        if (parseInt(key) >= 0) {
                                        return <option key={ `song${arrangerState.selectedSong} event${eventObject.id} pattern${key}` } value={ key }> { SeqCtx[key].name }</option>
                                        }
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