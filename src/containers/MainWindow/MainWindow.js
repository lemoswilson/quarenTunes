import React, { useState, useContext, useEffect, useRef } from 'react';
import './MainWindow.scss';
import Instruments from './Instruments/Instruments';
import Effects from './Effects/Effects'
import InstrumentSelector from './../../components/Layout/InstrumentSelector/InstrumentSelector'
import webMidiContext from '../../context/webMidiContext';
import trackContext from '../../context/trackContext';
import sequencerContext from '../../context/sequencerContext';


export function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

const MainWindow = (props) => {
    // Initialize context and states - - - - - - - - - - - - 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    let TrkCtx = useContext(trackContext), 
        selectedTrackRef = useRef(0),
        SeqCtx = useContext(sequencerContext);

    const [state, setState] = useState({
        instruments: [{instrument:'FMSynth', id:0, midi: false}],
        fx: [[], [], [], []],
        selectedInstrument: 0,
        trackCount: 1,
        counter: 0,
        selectedTrackRef: selectedTrackRef,
    });

    useEffect(() => {
        if (!TrkCtx.selectedTrackRef){
            TrkCtx.getSelectedTrackRef(selectedTrackRef);
        }
    }, [])

    useEffect(() => {
        
    }, []);

    // Pass instrument unique id to TrackContext - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    const passInstrumentId = (id, index) => {
        TrkCtx.getInstrumentId(id, index);
    };

    // Pass midi controllers to TrackContext --
    const passMidiControllers = (index, midi) => {
        TrkCtx.getTrackMIDIControllers(index, midi);
    };

    // Subscribing TrackContext ids to any change in the State
    useEffect(() => {
        state.instruments.map((instrumentObject, index) => {
            passInstrumentId(instrumentObject.id, index);
            passMidiControllers(index, instrumentObject.midi);
            return 0;
        });
    }, [state]);

    // Subscribing TrackContext trackCount to any change in state trackCount
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    useEffect(() => {
        TrkCtx.getTrackCount(state.trackCount);
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
        SeqCtx.addTrackToSequencer(state.trackCount);
        
        setState((state) => {
            let inst = state.instruments;
            inst.push({instrument: 'FMSynth', id: state.counter + 1, midi: false});
            return {
                ...state,
                instruments: inst,
                trackCount: state.trackCount + 1,
                counter: state.counter + 1,
            }
        });
    };

    const removeInstrument = (index) => {
        // Pausando todas as parts dessa track
        Object.keys(SeqCtx).map(key => {
            if (parseInt(key) >= 0){
                SeqCtx[key]['tracks'][index]['triggState'].stop();
            }
            return '';
        });
        TrkCtx.deleteTrackRef(index, state.trackCount - 1);
        setState((state) => {
            let inst = state.instruments;
            inst.splice(index, 1);
            let selectedInstrument = index === state.selectedInstrument && SeqCtx[SeqCtx.activePattern]['tracks'][state.selectedInstrument -1] ? state.selectedInstrument - 1 : null ;
            TrkCtx.getSelectedTrack(selectedInstrument);
            selectedTrackRef.current = selectedInstrument;
            return {
                ...state,
                instruments: inst,
                trackCount: state.trackCount - 1,
                selectedInstrument: selectedInstrument,
            }
        });

        let copySeq = Object.assign({}, SeqCtx);
        Object.keys(SeqCtx).map(key => {
            if (parseInt(key) >= 0) {
                copySeq[key] = {
                    ...SeqCtx[key],
                    'tracks': {
                        ...SeqCtx[key]['tracks'],
                        [index]: {
                            ...SeqCtx[key]['tracks'][index],
                        }
                    },
                }
                copySeq[key]['tracks'][index] = undefined;
                range(index, state.trackCount).map(index => {
                    if (copySeq[key]['tracks'][index + 1]) {
                        copySeq[key]['tracks'][index + 1] = {...SeqCtx[key]['tracks'][index+1]};
                        copySeq[key]['tracks'][index] = {...SeqCtx[key]['tracks'][index]}
                        copySeq[key]['tracks'][index] = copySeq[key]['tracks'][index + 1]
                    }
                    return null;
                });
            }
            return '';
        });
        Object.keys(SeqCtx).map(key => {
            if (parseInt(key) >= 0){
                copySeq[key]['tracks'][state.trackCount - 1] = undefined;
            }
            return 0;
        });
        SeqCtx.updateAll(copySeq);
        SeqCtx.updateSequencerState(copySeq);
    };

    const showInstrument = (index) => {
        setState(state => ({
            ...state,
            selectedInstrument: index,
        })
        )
        selectedTrackRef.current = index;
        TrkCtx.getSelectedTrack(index);
    }

    const selectMidiInstrument = (trackIndex, midi) => {
        setState(state => {
            let copyState = {
                ...state,
                instruments: [...state.instruments],
            }
            copyState.instruments[trackIndex]['midi'] = midi;
            return copyState;
        })
        TrkCtx.getTrackMIDIControllers(trackIndex, midi);
    }


    return(
        <div className="mainWindow">
            <div className="instrumentWrapper">
                <div className="trackControl">
                    <div className='addInstrument' onClick={addInstrument}>+</div>
                    { state.instruments.map((instrument, index) => {
                        return <InstrumentSelector key={instrument.id} 
                                unique={instrument.id} 
                                trackIndex={index} 
                                instrument={instrument.instrument} 
                                midi={instrument.midi}
                                setMidi={selectMidiInstrument}
                                setInstrument={changeInstrument} 
                                removeInstrument={removeInstrument} 
                                showInstrument={showInstrument}></InstrumentSelector>
                    }) } 
                    </div>
                <Instruments instrumentList={state.instruments} selectedInstrument={state.selectedInstrument}></Instruments>
            </div>
            <Effects></Effects>
        </div>
    )
}

export default MainWindow;