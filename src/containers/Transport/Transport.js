import React, { useContext, useEffect } from 'react';
import ToneContext from '../../context/toneContext';
import './Transport.scss';
import { useState } from 'react';
import trackContext from '../../context/trackContext';
import sequencerContext from '../../context/sequencerContext';
import arrangerContext from '../../context/arrangerContext';


const Transport = (props) => {
    const [transportState, setTransportState] = useState({
        isPlaying: false,
        indicatorPosition: '0:0:0',
        bpm: 120,
        loopStart: 0,
        loopEnd: '4m',
        // mode: 'pattern' // three modes, pattern, song, 
    })
    let Tone = useContext(ToneContext),
        TrkCtx = useContext(trackContext),
        SeqCtx = useContext(sequencerContext),
        ArrCtx = useContext(arrangerContext);


    useEffect(() => {
        if(transportState.isPlaying){
            Tone.Transport.start();
        } else {
            Tone.Transport.stop();
        }
    }, [Tone, transportState.isPlaying]) ;

    const start = () => {
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        if (!transportState.isPlaying){
            setTransportState(state => ({
                ...state,
                isPlaying: true,
            }))
        }
            
        Object.keys(SeqCtx[SeqCtx.activePattern]['tracks']).map(ix => {
            console.log('[Transport.js]: Callback', TrkCtx[ix][3])
            SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].callback = TrkCtx[ix][3];
            if (ArrCtx.mode === 'pattern') {
                SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].loop = true;
                SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].loopStart = 0;
                SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].loopEnd = `0:0:${SeqCtx[SeqCtx.activePattern]['tracks'][ix].length}`;
            }
            SeqCtx[SeqCtx.activePattern]['tracks'][ix]['triggState'].start();
            return '';
        });
        console.log('[Transport.js]: Should be playing, callback = ', SeqCtx[SeqCtx.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].callback)
    }

    const stop = () => {
        if (transportState.isPlaying) {
            setTransportState(state => ({
                ...state,
                isPlaying: false,
            }))
        // Tone.Transport.stop();
        }
    }

        return(
            <div className="transport">
                <div className="start" onClick={start}>Start</div>
                <div className="stop" onClick={stop}>Stop</div>
            </div>
        )
}

export default Transport;