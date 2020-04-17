import React, { Component } from 'react';
import './MainWindow.scss';
import Instruments from './Instruments/Instruments';
import Effects from './Effects/Effects'
import InstrumentSelector from './../../components/Layout/InstrumentSelector/InstrumentSelector'
import trackContext from '../../context/trackContext';

class MainWindow extends Component {

    constructor(props) {
        super(props);
        this.state = {
            instruments: [{instrument:'FMSynth', id:0}],
            fx: [[], [], [], []],
            selectedInstrument: 0,
            trackCount: 1,
            counter: 0,
        }
    }

    static contextType = trackContext;

    changeInstrument = (instrument, index) => {
        this.setState((state) => {
            let inst = state.instruments;
            inst[index].instrument = instrument;
            return {
                ...state,
                instruments: inst,
            }
        })
    }

    addInstrument = () => {
        this.setState((state) => {
            let inst = state.instruments;
            inst.push({instrument: 'FMSynth', id: state.counter + 1});
            return {
                ...state,
                instruments: inst,
                trackCount: state.trackCount + 1,
                counter: state.counter + 1,
            }
        })
    }

    removeInstrument = (index) => {
        this.context.deleteTrackRef(index, this.state.trackCount - 1);
        this.setState((state) => {
            let inst = state.instruments;
            inst.splice(index, 1);
            return {
                ...state,
                instruments: inst,
                trackCount: state.trackCount - 1,
            }
        })
        console.log('[MainWindow.js]: should be deliting track ref');
        // this.forceInstrumentRender();
    }

    forceInstrumentRender = (callback) => {
        callback();
    }

    showInstrument = (index) => {
        this.setState({
            selectedInstrument: index,
        })
        this.context.getSelectedTrack(index);
    }


    render() {
        return(
            <div className="mainWindow">
                <div className="instrumentWrapper">
                    <div className="trackControl">
                        <div className='addInstrument' onClick={this.addInstrument}>+</div>
                        { this.state.instruments.map((instrument, index) => {
                            return <InstrumentSelector key={instrument.id} unique={instrument.id} trackIndex={index} instrument={instrument.instrument} setInstrument={this.changeInstrument} removeInstrument={this.removeInstrument} showInstrument={this.showInstrument}></InstrumentSelector>
                        }) } 
                        </div>
                    <Instruments instrumentList={this.state.instruments} selectedInstrument={this.state.selectedInstrument}></Instruments>
                </div>
                <Effects></Effects>
            </div>
        )
    }
}

export default MainWindow;