import React, { useState, useContext, useEffect, useRef } from 'react';
import arrangerContext from '../../../../context/arrangerContext';
import ToneContext from '../../../../context/toneContext';
import trackContext from '../../../../context/trackContext';
import webMidiContext from '../../../../context/webMidiContext';
import sequencerContext from '../../../../context/sequencerContext';
import { to16 } from '../../../Sequencer/Sequencer';
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
    });
    const midiLearnRefs = useRef({
        harmonicity: null,
        modulationIndex: null,
        detune: null,
        oscillator: {
            type: null,
        }, 
        envelope: {
            attack: null,
            decay: null,
            sustain: null,
            release: null
        }, 
        modulation: {
            type: null,
        },
        modulationEnvelope: {
            attack: null,
            decay: null,
            sustain: null,
            release: null
        }
    }) ;
    const [renderState, setRender] = useState(0),
        [, updateState] = React.useState(),
        forceUpdate = React.useCallback(() => updateState({}), []);
    
    // Initializing context and setting Refs to be passed - - - -
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    let Tone = useContext(ToneContext),
        WebMidi = useContext(webMidiContext),
        selfRef = useRef(new Tone.PolySynth(8, Tone.FMSynth, state)),
        TrkCtx = useContext(trackContext),
        SeqCtx = useContext(sequencerContext),
        Seq = {...SeqCtx},
        SeqRef = useRef(SeqCtx),
        ArrCtx = useContext(arrangerContext),
        seqfake = {...SeqCtx},
        pressedNotesRef = useRef({}),
        filterRef = useRef(new Tone.Filter(20000, 'lowpass').toMaster()),
        gainRef = useRef(new Tone.Gain(0.1)),
        seqCounter = SeqCtx.counter,
        selectedStepsRef = useRef(),
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
        isPlayingRef = useRef(isPlaying),
        isRecording = TrsCtx.recording,
        isRecordingRef = useRef(TrsCtx.recording),
        midiInput = TrkCtx[props.trackIndex][5],
        previousMidi = useRef({...midiInput}),
        arrangerMode = ArrCtx.mode,
        arrangerModeRef = useRef(arrangerMode);
        let firstPatternArranger = ArrCtx['selectedSong'] && ArrCtx['songs'][ArrCtx['selectedSong']] ? ArrCtx['songs'][ArrCtx['selectedSong']]['events'][0].pattern : null,
        firstPatternArrangerRef = useRef(firstPatternArranger),
        patternTracker = ArrCtx.patternTracker,
        patternTrackerRef = useRef(patternTracker),
        activePatternObject = SeqCtx[SeqCtx.activePattern],
        setNoteMIDIRef = useRef(),
        setPlaybackInputRef = useRef(),
        activePatternObjectRef = useRef(activePatternObject),
        inputRef = useRef(),
        listenCCRef = useRef(),
        getTrackCallback = TrkCtx.getTrackCallback;
        // defining the note input and output functions here, and assigning
        // the refs to the functions every new render in a hook
        // if shit stops working, try changing it back to the way it was before.
        const noteInput = useRef();
        const noteOff = useRef();
        const returnStep = (t) => {
            console.log('[FMSynth]: returnStep, activePatternObjectRef', activePatternObjectRef);
            let active = activePatternObjectRef.current
            let result;
            // let nowTime = Tone.Transport.position.split('.')[0];
            let nowTime = t;
            if (arrangerModeRef.current === 'pattern') {
                console.log('[FMSynth]: returning step in pattern mode');
                let trackSteps = active && active['tracks'][props.trackIndex] ? active['tracks'][props.trackIndex]['length'] : null ;
                if (!trackSteps) return false
                let patternLength = active['patternLength'];
                result = trackSteps >= patternLength ? to16(nowTime) : to16(nowTime) % trackSteps ;
            } else if (arrangerModeRef.current === 'song') {
                let pat = patternTrackerRef.current.current;
                let pt = pat[0];
                let timeb = pat[1] ? pat[1] : 0;
                let timebbs = Tone.Time(timeb, 's').toBarsBeatsSixteenths();
                let step = to16(t) - to16(timebbs);
                let patternLocation = SeqRef.current[pt] ? step % parseInt(SeqRef.current[pt]['patternLength']) : null;
                console.log('[FMSynth]:', 'pat', pat, 'pt', pt, 'timeb', timeb, 'timebbs', timebbs, 'patternLocation', patternLocation, 'step', step, 'position', Tone.Transport.position);
                if (!patternLocation) return false;
                let trackStep = SeqRef.current[pt]['tracks'][props.trackIndex]['lenght'] < parseInt(SeqRef.current[pt]['patternLength']) ? patternLocation % SeqRef.current[pt]['tracks'][props.trackIndex]['length'] : patternLocation ;
                result = trackStep;
            }
            return result;
        }
        const noteInCallback = (e) => {
            let isSelected = activePatternObjectRef.current['tracks'][props.trackIndex]['selected'].length > 0 ? true : false ;
            let noteName = e.note.name + e.note.octave;
            let time = Date.now()/1000;
            let velocity = e.velocity*127;
            console.log('[FMSynth]: recording status', isRecording, 'isRecordingRefStatus', isRecordingRef.current, 'isSelectedState', isSelected, 'isPlaying', isPlaying, 'isPlayingRef', isPlayingRef.current);
            if (isRecordingRef.current && isPlayingRef.current) {
                // recording playback logic
                selfRef.current.triggerAttack(noteName, Tone.Time("+0"),velocity);
                let t = Tone.Transport.position;
                let multiplier = parseFloat("0." + t.split(".")[1]);
                let offset = Math.round(128*multiplier);
                let patt = arrangerModeRef.current === 'pattern' ? SeqRef.current.activePattern : patternTrackerRef.current.current[0];
                let track = props.trackIndex;
                let passos;
                let pastEvent = SeqRef.current[patt]['tracks'][props.trackIndex]['events'][passos];
                console.log('[FMSynth]: noteInCallback -> pastEvent', pastEvent)
                let step = returnStep(t.split('.')[0]);
                if (parseInt(step) >= 0){
                    console.log('[FMSynth]: playing note while recording, step in the SeqRef is', SeqRef.current.step, 'time', t, 'pattern', patt, 'step from returnStep', step);
                    if (arrangerModeRef.current === 'pattern') {
                        if (!activePatternObjectRef.current.tracks[props.trackIndex]['events'][step]['note']) {
                            //  se nao tem nota no step, setState de nota la no sequencer
                            SeqRef.current.setPlaybackInput.current(patt, props.trackIndex, step, offset, noteName, e.velocity*127);
                            passos = step;
                            // return
                        } else if ( activePatternObjectRef.current.tracks[props.trackIndex]['events'][step+1]
                        && !activePatternObjectRef.current.tracks[props.trackIndex]['events'][step+1]['note']) {
                            // setar nota no sequencer um step a frente
                            SeqRef.current.setPlaybackInput.current(patt, props.trackIndex, step+1, 1-offset, e.note.name+e.note.octave, e.velocity*127);
                            passos = step+1;
                            offset = 1-offset;
                            // return
                        } else {
                            SeqRef.current.setPlaybackInput.current(patt, props.trackIndex, step, offset, noteName, e.velocity*127);
                            passos = step; 
                        }
                    } else {
                        // song mode
                        if(!SeqRef.current[patternTrackerRef.current.current[0]].tracks[props.trackIndex]['events'][step]['note']) {
                            setPlaybackInputRef.current(patt, props.trackIndex, step, offset, e.note.name+e.note.octave);
                            passos = step
                        } else if (SeqRef.current[patternTrackerRef.current.current[0]].tracks[props.trackIndex]['events'][step+1]
                        && SeqRef.current[patternTrackerRef.current.current[0]].tracks[props.trackIndex]['events'][step+1]['note']){
                            setPlaybackInputRef.current(patt, props.trackIndex, step+1, 1-offset, e.note.name+e.note.octave);
                            passos = step+1;
                            offset = 1-offset;
                        }
                    }
                    console.log('[FMSynth]: should be updating presedNotesRef which now is now,', pressedNotesRef.current ,'note name is', noteName);
                    pressedNotesRef.current[noteName] = {
                        patt,
                        track, 
                        passos, 
                        offset,
                        velocity,
                        time,
                        pastEvent, 
                    }
                    console.log('[FMSynth:] new pressedNotesRef:', pressedNotesRef.current);
                }
            } else if ((isSelected && !isRecordingRef.current) || (isSelected && isRecordingRef.current && !isPlayingRef.current)){
                // parameterLock Logic
                console.log('[FMSynth]: inserting note locked as parameter')
                setNoteMIDIRef.current.current(props.trackIndex, noteName, e.velocity*127);
            }  else {
                // triggering logic
                selfRef.current.triggerAttack(`${e.note.name}${e.note.octave}`, Tone.Time("+0"),e.velocity*127);
            }
        } ;
        const noteOffCallback = (e) => {
            let isSelected = activePatternObjectRef.current['tracks'][props.trackIndex]['selected'].length > 0 ? true : false ;
            let noteName = e.note.name+e.note.octave;
            let noteObj = pressedNotesRef.current[noteName];
            console.log('[FMSynth.js]: noteoff, isRecordingRef.current', isRecordingRef.current, 'isPlayingRef', isPlayingRef.current, 'pressedNotesRef', pressedNotesRef.current) ;
             if (isRecordingRef.current && isPlayingRef.current) {
                // recording playback logic (set the length of the note with the note off messagee);
                selfRef.current.triggerRelease(noteName);
                let now = Date.now()/1000;
                console.log('[FMSynth]: note input time', noteObj.time, 'noteOff time', now, 'subtraction', now - noteObj.time, 'pattern', noteObj);
                let length = Tone.Time(now - noteObj.time, 's').toNotation();
                console.log('[FMSynth]: setting note lenth', length)
                SeqRef.current.setNoteLengthPlayback.current(noteName, noteObj.patt, noteObj.track, noteObj.passos, length, noteObj.pastEvent);
                // SeqRef.current.setPlaybackInput.current(noteObj.patt, noteObj.track, noteObj.passos, noteObj.offset, noteName, noteObj.velocity, length); 
                console.log('[FMSynth.js]: removing values of pressedNotesRef notename,', noteName);
                pressedNotesRef.current[noteName] = {};   
            } else if (isSelected && !isRecordingRef.current){
                // parameterLock logic (don't do nothing now)
            } else {
                selfRef.current.triggerRelease(`${e.note.name}${e.note.octave}`);
            }
        } 

    // passing the new harmonicity value to the components subscribed to the TrackContext
    // - - - - - - - - - -  - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        selfRef.current.set({
            harmonicity: stateIsRef.current.harmonicity,
        })
        TrkCtx.getTrackRef(selfRef.current, props.trackIndex);
        TrkCtx.getTrackState(stateIsRef.current, props.trackIndex);
    }, [state.harmonicity]);

    // Initializing midi input if midi device selected
    useEffect(() => {
        console.log('[FMSynth]: midiInput has changed');
        if (midiInput && midiInput.device && midiInput.channel) {
            inputRef.current = WebMidi.getInputByName(midiInput.device);
            console.log('[FMSynth]: enabling midi', midiInput, 'inputRef', inputRef.current, 'previousMidi', previousMidi);
            if (midiInput !== previousMidi.current) {
                let inputPrev = previousMidi.current ? WebMidi.getInputByName(previousMidi.current.device) : false;
                let prevDevice = previousMidi.current && previousMidi.current.device ? previousMidi.current.device : false;
                let prevChann = previousMidi.current && previousMidi.current.channel ? previousMidi.current.channel : false;
                console.log('[FMSynth]: previous midiInput != current, previous device =', prevDevice, 'previousChannel', prevChann, 'currentDevice=', midiInput.device, 'currentchannel', midiInput.channel, 'inputPrev', inputPrev);
                if (inputPrev && previousMidi.current.device && previousMidi.current.channel) {
                    console.log('[FMSynth]: removing midi input', previousMidi.current.device, previousMidi.current.channel);
                    inputPrev.removeListener('noteon', previousMidi.current.channel, noteInput.current);
                    inputPrev.removeListener('noteoff', previousMidi.current.channel, noteOff.current);
                }
            }
            if (!inputRef.current.hasListener('noteon', midiInput.channel, noteInput.current)) {
                console.log('[FMSynth]: adding midi inputs', midiInput.device, midiInput.channel);
                inputRef.current.addListener('noteon', midiInput.channel, noteInput.current);
                inputRef.current.addListener('noteoff', midiInput.channel, noteOff.current);
            }
            previousMidi.current = {...midiInput}
            // WebMidi.enable(function(err){
            //     if (err) {
            //         console.log('[FMSynth]: erro WebMidi', err);
            //     }
            // });
        }
    }, [midiInput])
    

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
        selfRef.current.chain(gainRef.current);
        gainRef.current.chain(filterRef.current);
        if (renderState === 0) {
            setTimeout(() => {
                console.log('[FMSynth.js]: forcing update');
                forceUpdate();
            }, 1000);
            setRender(1);
        }
        noteInput.current = noteInCallback;

        noteOff.current = noteOffCallback;
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
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // Updating refs necessary for async functions
    useEffect(() => {
        activePatternObjectRef.current = activePatternObject; 
        setNoteMIDIRef.current = SeqCtx.setNoteMIDI;
        setPlaybackInputRef.current = SeqCtx.setPlaybackInput;
        selectedStepsRef.current = activePatternObject && activePatternObject.tracks ? [...activePatternObject['tracks'][props.trackIndex]['selected']] : null;
    }, [activePatternObject]);

    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    useEffect(() => {
        arrangerModeRef.current = arrangerMode;
    }, [arrangerMode]);

    useEffect(() => {
        patternTrackerRef.current = patternTracker;
    }, [patternTracker]);

    useEffect(() => {
        SeqRef.current = Seq;
    }, [Seq]);

    useEffect(() => {
        firstPatternArrangerRef.current = firstPatternArranger;
    }, [firstPatternArranger]);

    // Instrument callback to be added to the triggState;
    const FMSynthPlayer = (time, value) => {
        let harmonicity = parseInt(value.harmonicity) >= 0 ? value.harmonicity : null;
        console.log('[FMSynth.js]: Harmonicity value', harmonicity); 
        if (harmonicity && harmonicity !== state.harmonicity) {
            setState(state => {
                let copyState = {
                ...state,
                harmonicity: harmonicity
                }
                stateIsRef.current = {...copyState};
                return copyState;
            });
        } else if (!harmonicity && stateIsRef.current.harmonicity !== stateShouldBeRef.current.harmonicity) {
            setState(state => {
                let copyState ={
                    ...state,
                    harmonicity: stateShouldBeRef.current.harmonicity,
                }
                stateIsRef.current = {...copyState};
                return copyState;
            });
        }
        let bb, velocity, length, patLength;
        velocity = value.velocity ? value.velocity : 60;
        bb = value.note ? value.note : null;
        patLength = arrangerModeRef.current === 'pattern' ? SeqRef.current[SeqRef.current.activePattern]['tracks'][props.trackIndex]['noteLength'] : SeqRef.current[patternTrackerRef.current.current[0]]['tracks'][props.trackIndex]['noteLength'];        
        length = value.length ? value.length : patLength;
        if (bb) {
            bb.map(note => {
                if (note) {
                    console.log('[FMSynth]: should be triggering note', note, length, time, velocity);
                    selfRef.current.triggerAttackRelease(note, length, time, velocity);
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
        let act = activePatternObjectRef.current
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
                        if (e.controller && e.controller.number){
                            SeqCtx.parameterLock(props.trackIndex, {
                                harmonicity: e.value*(100/127),
                            })
                        } else {
                            if (e.movementY < 0 && h < 100) {
                                SeqCtx.parameterLock(props.trackIndex, {
                                    harmonicity: h - e.movementY < 100 ? h - e.movementY : 100,
                                });
                            } else if (e.movementY > 0 && h > 0){
                                SeqCtx.parameterLock(props.trackIndex, {
                                    harmonicity: h - e.movementY > 0 ? h - e.movementY : 0,
                                });
                            } 
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
        if (e.controller && e.controller.number) {
            console.log('[FMSynth]: updating via CC', 'value', e.value, 'newHarm', (e.value * 127)*(100/127));
            setState(state => {
                let copyState = {
                    ...state,
                    harmonicity: e.value*(100/127.00),
                };
                stateIsRef.current = {...copyState};
                stateShouldBeRef.current = {...copyState};
                return copyState;
            })
        } else {
            if (e.movementY < 0 && state.harmonicity < 100) {
                setState(state => {
                    let copyState = {
                        ...state,
                        harmonicity: state.harmonicity - e.movementY < 100 ? state.harmonicity - e.movementY : 100
                    }
                    stateIsRef.current = {...copyState};
                    stateShouldBeRef.current = {...copyState}
                    return copyState;
                }) } else if (e.movementY > 0 && state.harmonicity > 0) {
                setState(state => {
                    let copyState = {
                        ...state,
                        harmonicity: state.harmonicity - e.movementY > 0 ? state.harmonicity - e.movementY : 0,
                    }
                    stateIsRef.current = {...copyState};
                    stateShouldBeRef.current = {...copyState};
                    return copyState;
                })
            } 
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
            // console.log('[FMSynth]: absolutely no selected harmonicity spoted');
            return state.harmonicity
        } else {
            // console.log('[FMSynth]: no selected harmonicity spoted, no selected, or selected.length <= 0');
            return state.harmonicity
        }
    }
    let harm = displayHarm();

    const wrapBind = (funct, cc) => {
        const functRet = (e) => {
            if (e.controller.number === cc) {
                funct(e);
            }
        }
        return functRet;
    }

    const bindCCtoParameter = (deviceName, channel, cc, parameter) => {

        let deviceInput = WebMidi.getInputByName(deviceName);
        switch (parameter) {
            case 'harmonicity':
                let harmFunc = wrapBind(calcHarmonicity, cc);
                midiLearnRefs.current.harmonicity = {
                    func: harmFunc,
                    device: deviceName,
                    channel: channel,
                    cc: cc,
                }
                deviceInput.addListener('controlchange', channel, harmFunc);
                break;
            case 'modulationIndex':
                //code block
                break;
            case 'detune':
                //code block
                break;
            case 'oscillatorType':
                //code block
                break;
            case 'attack':
                //code block
                break;
            case 'decay':
                //code block
                break;
            case 'sustain':
                //code block
                break;
            case 'release':
                //code block
                break;
            case 'modulationAttack':
                //code block
                break;
            case 'modulationDecay':
                //code block
                break;
            case 'modulationSustain':
                //code block
                break;
            case 'modulationRelease':
                //code block
                break;
            default:
                //code block
                break;
        }
        WebMidi.inputs.map(input => {
            input.removeListener('controlchange', 'all', listenCCRef.current);
        });
    }

    const midiLearn = (contextEvent, parameter) => {
        contextEvent.preventDefault();
        let locked = false;
        switch (parameter) {
            case 'harmonicity':
                if (midiLearnRefs.current.harmonicity) {
                    locked = true;
                    let deviceInput = WebMidi.getInputByName(midiLearnRefs.current.harmonicity.device);
                    deviceInput.removeListener('controlchange', midiLearnRefs.current.harmonicity.channel, midiLearnRefs.current.harmonicity.func);
                    midiLearnRefs.current.harmonicity = null;
                }
                break;
            default:
                // code block
                break;
        }
        if (!locked) {
            console.log('[FMSynth]: context menu should be open');
            listenCCRef.current = (e) => {
                console.log("[FMSynth]: listening to controlChange", e.target.name, 'channel', e.channel, 'cc', e.controller.number, 'value', e.value);
                return bindCCtoParameter(e.target.name, e.channel, e.controller.number, parameter);
            }
            WebMidi.inputs.map(input => {
                input.addListener('controlchange', 'all', listenCCRef.current);
            })
        }
    }

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
            label='harmonicity'
            midiLearn={midiLearn}></Knob> 
        </div>
    )
};

export default FMSynth;