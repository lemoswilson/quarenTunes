import React, { Component } from 'react';
import './Instruments.scss';
import Instrument from './Instrument/Instrument';
// import './AnalogStyle/AnalogStyle';

class Instruments extends Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        console.log('[Instruments.js]: ComponentDidUpdate, instrumentList:', this.props.instrumentList);
    }

    selected = (index) => {
        return index === this.props.selectedInstrument ? true : false; 
    }

    render() {
        return(
            <div className="instruments">
                {this.props.instrumentList.map((instrument, index) => {
                    return <Instrument key={`${index}Track`} trackIndex={index} InstrumentType={instrument} display={() => this.selected(index)}/>
                })}
            </div>
        )
    }
}

export default Instruments;