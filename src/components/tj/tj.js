import React from 'react';
import ToneContext from '../../context/toneContext';
import { useContext } from 'react';

const Tj = (props) => {
    let Tone = useContext(ToneContext);

    function stop() {
        Tone.Transport.stop();
        // counter = 0;
    }

    return (
        <button onClick={stop}>stop</button> 
    )

}

export default Tj;