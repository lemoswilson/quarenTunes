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
        trackCount = TrkCtx.trackCount;


    const [arrangerState, setArranger] = useState({
        mode: 'pattern',
        following: false,
        directChange: false,
        patternStartTime: 0,
        songs: {
            0: [],
        }
    }),
        modes = ['pattern', 'chain', 'song'],
        [, updateState] = React.useState(),
        forceUpdate = React.useCallback(() => updateState({}), []);

    // Subscribing Arranger Context to any changes in the arranger
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        ArrCtx.updateArrCtx(arrangerState);
    }, [arrangerState]);

    // Set scheduler - - - - - - - - - - - - - - - - - - - - - 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
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
                            console.log('[Arranger.js]: addingCallback, track', ix, 'pattern', activePatternNumber);
                            activePattern['tracks'][ix]['triggState'].callback = TrkCtx[ix][3];
                            console.log('[Arranger.js]: addingCallback, callback in the object',
                                             activePattern['tracks'][ix]['triggState'].callback === TrkCtx[ix][3]);
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
            } 
        }
    }, [activePattern, isPlaying, arrangerState.mode, trackCount])

    // State changing methods - - - - - - - - - - - - - - - - - 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const setMode = (newMode) => {
        setArranger(state => ({
            ...state,
            mode: newMode,
        }));
    } ;

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
            <div className="editor">

            </div>
        </div>
    )
}

export default Arranger;