import React, { useEffect, useContext, useState } from 'react';
import './Arranger.scss'
import trackContext from '../../context/trackContext';
import sequencerContext from '../../context/sequencerContext';
import arrangerContext from '../../context/arrangerContext';
import transportContext from '../../context/transportContext';
import toneContext from '../../context/toneContext';

const Arranger = (props) => {
    // Initializing contexts and state and necessary variables- - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    let TrkCtx = useContext(trackContext),
        SeqCtx = useContext(sequencerContext),
        ArrCtx = useContext(arrangerContext),
        Tone = useContext(toneContext),
        TrsCtx = useContext(transportContext),
        activePattern = SeqCtx[SeqCtx.activePattern],
        isPlaying = TrsCtx.isPlaying,
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
                    Tone.Transport.stop();
                    // console.log('[Arranger.js]: SeqCtx:', SeqCtx, 'TrsCtx', TrsCtx );
                    Tone.Transport.loop = Tone.Transport.loop ? Tone.Transport.loop : true;
                    Tone.Transport.loopStart = 0;
                    Tone.Transport.loopEnd = `0:0:${SeqCtx[SeqCtx.activePattern]['patternLength']}`;
            
                    Object.keys(SeqCtx[SeqCtx.activePattern]['tracks']).map(ix => {
                        if (SeqCtx[SeqCtx.activePattern]['tracks'][ix]){
                            SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].callback = TrkCtx[ix][3];
                            if (ArrCtx.mode === 'pattern') {
                                SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].loop = true;
                                SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].loopStart = 0;
                                SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].loopEnd = `0:0:${SeqCtx[SeqCtx.activePattern]['tracks'][ix].length}`;
                            }
                            SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].mute = false;
                            SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].start(0);
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