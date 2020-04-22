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

    
    // Initializing context and setting Refs to be passed - - - -
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    let Tone = useContext(ToneContext);
    let selfRef = useRef(new Tone.FMSynth(state).toMaster());
    let TrkCtx = useContext(trackContext),
        SeqCtx = useContext(sequencerContext);


    // passing the new harmonicity value to the components subscribed to the TrackContext
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        selfRef.current.harmonicity.value = state.harmonicity;
        TrkCtx.getTrackRef(selfRef.current, props.trackIndex);
        TrkCtx.getTrackState(state, props.trackIndex);
    }, [state.harmonicity])

    // Atualizing refs after a track got deleted
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        TrkCtx.getTrackRef(selfRef.current, props.trackIndex);
        TrkCtx.getTrackState(state, props.trackIndex);
    }, [props.trackIndex])

    // useEffect(() => {
    //     if (SeqCtx[SeqCtx.activePattern]){
    //         console.log('[FMSynth]: should`ve added callback');
    //         SeqCtx[SeqCtx.activePattern]['tracks'][TrkCtx.selectedTrack]['triggState'].callback(FMSynthPlayer);
    //     }
    // }, [])

    // Harmonicity calc
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
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

    // Instrument callback to be added to the triggState;
    const FMSynthPlayer = (time, value) => {
        console.log('[FMSynth]: callback')
        let bb, velocity;
        velocity = value.velocity ? value.velocity : 127;
        bb = value.note ? value.note : null;
        bb.map(note => {
        selfRef.current.triggerAttackRelease(note, '8n', time, velocity)
        })
    }

        return (
            <div className="FMSynth">
                <Knob size={55} calcValue={calcHarmonicity} colorInner='blue' colorOuter='red' value={state.harmonicity} min={0} max={100} radius={17} curveFunction={harmonicityCurve} label='harmonicity'></Knob> 
            </div>
        )
};

export default FMSynth;