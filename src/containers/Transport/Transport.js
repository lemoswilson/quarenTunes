import React, { useContext, useEffect } from 'react';
import ToneContext from '../../context/toneContext';
import './Transport.scss';
import { useState } from 'react';
import trackContext from '../../context/trackContext';
import sequencerContext from '../../context/sequencerContext';
import arrangerContext from '../../context/arrangerContext';
import transportContext from '../../context/transportContext';


const Transport = (props) => {
    const [transportState, setTransportState] = useState({
        isPlaying: false,
        indicatorPosition: '0:0:0',
        bpm: 120,
        loopStart: 0,
        loopEnd: '4m',
        masterVolume: -3,
        // mode: 'pattern' // three modes, pattern, song, 
    })
    let Tone = useContext(ToneContext),
        TrkCtx = useContext(trackContext),
        SeqCtx = useContext(sequencerContext),
        TrsCtx = useContext(transportContext),
        ArrCtx = useContext(arrangerContext);

    useEffect(() => {
        Tone.Master.volume.value = transportState.masterVolume;
    }, [transportState.masterVolume])

    // Subscribing transportContext to any change in transportState
    useEffect(() => {
        TrsCtx.updateTrsCtx(transportState);
    }, [transportState]);

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
        Tone.Transport.start();
    }

    const stopCallback = () => {
        Object.keys(SeqCtx[SeqCtx.activePattern]['tracks']).map(track => {
            if (SeqCtx[SeqCtx.activePattern]['tracks'][track]) {
                SeqCtx[SeqCtx.activePattern]['tracks'][track].triggState.stop();
            }
        });
    }

    const stop = () => {
        Tone.Transport.stop();
        if (transportState.isPlaying) {
            setTransportState(state => ({
                ...state,
                isPlaying: false,
            }))
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