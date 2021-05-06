import React, {
    useEffect,
    useRef,
    useMemo,
    useState,
    useContext,
    useCallback,
    MutableRefObject,
} from 'react';
import usePrevious from '../../../hooks/usePrevious';
import { useProperties, useDrumRackProperties } from '../../../hooks/useProperty';
// import { useProperty, useProperties } from '../../../hooks/useProperty';

import { xolombrisxInstruments, updateInstrumentState, increaseDecreaseInstrumentProperty } from '../../../store/Track';
import { noteOn, noteOff, noteDict, numberToNote } from '../../../store/MidiInput';
import {
    parameterLock,
    setNoteMidi,
    noteInput,
    setNoteLengthPlayback,
    parameterLockIncreaseDecrease,
    removePropertyLock,
} from '../../../store/Sequencer';

import WebMidi, {
    InputEventNoteoff,
    InputEventNoteon,
    Input,
    InputEventControlchange
} from 'webmidi';

import {
    propertiesToArray,
    setNestedValue,
    getNested,
    deleteProperty,
    copyToNew
} from '../../../lib/objectDecompose'

// import * as Tone from 'tone';
// import Tone from '../../../lib/tone';
import { timeObjFromEvent, typeMovement } from '../../../lib/utility';

import ToneObjectsContext from '../../../context/ToneObjectsContext';
import ToneContext from '../../../context/ToneContext';
import { InstrumentProps, initials } from './index'
import { eventOptions } from './types';

import { useDispatch, useSelector } from 'react-redux';
import { getInitials, indicators } from '../defaults';
import { RootState, returnInstrument } from '../../Xolombrisx';
import { sixteenthFromBBS } from '../../Arranger';

import styles from './style.module.scss';

import DevicePresetManager from '../../../components/Layout/DevicePresetManager';
import DrumRackInstrument from '../../../lib/DrumRack';


import ModulationSynth from '../../../components/Layout/Instruments/ModulationSynth';
import NoiseSynth from '../../../components/Layout/Instruments/NoiseSynth';
import MembraneSynth from '../../../components/Layout/Instruments/MembraneSynth';
import MetalSynth from '../../../components/Layout/Instruments/MetalSynth';
import PluckSynth from '../../../components/Layout/Instruments/PluckSynth';
import DrumRack from '../../../components/Layout/Instruments/DrumRack';
import Chain from '../../../lib/fxChain';

export type controlChangeEvent = (e: InputEventControlchange) => void;

export const Instrument = <T extends xolombrisxInstruments>({ id, index, midi, voice, maxPolyphony, options, selected }: InstrumentProps<T>) => {


    // const instrumentRef = useRef(returnInstrument(voice, options));
    const Tone = useContext(ToneContext);
    const ref_ToneInstrument: MutableRefObject<ReturnType<typeof returnInstrument> | null> = useRef(null);
    useEffect(() => {
        if (firstRender) {
            ref_ToneInstrument.current = returnInstrument(voice, options)
            setRender(false)
        }

        if (ref_toneObjects.current)
            Object.keys(ref_toneObjects.current.patterns).forEach(key => {
                let keyNumber = parseInt(key);
                if (ref_toneObjects.current && ref_toneObjects.current.patterns[keyNumber][index])
                    ref_toneObjects.current.patterns[keyNumber][index].instrument.callback = instrumentCallback;
            });
        // console.log('instrument', voice, 'id', id, 'index', index);
    }, [])

    const instProps: string[] = useMemo(() => {
        return propertiesToArray(getInitials(voice))
    }, [voice]);

    const dispatch = useDispatch()
    const [firstRender, setRender] = useState(true);

    const ref_CCMaps = useRef<any>({});
    const ref_listenCC = useRef<controlChangeEvent>();
    const ref_midiInput = useRef<false | Input>(false);
    const ref_onHoldNotes = useRef<{ [key: string]: any }>({});
    const prev_voice = usePrevious(voice);

    const instrumentHTMLRef = useRef<HTMLDivElement>(null)

    const ref_toneObjects = useContext(ToneObjectsContext);

    const ref_lockedParameters: MutableRefObject<initials> = useRef({});

    const keyboardRange = useSelector((state: RootState) => state.midi.onboardRange);
    const keyboardRangeRef = useRef(keyboardRange)
    useEffect(() => { keyboardRangeRef.current = keyboardRange }, [keyboardRange])

    const override = useSelector((state: RootState) => state.sequencer.present.override);
    const overrideRef = useRef(override);
    useEffect(() => { overrideRef.current = override }, [override])

    const ref_options = useRef(options);
    useEffect(() => { ref_options.current = options }, [options])

    const ref_index = useRef(index);
    useEffect(() => { ref_index.current = index }, [index])

    const idRef = useRef(id);
    useEffect(() => { idRef.current = id }, [id])

    const pattTracker = useSelector((state: RootState) => state.arranger.present.patternTracker);
    const ref_pattTracker = useRef(pattTracker);
    useEffect(() => { ref_pattTracker.current = pattTracker }, [pattTracker])

    const arrgMode = useSelector((state: RootState) => state.arranger.present.mode);
    const ref_arrgMode = useRef(arrgMode);
    useEffect(() => { ref_arrgMode.current = arrgMode }, [arrgMode])

    const activePatt = useSelector((state: RootState) => state.sequencer.present.activePattern);
    const ref_activePatt = useRef(activePatt);
    useEffect(() => { ref_activePatt.current = activePatt }, [activePatt]);

    const selectedSteps = useSelector((state: RootState) => {
        if (state.sequencer.present.patterns[activePatt] && state.sequencer.present.patterns[activePatt].tracks[index])
            return state.sequencer.present.patterns[activePatt].tracks[index].selected
    });
    const ref_selectedSteps = useRef(selectedSteps);
    useEffect(() => { ref_selectedSteps.current = selectedSteps }, [selectedSteps])

    const isRec = useSelector((state: RootState) => state.transport.present.recording);
    const ref_isRec = useRef(isRec);
    useEffect(() => { ref_isRec.current = isRec }, [isRec])

    const isPlay = useSelector((state: RootState) => state.transport.present.isPlaying);
    const ref_isPlay = useRef(isPlay);
    useEffect(() => { ref_isPlay.current = isPlay }, [isPlay])
    const prev_IsPlay = usePrevious(isPlay);

    // ** flag ** 
    // only used as starting point for ref
    const pattVelocities = useSelector(
        (state: RootState) => {
            let o: { [key: number]: number } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].tracks[index].velocity
            });
            return o;
        }
    );

    const ref_pattVelocities = useRef(pattVelocities);
    useEffect(() => { ref_pattVelocities.current = pattVelocities }, [pattVelocities])

    // ** flag ** 
    // only used as starting point for ref
    const pattNoteLen = useSelector(
        (state: RootState) => {
            let o: { [key: number]: string | number | undefined } = {}
            Object.entries(state.sequencer.present.patterns).forEach(([key, pattern]) => {
                let k = parseInt(key);
                o[k] = pattern.tracks[index].noteLength;
            });
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].tracks[index].noteLength
            });
            return o
        }
    );
    const ref_pattNoteLen = useRef(pattNoteLen);
    useEffect(() => { ref_pattNoteLen.current = pattNoteLen }, [pattNoteLen])

    const pattsLen = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].patternLength
            });
            return o;
        }
    );
    const ref_pattsLen = useRef(pattsLen);
    useEffect(() => { ref_pattsLen.current = pattsLen }, [pattsLen])

    const trkPattLen = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].tracks[index].length
            });
            return o;
        }
    );
    const ref_trkPattLen = useRef(trkPattLen);
    useEffect(() => { ref_trkPattLen.current = trkPattLen }, [trkPattLen])

    const events = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].tracks[index].events
            });
            return o;
        }
    );
    const eventsRef = useRef(events);
    useEffect(() => { eventsRef.current = events }, [events])


    const removePropertyLockCallbacks: any = useMemo(() => {
        let o = {}
        let callArray = instProps.map(property => {
            return () => {
                if ( ref_selectedSteps.current && ref_selectedSteps.current.length > 0)
                    ref_selectedSteps.current.forEach(step => {
                        dispatch(removePropertyLock(
                            ref_index.current,
                            ref_activePatt.current,
                            step,
                            property    
                        ))
                    }
                )
            }
        })
        callArray.forEach((call, idx, arr) => {
            setNestedValue(instProps[idx], call, o);
        });
        return o
    }, [
        voice,
    ])

    const propertiesUpdate: any = useMemo(() => {
        let o = {}
        let callArray = instProps.map((property) => {
            return (value: any) => {
                // parameter lock logic 
                let temp = setNestedValue(property, value)
                if (ref_selectedSteps.current && ref_selectedSteps.current.length > 0) {
                    ref_selectedSteps.current.forEach(s => {
                        dispatch(parameterLock(
                            ref_activePatt.current,
                            // idRef.current,
                            ref_index.current,
                            s,
                            temp,
                            property
                        ))
                    })
                    // } else if (getNested(instrumentRef.current.get(), property)
                    //     === getNested(optionsRef.current, property)[0]) {
                } else {
                    // instrumentRef.current.set(temp);
                    dispatch(updateInstrumentState(ref_index.current, temp));
                };
            }
        });
        callArray.forEach((call, idx, arr) => {
            setNestedValue(instProps[idx], call, o);
        });
        return o
    }, [
        dispatch,
        ref_index,
        instProps,
        ref_options,
    ]);

    // I think maybe this one doesn't need
    // to be wraped in an useMemo 
    // ** flag ** 
    const propertiesIncDec: any = useMemo(() => {
        const callArray = instProps.map((property) => {
            return (e: any) => {

                const indicatorType = getNested(ref_options.current, property)[3]
                const stateValue = getNested(ref_options.current, property)[0]

                const isContinuous = indicatorType === indicators.KNOB
                    || indicatorType === indicators.VERTICAL_SLIDER

                const cc = e.controller && e.controller.number

                if ( ref_selectedSteps.current && ref_selectedSteps.current.length >= 1) {
                    ref_selectedSteps.current.forEach(step => {
                        dispatch(parameterLockIncreaseDecrease(
                            ref_activePatt.current,
                            // idRef.current,
                            ref_index.current,
                            step,
                            cc ? e.value : e.movementY,
                            property,
                            getNested(ref_options.current, property),
                            cc,
                            isContinuous,
                        ))
                    })
                    // } else if (stateValue === getNested(
                    //     instrumentRef.current.get(),
                    //     property
                    // )) {
                } else {
                    dispatch(increaseDecreaseInstrumentProperty(
                        ref_index.current,
                        property,
                        cc ? e.value : e.movementY,
                        cc,
                        isContinuous
                    ))
                }
            }
        })
        let o = {};
        instProps.forEach((_, idx, __) => {
            setNestedValue(instProps[idx], callArray[idx], o);
        });
        return o;
    }, [
        dispatch,
        ref_activePatt,
        ref_index,
        ref_options,
        ref_selectedSteps,
        instProps,
    ]);

    useProperties(ref_ToneInstrument, options);
    useDrumRackProperties(ref_ToneInstrument, options)

    // reset to normal state after playback stopped
    // ** flag ** 
    // instrumentCallback, effectsCallbacks, lockedProperties
    // should all be encapsulated into hooks 
    // something like 
    // { lockedParameters, instrumentCallback} = useParameterLocks(

    // )
    useEffect(() => {
        if (!isPlay && prev_IsPlay) {
            let lockedProperties = propertiesToArray(ref_lockedParameters.current);
            lockedProperties.forEach((lockedProperty) => {
                const data = copyToNew(ref_lockedParameters.current, lockedProperty)
                dispatch(updateInstrumentState(index, data));
            });
            // instrumentRef.current.set(d);
        }
        ref_isPlay.current = isPlay;
    }, [
        isPlay,
        dispatch,
        index,
        prev_IsPlay,
        ref_isPlay
    ]
    );

    const instrumentCallback = useCallback((time: number, value: eventOptions) => {
        let velocity: number = value.velocity
            ? value.velocity
            : ref_arrgMode.current === "pattern"
                ? ref_pattVelocities.current[ref_activePatt.current]
                : ref_pattVelocities.current[ref_pattTracker.current[0]]
        let length: string | number | undefined = value.length
            ? value.length
            : ref_arrgMode.current === "pattern"
                ? ref_pattNoteLen.current[ref_activePatt.current]
                : ref_pattNoteLen.current[ref_pattTracker.current[0]]
        let notes: string[] | undefined = value.note ? value.note : undefined;

        // note playback

        const eventProperties = propertiesToArray(value);

        eventProperties.forEach(eventProperty => {
            if (
                eventProperty !== 'velocity'
                && eventProperty !== 'length'
                && eventProperty !== 'note'
            ) {
                const currVal = getNested(ref_options.current, eventProperty);
                const callbackVal = getNested(value, eventProperty);
                const lockVal = getNested(ref_lockedParameters.current, eventProperty);
                if (callbackVal && callbackVal !== currVal[0]) {
                    propertiesUpdate[eventProperty](callbackVal);
                    setNestedValue(eventProperty, callbackVal, ref_lockedParameters);
                } else if (!callbackVal && lockVal && currVal[0] !== lockVal) {
                    propertiesUpdate[eventProperty](lockVal);
                    deleteProperty(ref_lockedParameters.current, eventProperty);
                    // setNestedValue(property, undefined, lockedParameters.current)
                }
            }
        })

        if (notes) {
            // should fix this 
            notes.forEach(note => {
                if (note && ref_ToneInstrument.current) {
                    ref_ToneInstrument.current.triggerAttackRelease(
                        note,
                        length ? length : 0,
                        time,
                        velocity / 127,
                        voice === xolombrisxInstruments.DRUMRACK
                            ? DrumRackInstrument.checkNote(note)
                            : undefined
                    );
                }
            })
        }
    }, [
        instProps,
        propertiesUpdate,
        ref_activePatt,
        ref_arrgMode,
        ref_options,
        ref_pattNoteLen,
        ref_pattTracker,
        ref_pattVelocities,
    ]
    );

    const returnStep = useCallback((t: string): number => {
        let result;
        const n = sixteenthFromBBS(t)
        if (ref_arrgMode.current === "pattern") {
            result = ref_trkPattLen.current[ref_activePatt.current] >= ref_pattsLen.current[ref_activePatt.current]
                ? n
                : n % ref_trkPattLen.current[ref_activePatt.current]
        } else {
            const pattern = ref_pattTracker.current[0];
            const timeb = ref_pattTracker.current[1] ? ref_pattTracker.current[1] : 0;
            const timebbs = Tone.Time(timeb, 's').toBarsBeatsSixteenths();
            const step = n - sixteenthFromBBS(timebbs);
            const patternLocation = step % ref_pattsLen.current[pattern];
            if (!patternLocation) return -1
            result = ref_trkPattLen.current[pattern] < ref_pattsLen.current[ref_activePatt.current]
                ? patternLocation % ref_trkPattLen.current[pattern]
                : patternLocation;
        };
        return result;
    }, [
        ref_arrgMode,
        ref_pattTracker,
        ref_pattsLen,
        ref_activePatt,
        ref_trkPattLen
    ]
    )

    const noteLock = useCallback((
        note: string,
        velocity: number,
        pattern: number
    ): void => {
        ref_selectedSteps.current?.forEach(step => {
            const event = {
                ...eventsRef.current[pattern][step],
            };
            const time = timeObjFromEvent(step, event);
            let notes = event && event.note ? [...event['note']] : []
            if (notes.includes(note)) {
                notes = notes.filter(n => n !== note);
            } else {
                notes.push(note)
            }
            event['note'] = notes ? notes : null;
            event['velocity'] = velocity;
            ref_toneObjects.current?.patterns[pattern][ref_index.current].instrument.at(time, event)
            dispatch(setNoteMidi(ref_index.current, event['note'], velocity, step));
        });

    }, [dispatch, index, ref_toneObjects, eventsRef, ref_selectedSteps]);

    const setNoteInput = useCallback((
        pattern: number,
        step: number,
        offset: number,
        noteName: string,
        velocity: number,
        time: number,
    ): void => {
        const e = {
            ...eventsRef.current[pattern][step],
            note: []
        };
        const pastTime = timeObjFromEvent(step, e);
        e.offset = offset;
        e.velocity = velocity;
        if (overrideRef.current) {
            e.note = [noteName];
        } else if (!overrideRef && !e.note.includes(noteName)) {
            e.note.push(noteName);
        }
        ref_toneObjects.current?.patterns[pattern][ref_index.current].instrument.remove(pastTime);
        dispatch(
            noteInput(
                pattern,
                idRef.current,
                step,
                offset,
                noteName,
                velocity
            )
        );
        ref_onHoldNotes.current[noteName] = {
            pattern,
            index,
            step,
            offset,
            velocity,
            time,
            e,
        }
    }, [
        dispatch,
        index,
        ref_toneObjects,
        eventsRef,
        overrideRef
    ]
    )

    const midiInCallback = useCallback((e: InputEventNoteon) => {
        const noteNumber = e.note.number;
        const noteName = e.note.name + e.note.octave;
        const velocity = e.velocity * 127;
        const time = Date.now() / 1000;

        if (midi.device && midi.channel) {
            dispatch(noteOn([noteNumber], midi.device, midi.channel));
        }

        noteInCallback(noteNumber, noteName, time, velocity)
    }, [midi.device, midi.channel])

    const midiOffCallback = useCallback((e: InputEventNoteoff) => {
        const noteNumber = e.note.number;
        const noteName = e.note.name + e.note.octave;
        if (midi.device && midi.channel) {
            dispatch(noteOff([noteNumber], midi.device, midi.channel))
        }

        noteOffCallback(noteNumber, noteName)
    }, [])



    const noteInCallback = useCallback((noteNumber: number, noteName: string, time: number, velocity?: number) => {
        if (!velocity) velocity = 60
        if (ref_isRec.current && ref_isPlay.current && ref_ToneInstrument.current) {

            // recording playiback logic 
            ref_ToneInstrument.current.triggerAttack(noteName, 0, velocity);
            const position = Tone.Transport.position.toString();
            const multiplier = parseFloat("0." + position.split(".")[1]);
            let offset = Math.round(127 * multiplier);
            const pattern = ref_arrgMode.current
                ? ref_activePatt.current
                : ref_pattTracker.current[0];
            let step = returnStep(position);
            if (step >= 0) {
                if (
                    eventsRef.current[ref_activePatt.current][step + 1]
                    && !eventsRef.current[ref_activePatt.current][step + 1]['note']
                ) {
                    step = step + 1
                    offset = 1 - offset;
                }
                setNoteInput(pattern, step, offset, noteName, velocity, time)
            }
        } else if (ref_selectedSteps.current && ref_selectedSteps.current.length >= 0 && !ref_isRec.current) {
            noteLock(noteName, velocity, ref_activePatt.current);
        } else {
            ref_ToneInstrument.current?.triggerAttack(noteName, 0, velocity);
        }
    }, [noteLock,
        setNoteInput,
        ref_activePatt,
        ref_arrgMode,
        eventsRef,
        ref_isPlay,
        ref_isRec,
        ref_pattTracker,
        returnStep,
        ref_selectedSteps
    ]
    )


    const noteOffCallback = useCallback((noteNumber: number, noteName: string): void => {
        const noteObj = ref_onHoldNotes.current[noteName];

        if (ref_isRec.current && ref_isPlay.current) {
            // instrumentRef.current.triggerRelease(noteName);
            const now = Date.now() / 1000;
            const length = Tone.Time(now - noteObj.time, 's').toNotation();
            const pattern = noteObj.pattern
            const step = noteObj.step
            const e = {
                ...noteObj.e,
                length: length,
            }
            const time = timeObjFromEvent(noteObj.step, e);
            ref_toneObjects.current?.patterns[pattern][ref_index.current].instrument.at(time, e);
            dispatch(
                setNoteLengthPlayback(
                    noteName,
                    pattern,
                    index,
                    step,
                    length,
                )
            );
            ref_onHoldNotes.current[noteName] = {};
        }
        if (!(ref_selectedSteps.current && ref_selectedSteps.current.length > 0) && !ref_isRec.current) {
            ref_ToneInstrument.current?.triggerRelease(noteName);
        }
    }, [
        dispatch,
        index,
        ref_toneObjects,
        ref_isPlay,
        ref_isRec,
        ref_selectedSteps,
    ]
    );

    const instrumentKeyDown = useCallback(function keyDownCallback(this: Document, ev: KeyboardEvent) {
        if (ev.repeat) { return }
        const key = ev.key.toLowerCase()
        if (Object.keys(noteDict).includes(key)) {
            const noteNumber = noteDict[key] + (keyboardRangeRef.current * 12)
            const noteName = numberToNote(noteNumber);
            if (noteNumber < 127) {
                const time = Date.now() / 1000;
                dispatch(noteOn([noteNumber], 'onboardKey', 'all'));
                noteInCallback(noteNumber, noteName, time)
            }
        }
    }, [noteDict, keyboardRangeRef])

    const instrumentKeyUp = useCallback(function keyUpCallback(this: Document, ev: KeyboardEvent) {
        const key = ev.key.toLowerCase()
        if (Object.keys(noteDict).includes(key)) {
            const noteNumber = noteDict[key] + (keyboardRangeRef.current * 12)
            const noteName = numberToNote(noteNumber);
            if (noteNumber < 127) {
                dispatch(noteOff([noteNumber], 'onboardKey', 'all'));
                noteOffCallback(noteNumber, noteName)
            }
        }
    }, [dispatch, noteOffCallback])



    const wrapBind = (f: Function, cc: number): ((e: InputEventControlchange) => void) => {
        const functRect = (e: InputEventControlchange) => {
            if (e.controller.number === cc) {
                f(e)
            }
        }
        return functRect
    }

    const bindCCtoParameter = (
        device: string,
        channel: number,
        cc: number,
        property: string
    ) => {
        const calculationCallback = wrapBind(
            getNested(
                propertiesIncDec,
                property
            ), cc);
        setNestedValue(
            property
            , {
                func: calculationCallback,
                device: device,
                channel: channel,
                cc: cc,
            },
            ref_CCMaps.current
        )
        if (device && channel) {
            let i = WebMidi.getInputByName(device)
            if (i) {
                i.addListener(
                    'controlchange',
                    channel,
                    calculationCallback
                );
            }
        }
    }

    // const midiLearn = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, property: string) => {
    const midiLearn = (property: string) => {
        // event.preventDefault()
        // event.stopPropagation()
        let locked = false;
        const mappedProperty = getNested(ref_CCMaps.current, property);
        if (mappedProperty) {
            locked = true;
            let device = WebMidi.getInputByName(mappedProperty.device);
            if (device) {
                device.removeListener(
                    'controlchange',
                    mappedProperty.channel,
                    mappedProperty.func,
                )
                deleteProperty(ref_CCMaps.current, property);
            }
        }
        if (!locked) {
            ref_listenCC.current = (e: InputEventControlchange): void => {
                return bindCCtoParameter(
                    e.target.name,
                    e.channel,
                    e.controller.number,
                    property,
                )
            }
            WebMidi.inputs.forEach(input => {
                if (ref_listenCC.current) {
                    input.addListener(
                        'controlchange',
                        'all',
                        ref_listenCC.current
                    )
                }
            });
        }
    }

    // change instrument logic 
    useEffect(() => {
        if (prev_voice && prev_voice !== voice) {
            ref_ToneInstrument.current = returnInstrument(voice, ref_options.current);
            // toneRefEmitter.emit(
            //     trackEventTypes.CHANGE_INSTRUMENT,
            //     { instrument: instrumentRef.current, trackId: id }
            // );
            if (ref_toneObjects.current && index < ref_toneObjects.current.tracks.length && ref_toneObjects.current.tracks[index].instrument) {
                const inst = ref_toneObjects.current.tracks[index].instrument
                const chain = ref_toneObjects.current.tracks[index].chain;
                if (inst) {
                    inst.disconnect();
                    inst.dispose();
                }
                ref_ToneInstrument.current.connect(chain.in);
                // refsContext.current[id].instrument.disconnect();
                // refsContext.current[id].instrument.dispose();
                ref_toneObjects.current.tracks[index].instrument = ref_ToneInstrument.current;
                // should be setting Part callback = instrumentCallback at each new render ? 
                // Object.keys(ref_toneObjects.current.patterns).forEach(key => {
                //     let keyNumber = parseInt(key);
                //     if (ref_toneObjects.current)
                //         ref_toneObjects.current.patterns[keyNumber][index].instrument.callback = instrumentCallback;
                // });
            }
        }

    }, [
        voice,
        index,
        ref_toneObjects,
        instrumentCallback,
        ref_options
    ]);

    // keyboard note/midi input listeners
    useEffect(() => {
        // console.log(instrumentRef.current.get())
        if (midi.channel && midi.device && midi.device !== 'onboardKey') {
            ref_midiInput.current = WebMidi.getInputByName(midi.device);
            if (
                ref_midiInput.current
                && !ref_midiInput.current.hasListener('noteon', midi.channel, midiInCallback)
            ) {
                ref_midiInput.current.addListener('noteon', midi.channel, midiInCallback);
                ref_midiInput.current.addListener('noteoff', midi.channel, midiOffCallback);
            }

            return () => {
                if (ref_midiInput.current
                    && midi.channel
                    && ref_midiInput.current.hasListener('noteon', midi.channel, midiInCallback)
                ) {
                    ref_midiInput.current.removeListener('noteon', midi.channel, midiInCallback);
                    ref_midiInput.current.removeListener('noteoff', midi.channel, midiOffCallback);
                }
            }
        } else if (midi.device === 'onboardKey') {
            document.addEventListener('keydown', instrumentKeyDown);
            document.addEventListener('keyup', instrumentKeyUp);

            return () => {
                document.removeEventListener('keydown', instrumentKeyDown);
                document.removeEventListener('keyup', instrumentKeyUp);
            }
        }
    }, [midi.device, midi.channel])


    // adding instrument to context in first render
    useEffect(() => {
        // talvez pode dar problema pq add instrument vai ser async ?¿
        // e ai quando for colocar o instrumentCallback ainda não vai ter o instrumento no objeto?¿
        // se isso for o caso, passar instrumentCallback pro emissor de evento também (aliás, pq não foi esse o caso?)
        if (firstRender && ref_toneObjects.current) {
            // console.log('this is the first render, and should be emitting an event')
            // toneRefEmitter.emit(
            //     trackEventTypes.ADD_INSTRUMENT,
            //     { instrument: instrumentRef.current, trackId: id }
            // );

            // if (ref_toneTrkObjCtx && !ref_toneTrkObjCtx.current[id].instrument) {
            if (index >= ref_toneObjects.current.tracks.length) {
                console.log('no instrument under the id, should be setting up the ref', 'index', index, 'id', id)
                ref_toneObjects.current.tracks.push({chain: new Chain(), effects: [], instrument: undefined})
                ref_toneObjects.current.tracks[index].instrument = ref_ToneInstrument.current;
                ref_ToneInstrument.current?.connect(ref_toneObjects.current.tracks[index].chain.in);
            } else if (index < ref_toneObjects.current.tracks.length && !ref_toneObjects.current.tracks[index].instrument) {
                console.log('there\'s already an id in the ref obj, but no instrument', 'index', index, 'id', id)
                // ref_toneTrkObjCtx.current[id] = {chain: new Chain(), effects: [], instrument: undefined}
                ref_toneObjects.current.tracks[index].instrument = ref_ToneInstrument.current;
                ref_ToneInstrument.current?.connect(ref_toneObjects.current.tracks[index].chain.in);
            }
            // ooooh dumb as fuck boooi, u have to create the new entry in the ref_toneTrigg before

            Object.keys(ref_toneObjects.current.patterns).forEach(key => {
                console.log('should be pushing before setting stuff')
                let k = parseInt(key)
                if (ref_toneObjects.current && index > ref_toneObjects.current.patterns[k].length) {
                    ref_toneObjects.current.patterns[k].push({instrument: new Tone.Part(), effects: []})
                    ref_toneObjects.current.patterns[k][index].instrument.callback = instrumentCallback;
                }
            })
            setRender(false);
        }

    }, []);


    const Component = voice === xolombrisxInstruments.FMSYNTH
        ? <ModulationSynth
            calcCallbacks={propertiesIncDec}
            removePropertyLocks={removePropertyLockCallbacks}
            options={options}
            index={index}
            events={events[activePatt]}
            selected={selectedSteps}
            voice={voice}
            properties={instProps}
            propertyUpdateCallbacks={propertiesUpdate} />
        : voice === xolombrisxInstruments.NOISESYNTH
            ? <NoiseSynth
                calcCallbacks={propertiesIncDec}
                // parameterLockValues={parameterLockValues}
                properties={instProps}
                removePropertyLocks={removePropertyLockCallbacks}
                ccMap={ref_CCMaps}
                midiLearn={midiLearn}
                events={events[activePatt]}
                selected={selectedSteps}
                options={options}
                index={index}
                propertyUpdateCallbacks={propertiesUpdate} />
            : voice === xolombrisxInstruments.AMSYNTH
                ? <ModulationSynth
                    removePropertyLocks={removePropertyLockCallbacks}
                    calcCallbacks={propertiesIncDec}
                    options={options}
                    index={index}
                    events={events[activePatt]}
                    selected={selectedSteps}
                    voice={voice}
                    properties={instProps}
                    propertyUpdateCallbacks={propertiesUpdate} />
                : voice === xolombrisxInstruments.MEMBRANESYNTH
                    ? <MembraneSynth
                        calcCallbacks={propertiesIncDec}
                        removePropertyLocks={removePropertyLockCallbacks}
                        events={events[activePatt]}
                        index={index}
                        options={options}
                        properties={instProps}
                        propertyUpdateCallbacks={propertiesUpdate}
                        selected={selectedSteps}
                    />
                    : voice === xolombrisxInstruments.METALSYNTH
                        ? <MetalSynth
                            calcCallbacks={propertiesIncDec}
                            removePropertyLocks={removePropertyLockCallbacks}
                            events={events[activePatt]}
                            index={index}
                            options={options}
                            properties={instProps}
                            propertyUpdateCallbacks={propertiesUpdate}
                            selected={selectedSteps}
                        />
                        : voice === xolombrisxInstruments.PLUCKSYNTH
                            ? <PluckSynth
                                removePropertyLocks={removePropertyLockCallbacks}
                                calcCallbacks={propertiesIncDec}
                                events={events[activePatt]}
                                index={index}
                                options={options}
                                properties={instProps}
                                propertyUpdateCallbacks={propertiesUpdate}
                                selected={selectedSteps}
                            />
                            : voice === xolombrisxInstruments.DRUMRACK
                                ? <DrumRack
                                    removePropertyLocks={removePropertyLockCallbacks}
                                    calcCallbacks={propertiesIncDec}
                                    events={events[activePatt]}
                                    index={index}
                                    options={options}
                                    properties={instProps}
                                    propertyUpdateCallbacks={propertiesUpdate}
                                    selected={selectedSteps}
                                />
                                : null;

    return (
        <div
            ref={instrumentHTMLRef}
            className={styles.border}
            style={{ display: !selected ? 'none' : 'flex' }}>
            <div className={styles.deviceManager}>
                <DevicePresetManager
                    deviceId={''}
                    keyValue={[]}
                    onSubmit={() => { }}
                    remove={() => { }}
                    save={() => { }}
                    select={() => { }}
                    selected={''}
                ></DevicePresetManager>
            </div>
            { Component}
        </div>
    )
}
