import React, { useState, useContext, useEffect, useRef } from 'react';
import ToneContext from '../../../../context/toneContext';
import trackContext from '../../../../context/trackContext';
import sequencerContext from '../../../../context/sequencerContext';
import transportContext from '../../../../context/transportContext';
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
    const [renderState, setRender] = useState(0);
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    
    // Initializing context and setting Refs to be passed - - - -
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    let Tone = useContext(ToneContext),
        selfRef = useRef(new Tone.FMSynth(state)),
        TrsCtx = useContext(transportContext),
        TrkCtx = useContext(trackContext),
        SeqCtx = useContext(sequencerContext),
        filterRef = useRef(new Tone.Filter(30, 'lowpass').toMaster()),
        seqCounter = SeqCtx.counter,
        getTrackCallback = TrkCtx.getTrackCallback;

    // const updateTrkRef = () => {
    //     TrkCtx.getTrackRef(selfRef.current, props.trackIndex);
    //     TrkCtx.getTrackState(state, props.trackIndex);
    //     TrkCtx.getTrackCallback(FMSynthPlayer, props.trackIndex);
    // };


    // passing the new harmonicity value to the components subscribed to the TrackContext
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        selfRef.current.harmonicity.value = state.harmonicity;
        TrkCtx.getTrackRef(selfRef.current, props.trackIndex);
        TrkCtx.getTrackState(state, props.trackIndex);
    }, [state.harmonicity]);


    // Atualizing refs after a track got deleted
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        TrkCtx.getTrackRef(selfRef.current, props.trackIndex);
        TrkCtx.getTrackState(state, props.trackIndex);
        TrkCtx.getTrackCallback(FMSynthPlayer, props.trackIndex);
        // SeqCtx[SeqCtx.activePattern]['tracks'][TrkCtx.selectedTrack]
    // }, [props.trackIndex])
    }, [props.trackIndex]);

    // Chaining instrument to FX and forcing Rerender to get updated 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        selfRef.current.chain(filterRef.current);
        if (renderState === 0) {
            setTimeout(() => {
                forceUpdate();
            }, 1000);
            setRender(1);
        }
    }, [])

    // Sending updated callback after forced rerender
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        if (renderState === 1) {
            TrkCtx.getTrackCallback(FMSynthPlayer, props.trackIndex);
            // if (TrsCtx.isPlaying){
                console.log('[FMSynth.js]: adding callback and starting Part');
                SeqCtx[SeqCtx.activePattern]['tracks'][props.trackIndex].triggState.callback = FMSynthPlayer;
                SeqCtx[SeqCtx.activePattern]['tracks'][props.trackIndex].triggState.start(0);
            // }
            setRender(2);
        }
    });



    // SHOULD I SET A TIMEOUT FOR SETTING UP THE CALLBACK TO THE PART?
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

    // Filter Freq calc
    // - - - - - - - - - - - - - - - - - - - - - 
    const calcCutoff = (e) => {
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

    // Instrument callback to be added to the triggState;
    const FMSynthPlayer = (time, value) => {
        console.log('[FMSynth.js]: loopStart', Tone.Transport.loopStart, 'loopEnd', Tone.Transport.loopEnd);
        console.log('[FMSynth.js]: TransportPosition', Tone.Transport.position);
        console.log('[FMSynth.js]: selfRef', selfRef, 'trackNumber', props.trackIndex);
        Object.keys(SeqCtx).map(SeqKeys => {
            if (parseInt(SeqKeys) >= 0){
                Object.keys(SeqCtx[SeqKeys]['tracks']).map(track => {
                    console.log('[FMSynth.js]: Sequencia', SeqKeys, 'Track', track, 'state', SeqCtx[SeqKeys]['tracks'][track].triggState.state);
                    return '';
                });
            }
            return '';
        });
        let bb, velocity;
        velocity = value.velocity ? value.velocity : 60;
        bb = value.note ? value.note : null;
        bb.map(note => {
        selfRef.current.triggerAttackRelease(note, '8n', time, velocity)
        })
    }

    useEffect(() => {
        getTrackCallback(FMSynthPlayer, props.trackIndex);
    }, [props.trackIndex, seqCounter]);

        return (
            <div className="FMSynth">
                <Knob size={55} calcValue={calcHarmonicity} colorInner='blue' colorOuter='red' value={state.harmonicity} min={0} max={100} radius={17} curveFunction={harmonicityCurve} label='harmonicity'></Knob> 
            </div>
        )
};

export default FMSynth;