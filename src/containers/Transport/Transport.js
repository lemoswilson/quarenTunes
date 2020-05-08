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
        loop: true,
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

    // useEffect(() => {
    //     setTransportState(state => ({
    //         ...state,
    //         indicatorPosition: Tone.Transport.position,
    //     }))
    // }, [Tone.Transport.position])

    // useEffect(() => {
    //     if(transportState.isPlaying) {
    //         Tone.Transport.start('+0.05');
    //     } else {
    //         Tone.Transport.stop();
    //     }
    // }, [transportState.isPlaying])

    // Subscribing transportContext to any change in transportState
    useEffect(() => {
        TrsCtx.updateTrsCtx(transportState);
    }, [transportState]);

    const start = () => {
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
            Tone.context.latencyHint = 'playback';
            Tone.context.lookAhead = 0.2;
        }
        if (!transportState.isPlaying || Tone.Transport.state === 'started'){
            setTransportState(state => ({
                ...state,
                isPlaying: true,
            }))
        }
        Tone.Transport.start();
    }

    const stopCallback = () => {
        if (ArrCtx.mode === 'pattern'){
            Object.keys(SeqCtx[SeqCtx.activePattern]['tracks']).map(track => {
                if (SeqCtx[SeqCtx.activePattern]['tracks'][track]) {
                    console.log('[Transport.js]: cancelling callbacks, track', track);
                    SeqCtx[SeqCtx.activePattern]['tracks'][track].triggState.stop();
                }
            });
        } else {
            // ArrCtx.songs[ArrCtx.selectedSong]['events'].forEach((value, index, array) => {
            //     if(value.pattern >= 0){
            //         if (index === 0) {
            //             Object.keys(SeqCtx[value.pattern].tracks).map(track => {
            //                 SeqCtx[value.pattern]['tracks'][track].triggState.stop();
            //             });
            //         } else {
            //             if (array[index -1].pattern === value.pattern){
            //                 return;
            //             } else {
            //                 Object.keys(SeqCtx[value.pattern].tracks).map(track => {
            //                     SeqCtx[value.pattern]['tracks'][track].triggState.stop();
            //                     SeqCtx[value.pattern]['tracks'][track].triggState.mute = true;
            //                 }); 
            //             }
            //         }
            //     }
            // })
        }
        Tone.Transport.cancel();
    };

    const stop = () => {
        if (Tone.Transport.state === 'started'){
            stopCallback();
        }
        if (transportState.isPlaying) {
            // Tone.Transport.stop()
            setTransportState(state => ({
                ...state,
                isPlaying: false,
            }))
        }
        Tone.Transport.stop();
    }

        return(
            <div className="transport">
                    <div className="start" onClick={start}>Start</div>
                    <div className="stop" onClick={stop}>Stop</div>
            <p className="position">{ transportState.indicatorPosition }</p>
            </div>
        )
}

export default Transport;