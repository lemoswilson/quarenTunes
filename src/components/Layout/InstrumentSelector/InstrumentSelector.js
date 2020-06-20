import React, { useContext, useEffect, useRef, useState } from 'react';
import webMidiContext from '../../../context/webMidiContext';
import './InstrumentSelector.scss'

const InstrumentSelector = (props) => {
    let WebMidi = useContext(webMidiContext);
    let inputs = useRef();
    const [state, setState] = useState({
        inputs: null,
    })

    useEffect(() => {
        if (!state.inputs) {
            WebMidi.enable(function(err) {
                console.log('[InstrumentSelector.js]: mapping inputs');
                inputs.current = WebMidi.inputs.map(val => {
                    return val.name;
                })
                setState(state => ({
                    inputs: inputs.current,
                }));
            });
        }
    },[])

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

    const selectMidiDevice = (e) => {
        props.selectMidiDevice(props.trackIndex, e.target.value);
    }

    const selectMidiChannel = (e) => {
        props.selectMidiChannel(props.trackIndex, e.target.value);
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

    // Conditionals 
    const midiInputs = !state.inputs ? null : state.inputs.map(value => {
        return <option key={`${props.unique}+${value}`} value={value}>{value}</option>;
    });

    const device = props.midi && props.midi.device ? props.midi.device : false;
    
    const channel = props.midi && props.midi.channel ? props.midi.channel : false;

    return (
        <div className="instrumentRow" style={style(props.trackIndex)} onClick={showInstrument}>
            <label htmlFor={`IS${props.trackIndex}`}>{`Track ${props.trackIndex + 1}:`}</label>
            <select onChange={setInstrument} value={props.instrument} id={props.unique} className="instrumentSelector">
                <option value="FMSynth">FMSynth</option>
                <option value="Sampler">Sampler</option>
                <option value="drumSynth">drumSynth</option>
                <option value="polySynth">polySynth</option>
            </select>
            <select onChange={selectMidiDevice} value={device} className="midiSelector" id={`midi${props.unique}`}>
                <option value={false}> - - - - - -</option>
                {midiInputs}
            </select>
            <select onChange={selectMidiChannel} value={channel} className="channelSelector" id={`channel${props.unique}`}>
                <option value={false}>- - - - -</option>
                <option value="all">All Channels</option>
                { [...Array(16).keys()].map(c => {
                    return <option value={c + 1} key={`${props.unique}${device}${c}`}>{`Channel ${c + 1}`}</option>
                })}
            </select>
            { removeDiv }
        </div>
    )
};

export default InstrumentSelector;