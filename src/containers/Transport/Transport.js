import React, { useContext, useEffect } from 'react';
import ToneContext from '../../context/toneContext';
import './Transport.scss';
import { useState } from 'react';


const Transport = (props) => {
    const [transportState, setTransportState] = useState({
        isPlaying: false,
        indicatorPosition: '0:0:0',
        bpm: 120,
        loopStart: 0,
        loopEnd: '4m',
        mode: 'pattern' // three modes, pattern, song, 
    })
    let Tone = useContext(ToneContext);


    useEffect(() => {
        if(transportState.isPlaying){
            Tone.Transport.start();
        } else {
            Tone.Transport.stop();
        }
    }, [Tone, transportState.isPlaying]) ;

    const start = () => {
        if (!transportState.isPlaying){
            setTransportState({
                isPlaying: true,
            })
            Tone.Transport.start();
        }
        // se ja tiver tocando voltar para o indicador position
    }

    const stopTransport = () => {
        if (transportState.isPlaying) {
        Tone.Transport.stop();
        }
    }

        return(
            <div className="transport">
                <div className="start" onClick={start}>Start</div>
                <div className="stop" onClick={stopTransport}>Stop</div>
            </div>
        )
}

export default Transport;