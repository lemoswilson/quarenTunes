import React, { Component } from 'react';
import './App.css';
import ToneContext from '../src/context/toneContext'
import AppContext from '../src/context/appContext'
import TrackContext from '../src/context/trackContext'
import * as Tone from 'tone';
import Layout from './components/Layout/Layout';
import forceRender from './context/forceRender';

class App extends Component {
  constructor(props){
    super(props);
    this.appRef = React.createRef();
    this.getTrack = (Ref, trackNumber, forceRenderCallback) => {
      this.setState(state => ({
        [trackNumber]: Ref,
      }));
    }

    this.deleteTrackRef = (trackNumber, trackCounter) => {
      console.log('[App.js]: trackNumber deleteTrackRef', trackNumber);
      this.setState(state => ({
        [trackNumber]: undefined,
        [trackCounter]: undefined, 
      }))
    }

    this.state = {
      0: null,
      getTrackRef: this.getTrack,
      deleteTrackRef: this.deleteTrackRef
    }

  }


  render() {

    return (
      <div className="App" ref={this.appRef}>
      <ToneContext.Provider value={Tone}>
      <AppContext.Provider value={this.appRef}>
      <TrackContext.Provider value={this.state}>
        <Layout></Layout>
      </TrackContext.Provider>
      </AppContext.Provider>
      </ToneContext.Provider>
      {this.state[0] ? this.state[0].harmonicity.value : null }
      </div>
    );

}}

export default App;
