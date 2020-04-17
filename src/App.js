import React, { Component } from 'react';
import './App.css';
import ToneContext from '../src/context/toneContext'
import AppContext from '../src/context/appContext'
import TrackContext from '../src/context/trackContext'
import * as Tone from 'tone';
import Layout from './components/Layout/Layout';
import SequencerContext from './context/sequencerContext';

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
      console.log('[App.js]: trackNumber deleteTrackRef', trackNumber);
      this.setState(state => { 
        let copyState = state;
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
      //   track: {
      //     selectedTrack: trackIndex,
      //   }
      // })
      })
    }

    this.getTrackState = (newState, trackIndex) => {
      this.setState(state => {
        let copyState = state;
        copyState['track'][trackIndex][1] = newState;
        return copyState
      })
    }

    this.updateSequencerContext = (patternNumber, pattern) => {
      this.setState(state => {
        let copyState = state;
        copyState = {
          ...copyState,
          sequencer: {
            ...copyState.sequencer,
            [patternNumber]: pattern,
          }
        }
        return copyState
        // copyState['sequncer'][patternNumber] = pattern;
      })
    }

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
        }
        // console.log(state.sequencer.updateSequencerState);
        state.sequencer.updateSequencerState(newState.sequencer);
        return newState;
      })
    }

    this.createCallback = (name, callback) => {
      this.setState((state) => {
        return {
          ...state,
          sequencer: {
            ...state.sequencer,
            [name]: callback,
          }
        }
      })
    }

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
        getTrackRef: this.getTrack,
        deleteTrackRef: this.deleteTrackRef,
        getSelectedTrack: this.getSelectedTrackIndex,
        getTrackState: this.getTrackState,
        selectedTrack: 0,
      },
      sequencer: {
        updateSequencerContext: this.updateSequencerContext,
        addTrackToSequencer: this.addTrackToSequencer,
        activePattern: 0,
        createCallback: this.createCallback
      },
    }
  }
  

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
