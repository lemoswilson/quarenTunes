import React from 'react';
import FMSynth from '../FMSynth/FMSynth'

const Instrument = (props) => {


    const instrumentStyle = props.display() ? null : {display: 'none'};

    const loadInstrument = (type) => {
        if (type === 'FMSynth') {
            return (
            <div className='instrument' style={instrumentStyle}>
                <p>{`track ${props.trackIndex + 1}`}</p>
                <FMSynth trackIndex={props.trackIndex} selected={props.display}></FMSynth>
            </div>
            )
        } 
    }
    
    return loadInstrument(props.InstrumentType);
}

export default Instrument;