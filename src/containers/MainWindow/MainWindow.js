import React, { useState, useContext } from 'react';
import './MainWindow.scss';
import Instruments from './Instruments/Instruments';
import Effects from './Effects/Effects'
import InstrumentSelector from './../../components/Layout/InstrumentSelector/InstrumentSelector'
import trackContext from '../../context/trackContext';
import sequencerContext from '../../context/sequencerContext';
import toneContext from '../../context/toneContext';
import { returnPartArray } from '../Sequencer/Sequencer';


function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
  }

const MainWindow = (props) => {
        const [state, setState] = useState({
            instruments: [{instrument:'FMSynth', id:0}],
            fx: [[], [], [], []],
            selectedInstrument: 0,
            trackCount: 1,
            counter: 0,
        })
    

    let TrackContext = useContext(trackContext);
    let SequencerContext = useContext(sequencerContext);
    let Tone = useContext(toneContext)

    const changeInstrument = (instrument, index) => {
        setState((state) => {
            let inst = state.instruments;
            inst[index].instrument = instrument;
            return {
                ...state,
                instruments: inst,
            }
        })
    }

    const addInstrument = () => {
        SequencerContext.addTrackToSequencer(state.trackCount, {
            length: SequencerContext[SequencerContext.activePattern]['patternLength'],
            triggState: new Tone.Part(() => {}, returnPartArray(SequencerContext[SequencerContext.activePattern]['patternLength'])),
        })
        setState((state) => {
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

    const removeInstrument = (index) => {
        TrackContext.deleteTrackRef(index, state.trackCount - 1);
        setState((state) => {
            let inst = state.instruments;
            inst.splice(index, 1);
            let selectedInstrument = index === state.selectedInstrument ? state.selectedInstrument - 1 : state.selectedInstrument ;
            return {
                ...state,
                instruments: inst,
                trackCount: state.trackCount - 1,
                selectedInstrument: selectedInstrument,
            }
        })

        let copySeq = Object.assign({}, SequencerContext);
        copySeq[SequencerContext.activePattern]['tracks'][index] = undefined;
        range(index, state.trackCount).map(index => {
            if (copySeq[SequencerContext.activePattern]['tracks'][index + 1]) {
                copySeq[SequencerContext.activePattern]['tracks'][index] = copySeq[SequencerContext.activePattern]['tracks'][index + 1]; 
            } else {
                return null;
            }
            return null;
        })
        copySeq[SequencerContext.activePattern]['tracks'][state.trackCount - 1] = undefined;
        SequencerContext.updateSequencerState(SequencerContext.activePattern, copySeq[SequencerContext.activePattern]);
        SequencerContext.updateSequencerState(copySeq)
        console.log('[MainWindow.js]: should be deliting track ref');
    }


    const showInstrument = (index) => {
        setState(state => ({
            ...state,
            selectedInstrument: index,
        })
        )
        TrackContext.getSelectedTrack(index);
    }


    return(
        <div className="mainWindow">
            <div className="instrumentWrapper">
                <div className="trackControl">
                    <div className='addInstrument' onClick={addInstrument}>+</div>
                    { state.instruments.map((instrument, index) => {
                        return <InstrumentSelector key={instrument.id} unique={instrument.id} trackIndex={index} instrument={instrument.instrument} setInstrument={changeInstrument} removeInstrument={removeInstrument} showInstrument={showInstrument}></InstrumentSelector>
                    }) } 
                    </div>
                <Instruments instrumentList={state.instruments} selectedInstrument={state.selectedInstrument}></Instruments>
            </div>
            <Effects></Effects>
        </div>
    )
}

export default MainWindow;