import React, { Component } from 'react';
import './App.css';
import ToneContext from '../src/context/toneContext'
import AppContext from '../src/context/appContext'
import TrackContext from '../src/context/trackContext'
import * as Tone from 'tone';
import Layout from './components/Layout/Layout';
import SequencerContext from './context/sequencerContext';
import returnPartArray from './containers/Sequencer/Sequencer';

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
  

    this.deleteTrackRef = (trackNumber, trackCounter) => {
      this.setState(state => { 
        let copyState = {...state};
        copyState['track'][trackNumber] = [];
        copyState['track'][trackCounter] = [];
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
        let copyState = {...state};
        copyState['track'][trackIndex][2] = id;
        return copyState;
      });
    };

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

    // this.addTrackToSequencer = (trackNumber) => {
    this.addTrackToSequencer = (trackNumber, pattern) => {
      this.setState((state) => {
        let newState = {
          ...state,
          sequencer: {
            ...state.sequencer,
            [this.state.sequencer.activePattern]: {
              ...state.sequencer[this.state.sequencer.activePattern],
              tracks: {
                ...state.sequencer[this.state.sequencer.activePattern]['tracks'],
                [trackNumber]: pattern,
              }
            }
          }
        };
        state.sequencer.updateSequencerState(newState.sequencer);
        return newState;
      });

      // console.log('[App.js]: AddTrackToSequencer', trackNumber);

      // this.setState(state => {
      //   let newState = {...state};
      //   newState.sequencer = {
      //     ...state.sequencer,
      //   };
      //   Object.keys(state.sequencer).map(key => {
      //     if (parseInt(key) >= 0) {
      //       newState.sequencer[key][trackNumber] = {
      //         length: state.sequencer[key]['patternLength'],
      //         triggState: new Tone.Part(() => {}, returnPartArray(16))
      //       }
      //     }
      //     return 0;
      //   })
      //   state.sequencer.updateSequencerState(newState.sequencer);
      //   return newState;
      // })
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
    }

    this.updateAll = (newState) => {
      this.setState((state => {
        let novo = {...state};
        novo.sequencer = {
          ...state.sequencer,
          ...newState,
        };
        return novo;
      }));
    };

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
        selectedTrack: 0,
      },
      sequencer: {
        updateSequencerContext: this.updateSequencerContext,
        addTrackToSequencer: this.addTrackToSequencer,
        activePattern: 0,
        createCallback: this.createCallback,
        updateAll: this.updateAll,
      },
    };
  };
  

  render() {
    return (
      <div className="App" ref={this.appRef}>
      <ToneContext.Provider value={Tone}>
      <AppContext.Provider value={this.appRef}>
      <TrackContext.Provider value={this.state.track}>
      <SequencerContext.Provider value={this.state.sequencer}>
        <Layout></Layout>
      </SequencerContext.Provider>
      </TrackContext.Provider>
      </AppContext.Provider>
      </ToneContext.Provider>
      </div>
    );

}}

export default App;
