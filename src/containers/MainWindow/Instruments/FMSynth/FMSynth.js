import React, { useState, useContext, useEffect, useRef } from 'react';
import ToneContext from '../../../../context/toneContext';
import trackContext from '../../../../context/trackContext';
import sequencerContext from '../../../../context/sequencerContext';
import Knob from '../../../../components/Knob/Knob';
import transportContext from '../../../../context/transportContext';

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
    const [renderState, setRender] = useState(0),
        [, updateState] = React.useState(),
        forceUpdate = React.useCallback(() => updateState({}), []);
    
    // Initializing context and setting Refs to be passed - - - -
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    let Tone = useContext(ToneContext),
        selfRef = useRef(new Tone.FMSynth(state)),
        TrkCtx = useContext(trackContext),
        SeqCtx = useContext(sequencerContext),
        filterRef = useRef(new Tone.Filter(30, 'lowpass').toMaster()),
        seqCounter = SeqCtx.counter,
        stateIsRef = useRef({
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
        }),
        stateShouldBeRef = useRef({
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
        }),
        selectedTrackRef = TrkCtx.selectedTrackRef,
        TrsCtx = useContext(transportContext),
        isPlaying = TrsCtx.isPlaying,
        getTrackCallback = TrkCtx.getTrackCallback;

    // const updateTrkRef = () => {
    //     TrkCtx.getTrackRef(selfRef.current, props.trackIndex);
    //     TrkCtx.getTrackState(state, props.trackIndex);
    //     TrkCtx.getTrackCallback(FMSynthPlayer, props.trackIndex);
    // };


    // passing the new harmonicity value to the components subscribed to the TrackContext
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        console.log('[FMSynth]: updating harmonicity');
        selfRef.current.harmonicity.value = stateIsRef.current.harmonicity;
        TrkCtx.getTrackRef(selfRef.current, props.trackIndex);
        TrkCtx.getTrackState(stateIsRef.current, props.trackIndex);
    }, [state.harmonicity]);

    

    // Atualizing refs after a track got deleted
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        TrkCtx.getTrackRef(selfRef.current, props.trackIndex);
        console.log('[FMSynth]: updating track index');
        TrkCtx.getTrackState(state, props.trackIndex);
        TrkCtx.getTrackCallback(FMSynthPlayer, props.trackIndex);
    }, [props.trackIndex]);

    // Chaining instrument to FX and forcing Rerender to get updated 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        selfRef.current.chain(filterRef.current);
        if (renderState === 0) {
            setTimeout(() => {
                console.log('[FMSynth.js]: forcing update');
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
            console.log('[FMSynth.js]: adding callback and starting Part');
            SeqCtx[SeqCtx.activePattern]['tracks'][props.trackIndex].triggState.callback = FMSynthPlayer;
            SeqCtx[SeqCtx.activePattern]['tracks'][props.trackIndex].triggState.loop = true
            SeqCtx[SeqCtx.activePattern]['tracks'][props.trackIndex].triggState.start(0);
            setRender(2);
        }
    });

    // reseting state to default, after playback stoped;
    useEffect(() => {
        if (!isPlaying && stateShouldBeRef.current !== stateIsRef.current) {
            setState(state => {
                let copyState = {
                    ...stateShouldBeRef.current,
                    envelope: {
                        ...stateShouldBeRef.current.envelope,
                    }, 
                    oscillator: {
                        ...stateShouldBeRef.current.oscillator,
                    },
                    modulation: {
                        ...stateShouldBeRef.current.modulation,
                    },
                    modulationEnvelope: {
                        ...stateShouldBeRef.current.modulationEnvelope,
                    },
                }
                stateIsRef.current = {...copyState}
                return copyState;
            })
        }
    }, [isPlaying])

    // Instrument callback to be added to the triggState;
    const FMSynthPlayer = (time, value) => {
        Object.keys(SeqCtx).map(key => {
            if (parseInt(key) >= 0 && SeqCtx[key]){
                Object.keys(SeqCtx[key]['tracks']).map(track => {
                    console.log('[FMSynth]: inside playback callback, track', track, 'seq', key, 'triggState', SeqCtx[key]['tracks'][track]['triggState'].state);
                })
            }
        })
        let harmonicity = parseInt(value.harmonicity) >= 0 ? value.harmonicity : null;
        console.log('[FMSynth]: value', value, 'harmonicity', value.harmonicity, 'stateShouldBeRef', stateShouldBeRef.current, 'stateIsRef', stateIsRef.current);
        if (harmonicity && harmonicity !== state.harmonicity) {
            console.log('[FMSynth]: parameter locking harmonicity')
            setState(state => {
                let copyState = {
                ...state,
                harmonicity: harmonicity
                }
                stateIsRef.current = {...copyState};
                return copyState;
            });
        } else if (!harmonicity && stateIsRef.current.harmonicity !== stateShouldBeRef.current.harmonicity) {
            console.log('[FMSynth]: reverting harmonicity back to what state should be, harmonicity', stateShouldBeRef.current.harmonicity);
            setState(state => {
                let copyState ={
                    ...state,
                    harmonicity: stateShouldBeRef.current.harmonicity,
                }
                stateIsRef.current = {...copyState};
                return copyState;
            });
        }
        let bb, velocity;
        velocity = value.velocity ? value.velocity : 60;
        bb = value.note ? value.note : null;
        if (bb) {
            bb.map(note => {
                if (note) {
                    selfRef.current.triggerAttackRelease(note, '8n', time, velocity);
                }
                return '';
            })
        }
    }

    useEffect(() => {
        console.log('[FMSynth]: getting track callback');
        getTrackCallback(FMSynthPlayer, props.trackIndex);
    }, [props.trackIndex, seqCounter]);


    // Harmonicity calc
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    const calcHarmonicity = (e) => {
        let act = SeqCtx[SeqCtx.activePattern]
        if (act){
            console.log('[FMSynth]: selected', act['tracks'][props.trackIndex]['selected'][0])
            let selected = act['tracks'][props.trackIndex]['selected'].length >= 0 ? act['tracks'][props.trackIndex]['selected'] : null,
                length = selected || selected === 0 ? selected.length : null;
            console.log('[FMSynth]: length', length);
            if (length >= 1) {
                console.log('[FMSynth]: selected positivo');
                let h;
                for (let i = 0; i < length; i ++) {
                    let h;
                    console.log('[FMSynth]: harmonicity context', TrkCtx[props.trackIndex][4][selected[i]].harmonicity)
                    function g(){
                        let f;
                        if (TrkCtx[props.trackIndex][4][selected[i]].harmonicity) {
                            f = TrkCtx[props.trackIndex][4][selected[i]].harmonicity;
                            console.log('[FMSynth]: h has harmonicity');
                        } else {
                            f = state.harmonicity;
                            console.log('[FMSynth]: h DOES NOT have harmonicty');
                        }
                        return f;
                    }
                    // h = act.tracks[props.trackIndex]['events'][i].harmonicity ? act.tracks[props.trackIndex]['events'][i].harmonicity : state.harmonicity;
                    h = g();
                    console.log('[FMSynth]: h', h, 'i', i);
                    if (h){
                        console.log('parameterLock');
                        if (e.movementY < 0 && h < 100) {
                            SeqCtx.parameterLock(props.trackIndex, {
                                harmonicity: h - e.movementY < 100 ? h - e.movementY : 100,
                            });
                        } else if (e.movementY > 0 && h > 0){
                            SeqCtx.parameterLock(props.trackIndex, {
                                harmonicity: h - e.movementY > 0 ? h - e.movementY : 0,
                            });
                        } 
                    } else {
                    console.log('[FMSynth.js]: harmony unselected, no h');
                    harmUnselected(e);
                    }
                }
            } else {
                console.log('[FMSynth.js]: harmony unselected, length not >= 1');
                harmUnselected(e);
            }
        }
    }

    const harmUnselected = (e) => {
        if (e.movementY < 0 && state.harmonicity < 100) {
            setState(state => {
                let copyState = {
                    ...state,
                    harmonicity: state.harmonicity - e.movementY < 100 ? state.harmonicity - e.movementY : 100
                }
                stateIsRef.current = {...copyState};
                return copyState;
            }) } else if (e.movementY > 0 && state.harmonicity > 0) {
            setState(state => {
                let copyState = {
                    ...state,
                    harmonicity: state.harmonicity - e.movementY > 0 ? state.harmonicity - e.movementY : 0,
                }
                stateIsRef.current = {...copyState};
                return copyState;
            })
        } 
    }

    const harmonicityCurve = (input) => {
        return 0.01
    }

    // Filter Freq calc
    // - - - - - - - - - - - - - - - - - - - - - 
    const calcCutoff = (e) => {
        if (e.movementY < 0 && state.harmonicity < 100) {
            setState(state => {
                let copyState = {
                    ...state,
                    harmonicity: state.harmonicity - e.movementY < 100 ? state.harmonicity - e.movementY : 100
                }
                stateIsRef.current = {...copyState};
                return copyState;
            }) } else if (e.movementY > 0 && state.harmonicity > 0) {
            setState(state => {
                let copyState = {
                    ...state,
                    harmonicity: state.harmonicity - e.movementY > 0 ? state.harmonicity - e.movementY : 0,
                }
                stateIsRef.current = {...copyState};
                return copyState;
            })
        } 
    }



    // conditional value of parameters (if selected or not)
    let displayHarm = () => {
        let newHarm,
            selected = SeqCtx[SeqCtx.activePattern] ? SeqCtx[SeqCtx.activePattern]['tracks'][props.trackIndex]['selected'] : null;
            if(selected && selected.length > 0) {
                console.log('[FMSynth]: selecting harm, called selected length > 1, selected', selected);   
                for (let i = 0; i < selected.length; i++){
                    console.log('[FMSynth]: item in selected', selected[i], TrkCtx[props.trackIndex][4][selected[i]]);
                    if (parseInt(TrkCtx[props.trackIndex][4][selected[i]].harmonicity) >= 0){
                        newHarm = parseInt(SeqCtx[SeqCtx.activePattern]['tracks'][props.trackIndex]['events'][selected[i]].harmonicity);
                        return newHarm;
                    }
            }
            console.log('[FMSynth]: absolutely no selected harmonicity spoted');
            return state.harmonicity
        } else {
            console.log('[FMSynth]: no selected harmonicity spoted, no selected, or selected.length <= 0');
            return state.harmonicity
        }
    }
    let harm = displayHarm();

    return (
        <div className="FMSynth">
            <Knob size={55} 
            calcValue={calcHarmonicity} 
            colorInner='blue' 
            colorOuter='red' 
            value={harm} 
            min={0} 
            max={100} 
            radius={17} 
            curveFunction={harmonicityCurve} 
            label='harmonicity'></Knob> 
        </div>
    )
};

export default FMSynth;