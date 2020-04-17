import React, { Component } from 'react';
import './Instruments.scss';
import Instrument from './Instrument/Instrument';

class Instruments extends Component {

    selected = (index) => {
        return index === this.props.selectedInstrument ? true : false; 
    }

    render() {
        return(
            <div className="instruments">
                {this.props.instrumentList.map((instrument, index) => {
                    return <Instrument key={instrument.id} trackIndex={index} InstrumentType={instrument.instrument} display={() => this.selected(index)}/>
                })}
            </div>
        )
    }
}

export default Instruments;