import React, { useState, useContext, useEffect, useRef } from 'react';
import ToneContext from '../../../../context/toneContext';
import trackContext from '../../../../context/trackContext';
import sequencerContext from '../../../../context/sequencerContext';
import Knob from '../../../../components/Knob/Knob';

const FMSynth = (props) => {
        const [state, setState] = useState({
            harmonicity: 3,
            modulationIndex: 10,
            detune: 0,
            oscillator: {
                type: 'sine'
            }, 
            envelope: {
                attack: 0.01,
                decay: 0.01,
                sustain: 1,
                release: 0.5
            }, 
            modulation: {
                type: 'square',
            },
            modulationEnvelope: {
                attack: 0.5,
                decay: 0,
                sustain: 1,
                release: 0.5
            }
        }) 

        
        let Tone = useContext(ToneContext);
        let selfRef = useRef(new Tone.FMSynth(state).toMaster());
        let TrackContext = useContext(trackContext)
        // let SequencerContext = useContext(sequencerContext)
    

        // passing the new harmonicity value to the components subscribed to the TrackContext
        useEffect(() => {
            selfRef.current.harmonicity.value = state.harmonicity;
            TrackContext.getTrackRef(selfRef.current, props.trackIndex);
            TrackContext.getTrackState(state, props.trackIndex);
        }, [state.harmonicity, props.trackIndex, state])

        useEffect(() => {
            TrackContext.getTrackRef(selfRef.current, props.trackIndex);
        }, [props.trackIndex])
    
    const calcHarmonicity = (e) => {
        if (e.movementY < 0 && state.harmonicity < 100) {
            setState((state) => ({
                ...state,
                harmonicity: state.harmonicity - e.movementY < 100 ? state.harmonicity - e.movementY : 100
            })) } else if (e.movementY > 0 && state.harmonicity > 0) {
            setState((state) => ({
                ...state,
                harmonicity: state.harmonicity - e.movementY > 0 ? state.harmonicity - e.movementY : 0,
            }))
        }
    }

    const harmonicityCurve = (input) => {
        return 0.01
    }


        return (
            <div className="FMSynth">
                <Knob size={55} calcValue={calcHarmonicity} colorInner='blue' colorOuter='red' value={state.harmonicity} min={0} max={100} radius={17} curveFunction={harmonicityCurve} label='harmonicity'></Knob> 
            </div>
        )
}


export default FMSynth;