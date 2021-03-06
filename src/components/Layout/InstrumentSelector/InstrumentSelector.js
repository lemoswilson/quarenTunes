import React from 'react';
import './InstrumentSelector.scss'

const InstrumentSelector = (props) => {

    // Handlers that call back parent functions as props, and deal with its state.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const setInstrument = (e) => {
        props.setInstrument(e.target.value, props.trackIndex);
    };

    const removeInstrument = () => {
        props.removeInstrument(props.trackIndex);
    };

    const showInstrument = (e) => {
        props.showInstrument(props.trackIndex);
    }

    // I don't know why, but if I try to directly render this div in the return call I get a weird error.
    const removeDiv = <div className="removeInstrument" onClick={removeInstrument}>-</div>;

    const style = (index) => {
        if (index > 0) {
            return {
                borderBottom: '1px solid black',
                borderTop: 'none'
            };
        }
    };

    return (
        <div className="instrumentRow" style={style(props.trackIndex)} onClick={showInstrument}>
            <label htmlFor={`IS${props.trackIndex}`}>{`Track ${props.trackIndex + 1}:`}</label>
            <select onChange={setInstrument} value={props.instrument} id={props.unique} className="instrumentSelector">
                <option value="FMSynth">FMSynth</option>
                <option value="Sampler">Sampler</option>
                <option value="drumSynth">drumSynth</option>
                <option value="polySynth">polySynth</option>
            </select>
            { removeDiv }
        </div>
    )
};

export default InstrumentSelector;