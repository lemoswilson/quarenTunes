import React, { useState, useContext, useEffect } from 'react';
import './MainWindow.scss';
import Instruments from './Instruments/Instruments';
import Effects from './Effects/Effects'
import InstrumentSelector from './../../components/Layout/InstrumentSelector/InstrumentSelector'
import trackContext from '../../context/trackContext';
import sequencerContext from '../../context/sequencerContext';
import toneContext from '../../context/toneContext';


export function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

const MainWindow = (props) => {
    // Initialize context and states - - - - - - - - - - - - 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    let TrackContext = useContext(trackContext), 
        SequencerContext = useContext(sequencerContext), 
        Tone = useContext(toneContext);

    const [state, setState] = useState({
        instruments: [{instrument:'FMSynth', id:0}],
        fx: [[], [], [], []],
        selectedInstrument: 0,
        trackCount: 1,
        counter: 0,
    });

    // Pass instrument unique id to TrackContext - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    const passInstrumentId = (id, index) => {
        TrackContext.getInstrumentId(id, index);
    };

    // Subscribing TrackContext ids to any change in the State
    useEffect(() => {
        state.instruments.map((instrumentObject, index) => {
            passInstrumentId(instrumentObject.id, index);
            return 0;
        });
    }, [state]);

    // Subscribing TrackContext trackCount to any change in state trackCount
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    useEffect(() => {
        TrackContext.getTrackCount(state.trackCount);
    }, [state.trackCount])

    // State handling methods that will be passed to InstrumentSelector component
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const changeInstrument = (instrument, index) => {
        setState((state) => {
            let inst = state.instruments;
            inst[index].instrument = instrument;
            return {
                ...state,
                instruments: inst,
            }
        })
    };

    const addInstrument = () => {
        SequencerContext.addTrackToSequencer(state.trackCount);
        
        setState((state) => {
            let inst = state.instruments;
            inst.push({instrument: 'FMSynth', id: state.counter + 1});
            return {
                ...state,
                instruments: inst,
                trackCount: state.trackCount + 1,
                counter: state.counter + 1,
            }
        });
    };

    const removeInstrument = (index) => {
        console.log('[MainWindow.js]: deleting track', index);
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
        });

        let copySeq = Object.assign({}, SequencerContext);
        Object.keys(SequencerContext).map(key => {
            if (parseInt(key) >= 0) {
                copySeq[key] = {
                    ...SequencerContext[key],
                    'tracks': {
                        ...SequencerContext[key]['tracks'],
                        [index]: {
                            ...SequencerContext[key]['tracks'][index],
                        }
                    },
                }
                copySeq[key]['tracks'][index] = undefined;
                range(index, state.trackCount).map(index => {
                    if (copySeq[key]['tracks'][index + 1]) {
                        copySeq[key]['tracks'][index + 1] = {...SequencerContext[key]['tracks'][index+1]};
                        copySeq[key]['tracks'][index] = {...SequencerContext[key]['tracks'][index]}
                        copySeq[key]['tracks'][index] = copySeq[key]['tracks'][index + 1]
                    }
                    return null;
                });
            }
        });
        Object.keys(SequencerContext).map(key => {
            if (parseInt(key) >= 0){
                copySeq[key]['tracks'][state.trackCount - 1] = undefined;
            }
            return 0;
        });
        SequencerContext.updateAll(copySeq);
        SequencerContext.updateSequencerState(copySeq);
    };

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