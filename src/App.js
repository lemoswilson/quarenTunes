import React, { Component } from 'react';
import './App.css';
import ToneContext from '../src/context/toneContext'
import AppContext from '../src/context/appContext'
import TrackContext from '../src/context/trackContext'
import * as Tone from 'tone';
import Layout from './components/Layout/Layout';
import SequencerContext from './context/sequencerContext';
import ArrangerContext from './context/arrangerContext';
import TransportContext from './context/transportContext';


class App extends Component {
  constructor(props){
    super(props);
    this.appRef = React.createRef();
    this.getTrack = (Ref, trackNumber) => {
      this.setState(state => {
        let copyState = state;
        copyState['track'][trackNumber][0] = Ref
        return copyState
      });
    }
  
    // ArrangerContext methods - - - - - - - - - - - - - - - - -
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    this.updateArrCtx = (newContext) => {
      this.setState(state => {
        let copyState = {
          ...state,
          arranger: {
            ...state.arranger,
            ...newContext,
          }
        };
        return copyState;
      });
    }

    // TransportContext methods - - - - - - - - - - - - - - - - -
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    this.updateTrsCtx = (newContext) => {
      this.setState(state => {
        let copyState = {
          ...state,
          transport: {
            ...state.transport,
            ...newContext,
          }
        };
        return copyState;
      });
    }

    // TrackContext methods - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    this.deleteTrackRef = (trackNumber, trackCounterIndex) => {
      this.setState(state => { 
        let copyState = {...state};
        copyState['track'][trackNumber] = [];
        copyState['track'][trackCounterIndex] = [];
        return copyState;
      })
    }

    this.getSelectedTrackIndex = (trackIndex) => {
      this.setState(state => {
        let copyState = state;
        copyState['track']['selectedTrack'] = trackIndex;
        return copyState;
      })
    }

    this.getTrackState = (newState, trackIndex) => {
      this.setState(state => {
        let copyState = {...state};
        copyState['track'][trackIndex][1] = newState;
        return copyState
      });
    };

    this.getInstrumentId = (id, trackIndex) => {
      this.setState(state => {
        let copyState = {
          ...state,
          track: {
            ...state.track,
            [trackIndex]: [...state.track[trackIndex]]
          }
        };
        copyState['track'][trackIndex][2] = id;
        return copyState;
      });
    };

    this.getTrackCount = (trackCount) => {
      this.setState((state) => {
        return {
          ...state,
          track:{
            ...state.track,
            trackCount: trackCount,
          }
        }
      })
    };

    this.getTrackCallback = (callback, trackIndex) => {
      this.setState(state => {
        let copyState = {
          ...state,
          track: {
            ...state.track,
          }
        } ;
        copyState['track'][trackIndex] = [...state.track[trackIndex]];
        copyState['track'][trackIndex][3] = callback;
        return copyState;
      });
    };

    // SequencerContext methods - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    this.updateSequencerContext = (patternNumber, pattern) => {
      this.setState(state => {
        let copyState = state;
        copyState = {
          ...copyState,
          sequencer: {
            ...copyState.sequencer,
            [patternNumber]: pattern,
          }
        };
        return copyState
      });
    };

    this.addTrackToSequencer = (trackNumber) => {
      this.setState(state => {
        let newState = {...state};
        newState.sequencer = {
          ...state.sequencer,
        };
        Object.keys(state.sequencer).map(key => {
          if (parseInt(key) >= 0) {
            newState.sequencer[key]['tracks'][trackNumber] = {
              length: state.sequencer[key]['patternLength'],
              // triggState: new Tone.Part(),
              triggState: new Tone.Part(),
              events: Array(state.sequencer[key]['patternLength']).fill({}),
              page: 0,
              selected: [],
            }
          }
          return 0;
        })
        state.sequencer.updateSequencerState(newState.sequencer);
        return newState;
      })
    };

    this.createCallback = (name, callback) => {
      this.setState((state) => {
        return {
          ...state,
          sequencer: {
            ...state.sequencer,
            [name]: callback,
          }
        };
      });
    };


    this.updateAll = (newState) => {
      this.setState((state => {
        let novo = {
          ...state
        };
        novo.sequencer = {
          ...state.sequencer,
          ...newState,
        };
        Object.keys(novo.sequencer).map(key => {
          if (!newState[key] && parseInt(key) >= 0){
            delete novo.sequencer[key]
          }
          return '';
        })
        
        return novo;
      }));
    };

    // App State - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  
    this.state = {
      track: {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        trackCount: 1,
        getTrackRef: this.getTrack,
        deleteTrackRef: this.deleteTrackRef,
        getSelectedTrack: this.getSelectedTrackIndex,
        getTrackState: this.getTrackState,
        getInstrumentId: this.getInstrumentId,
        getTrackCount: this.getTrackCount,
        getTrackCallback: this.getTrackCallback,
        selectedTrack: 0,
      },
      sequencer: {
        updateSequencerContext: this.updateSequencerContext,
        addTrackToSequencer: this.addTrackToSequencer,
        activePattern: 0,
        createCallback: this.createCallback,
        updateAll: this.updateAll,
        counter: 1,
        copyed: null,
      },
      arranger: {
        mode: 'pattern',
        following: false,
        directChange: false,
        updateArrCtx: this.updateArrCtx,
      }, 
      transport: {
        isPlaying: false,
        indicatorPosition: '0:0:0',
        bpm: 120,
        loopStart: 0,
        loopEnd: '4m',
        updateTrsCtx: this.updateTrsCtx,
      }
    };
  };
  

  render() {
    return (
      <div className="App" ref={this.appRef}>
      <ToneContext.Provider value={Tone}>
      <AppContext.Provider value={this.appRef}>
      <TrackContext.Provider value={this.state.track}>
      <SequencerContext.Provider value={this.state.sequencer}>
      <ArrangerContext.Provider value={this.state.arranger}>
        <TransportContext.Provider value={this.state.transport}>
          <Layout></Layout>
        </TransportContext.Provider>
      </ArrangerContext.Provider>
      </SequencerContext.Provider>
      </TrackContext.Provider>
      </AppContext.Provider>
      </ToneContext.Provider>
      </div>
    );

}}

export default App;
