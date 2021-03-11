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
import { useProperty } from '../../../hooks/useProperty';
import useQuickRef from '../../../hooks/useQuickRef';

import { xolombrisxInstruments, updateInstrumentState } from '../../../store/Track';
import { noteOn, noteOff, noteDict, numberToNote } from '../../../store/MidiInput';
import {
    parameterLock,
    setNoteMidi,
    noteInput,
    setNoteLengthPlayback
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
    onlyValues,
    deleteProperty,
    copyToNew
} from '../../../lib/objectDecompose'
// import Tone from '../../../lib/tone';
import * as Tone from 'tone';
import valueFromCC, { valueFromMouse, optionFromCC } from '../../../lib/curves';
import { timeObjFromEvent, extendObj, typeMovement } from '../../../lib/utility';
import toneRefEmitter, { trackEventTypes } from '../../../lib/toneRefsEmitter';
// import toneRefEmitter, { trackEventTypes } from '../../../lib/myCustomToneRefsEmitter';

import triggCtx from '../../../context/triggState';
import toneRefsContext from '../../../context/toneRefsContext';
import { InstrumentProps, initials } from './index'
import { eventOptions, initialsArray } from './types';

import { useDispatch, useSelector } from 'react-redux';
import { getInitials, indicators } from '../defaults';
import { RootState } from '../../Xolombrisx';
import { sixteenthFromBBS } from '../../Arranger';

export const returnInstrument = (voice: xolombrisxInstruments, opt: initialsArray) => {
    let options = onlyValues(opt);

    switch (voice) {
        case xolombrisxInstruments.AMSYNTH:
            return new Tone.PolySynth(Tone.AMSynth, options);
        case xolombrisxInstruments.FMSYNTH:
            return new Tone.PolySynth(Tone.FMSynth, options);
        case xolombrisxInstruments.MEMBRANESYNTH:
            return new Tone.PolySynth(Tone.MembraneSynth, options);
        case xolombrisxInstruments.METALSYNTH:
            return new Tone.PolySynth(Tone.MetalSynth, options);
        case xolombrisxInstruments.NOISESYNTH:
            return new Tone.NoiseSynth(options);
        case xolombrisxInstruments.PLUCKSYNTH:
            return new Tone.PluckSynth(options);
        default:
            return new Tone.Sampler();
    }
}

export type controlChangeEvent = (e: InputEventControlchange) => void;

export const Instrument = <T extends xolombrisxInstruments>({ id, index, midi, voice, maxPolyphony, options }: InstrumentProps<T>) => {

    const instrumentRef = useRef(returnInstrument(voice, options));
    const properties: string[] = useMemo(() => propertiesToArray(getInitials(voice)), [voice]);
    const dispatch = useDispatch()
    const [firstRender, setRender] = useState(true);

    const CCMaps = useRef<any>({});
    const listenCC = useRef<controlChangeEvent>();
    const inputRef = useRef<false | Input>(false);
    const onHoldNotes = useRef<{ [key: string]: any }>({});

    const triggRefs = useContext(triggCtx);
    const refsContext = useContext(toneRefsContext);
    // const previousMidi = usePrevious(midi);

    const lockedParameters: MutableRefObject<initials> = useRef({});

    const keyboardRange = useSelector((state: RootState) => state.midi.onboardRange);
    const keyboardRangeRef = useRef(keyboardRange)
    useEffect(() => { keyboardRangeRef.current = keyboardRange }, [keyboardRange])

    const override = useSelector((state: RootState) => state.sequencer.present.override);
    const overrideRef = useRef(override);
    useEffect(() => { overrideRef.current = override }, [override])

    const optionsRef = useRef(options);
    useEffect(() => { optionsRef.current = options }, [options])

    const indexRef = useRef(index);
    useEffect(() => { indexRef.current = index }, [index])

    const patternTracker = useSelector((state: RootState) => state.arranger.present.patternTracker);
    const patternTrackerRef = useRef(patternTracker);
    useEffect(() => { patternTrackerRef.current = patternTracker }, [patternTracker])

    const arrangerMode = useSelector((state: RootState) => state.arranger.present.mode);
    const arrangerModeRef = useRef(arrangerMode);
    useEffect(() => { arrangerModeRef.current = arrangerMode }, [arrangerMode])

    const activePattern = useSelector((state: RootState) => state.sequencer.present.activePattern);
    const activePatternRef = useRef(activePattern);
    useEffect(() => { activePatternRef.current = activePattern }, [activePattern]);

    const selectedSteps = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[index].selected);
    const selectedStepsRef = useRef(selectedSteps);
    useEffect(() => { selectedStepsRef.current = selectedSteps }, [selectedSteps])

    const isRecording = useSelector((state: RootState) => state.transport.present.recording);
    const isRecordingRef = useRef(isRecording);
    useEffect(() => { isRecordingRef.current = isRecording }, [isRecording])

    const isPlaying = useSelector((state: RootState) => state.transport.present.isPlaying);
    const isPlayingRef = useRef(isPlaying);
    useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
    const previousPlaying = usePrevious(isPlaying);

    const patternVelocities = useSelector(
        (state: RootState) => {
            let o: { [key: number]: number } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].tracks[index].velocity
            });
            return o;
        }
    );
    const patternVelocitiesRef = useRef(patternVelocities);
    useEffect(() => { patternVelocitiesRef.current = patternVelocities }, [patternVelocities])

    const patternNoteLength = useSelector(
        (state: RootState) => {
            let o: { [key: number]: string | number } = {}
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
    const patternNoteLengthRef = useRef(patternNoteLength);
    useEffect(() => { patternNoteLengthRef.current = patternNoteLength }, [patternNoteLength])

    const patternLengths = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].patternLength
            });
            return o;
        }
    );
    const patternLengthsRef = useRef(patternLengths);
    useEffect(() => { patternLengthsRef.current = patternLengths }, [patternLengths])

    const trackPatternLength = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].tracks[index].length
            });
            return o;
        }
    );
    const trackPatternLengthRef = useRef(trackPatternLength);
    useEffect(() => { trackPatternLengthRef.current = trackPatternLength }, [trackPatternLength])

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

    const propertyValueUpdateCallback: any = useMemo(() => {
        let o = {}
        console.log('re calculating propertyUpdate');
        let callArray = properties.map((property) => {
            return (value: any) => {
                if (getNested(instrumentRef.current.get(), property)
                    === getNested(optionsRef.current, property)[0]) {
                    let temp = setNestedValue(property, value)
                    // instrumentRef.current.set(temp);
                    dispatch(updateInstrumentState(indexRef.current, temp));
                };
            }
        });
        callArray.forEach((call, idx, arr) => {
            setNestedValue(properties[idx], call, o);
        });
        return o
    }, [
        dispatch,
        indexRef,
        properties,
        optionsRef,
    ]);

    // preciso definir o state should be pra usar dentro dessa callback aqui tambem
    const propertyCalculationCallbacks: any = useMemo(() => {
        const callArray = properties.map((property) => {
            return (e: any) => {

                const [
                    stateValue,
                    parameterOptions,
                    indicatorType,
                    parameterPayload
                ] = [...getNested(optionsRef.current, property)]
                const low = parameterOptions[0], high = parameterOptions[1]

                const isContinuous = indicatorType === indicators.KNOB
                    || indicatorType === indicators.VERTICAL_SLIDER
                    || indicatorType === indicators.HORIZONTAL_SLIDER

                if (selectedStepsRef.current.length >= 1) {

                    for (let step of selectedStepsRef.current) {
                        let data, propVal;
                        let event = { ...eventsRef.current[activePatternRef.current][step] }
                        const time = timeObjFromEvent(step, event)
                        const trigg = triggRefs.current[activePatternRef.current][indexRef.current].instrument
                        const evp = getNested(event, property);

                        // parameter lock logic
                        if (isContinuous) {
                            const currentValue = evp ? evp : stateValue;
                            propVal = e.controller && e.controler.number
                                ? valueFromCC(e.value, low, high, parameterPayload)
                                : valueFromMouse(
                                    currentValue,
                                    typeMovement(indicatorType, e),
                                    low,
                                    high,
                                    parameterPayload
                                );
                            data = setNestedValue(property, propVal);
                        } else {
                            propVal = e.controller && e.controller.number
                                ? optionFromCC(e.value, parameterOptions)
                                : e.target.value
                            if (propVal !== stateValue) {
                                data = setNestedValue(property, propVal);
                            }
                        }
                        if (data) {
                            // event = extendObj(event, data);
                            // trigg.at(time, event);
                            dispatch(
                                parameterLock(
                                    activePatternRef.current,
                                    index,
                                    step,
                                    data,
                                    property
                                )
                            );
                        }
                    }
                } else {
                    // no steps selected logic
                    if (isContinuous) {
                        if (
                            stateValue === getNested(
                                instrumentRef.current.get(),
                                property
                            )
                        ) {
                            let val = e.controller && e.controler.number
                                ? valueFromCC(e.value, low, high, parameterPayload)
                                : valueFromMouse(
                                    stateValue,
                                    typeMovement(indicatorType, e),
                                    low,
                                    high,
                                    parameterPayload
                                );
                            // instrumentRef.current.set(setNestedValue(property, val))
                            dispatch(
                                updateInstrumentState(
                                    index,
                                    setNestedValue(property, val)
                                )
                            )
                        }
                    } else {
                        let val = e.controller && e.controller.number
                            ? optionFromCC(e.value, parameterOptions)
                            : e.target.value
                        if (val !== stateValue) {
                            let data = setNestedValue(property, val);
                            // instrumentRef.current.set(data);
                            dispatch(updateInstrumentState(index, data))
                        }
                    }
                }
            }
        })
        let o = {};
        properties.forEach((_, idx, __) => {
            setNestedValue(properties[idx], callArray[idx], o);
        });
        return o;
    }, [
        dispatch,
        activePatternRef,
        eventsRef,
        indexRef,
        optionsRef,
        selectedStepsRef,
        index,
        properties,
        triggRefs
    ]);

    useProperty(instrumentRef, options, 'harmonicity');
    useProperty(instrumentRef, options, 'attack');
    useProperty(instrumentRef, options, 'attackNoise');
    useProperty(instrumentRef, options, 'curve');
    useProperty(instrumentRef, options, 'dampening');
    useProperty(instrumentRef, options, 'detune');
    useProperty(instrumentRef, options, 'envelope', true);
    useProperty(instrumentRef, options, 'modulation', true);
    useProperty(instrumentRef, options, 'modulationEnvelope', true);
    useProperty(instrumentRef, options, 'noise', true);
    useProperty(instrumentRef, options, 'octaves');
    useProperty(instrumentRef, options, 'pitchDecay');
    useProperty(instrumentRef, options, 'oscillator', true);
    useProperty(instrumentRef, options, 'modulationIndex')
    useProperty(instrumentRef, options, 'portamento');
    useProperty(instrumentRef, options, 'resonance');
    useProperty(instrumentRef, options, 'volume')



    // reset to normal state after playback stopped
    useEffect(() => {
        if (!isPlaying && previousPlaying) {
            let lockedProperties = propertiesToArray(lockedParameters.current);
            lockedProperties.forEach((lockedProperty) => {
                const data = copyToNew(lockedParameters.current, lockedProperty)
                dispatch(updateInstrumentState(index, data));
            });
            // instrumentRef.current.set(d);
        }
        isPlayingRef.current = isPlaying;
    }, [
        isPlaying,
        dispatch,
        index,
        previousPlaying,
        isPlayingRef
    ]
    );

    const instrumentCallback = useCallback((time: number, value: eventOptions) => {
        let velocity: number = value.velocity
            ? value.velocity
            : arrangerModeRef.current === "pattern"
                ? patternVelocitiesRef.current[activePatternRef.current]
                : patternVelocitiesRef.current[patternTrackerRef.current[0]]
        let length: string | number = value.length
            ? value.length
            : arrangerModeRef.current === "pattern"
                ? patternNoteLengthRef.current[activePatternRef.current]
                : patternNoteLengthRef.current[patternTrackerRef.current[0]]
        let notes: string[] | undefined = value.note ? value.note : undefined;

        // note playback
        if (notes) {
            notes.forEach(note => {
                if (note) {
                    instrumentRef.current.triggerAttackRelease(
                        note,
                        length,
                        time,
                        velocity
                    );
                }
            })
        }

        const eventProperties = propertiesToArray(value);

        eventProperties.forEach(eventProperty => {
            if (
                eventProperty !== 'velocity'
                && eventProperty !== 'length'
                && eventProperty !== 'note'
            ) {
                const currVal = getNested(optionsRef.current, eventProperty);
                const callbackVal = getNested(value, eventProperty);
                const lockVal = getNested(lockedParameters.current, eventProperty);
                if (callbackVal && callbackVal !== currVal[0]) {
                    propertyValueUpdateCallback[eventProperty](callbackVal);
                    setNestedValue(eventProperty, callbackVal, lockedParameters);
                } else if (!callbackVal && lockVal && currVal[0] !== lockVal) {
                    propertyValueUpdateCallback[eventProperty](lockVal);
                    deleteProperty(lockedParameters.current, eventProperty);
                    // setNestedValue(property, undefined, lockedParameters.current)
                }
            }
        })

        // parameter lock
        // properties.forEach(property => {
        //     const currVal = getNested(optionsRef.current, property);
        //     const callbackVal = getNested(value, property);
        //     const lockVal = getNested(lockedParameters.current, property);
        //     if (callbackVal && callbackVal !== currVal[0]) {
        //         propertyUpdate[property](callbackVal);
        //         setNestedValue(property, callbackVal, lockedParameters);
        //     } else if (!callbackVal && lockVal && currVal[0] !== lockVal) {
        //         propertyUpdate[property](lockVal);
        //         deleteProperty(lockedParameters.current, property);
        //         // setNestedValue(property, undefined, lockedParameters.current)
        //     }
        // });
    }, [
        properties,
        propertyValueUpdateCallback,
        activePatternRef,
        arrangerModeRef,
        optionsRef,
        patternNoteLengthRef,
        patternTrackerRef,
        patternVelocitiesRef,
    ]
    );

    const returnStep = useCallback((t: string): number => {
        let result;
        const n = sixteenthFromBBS(t)
        if (arrangerModeRef.current === "pattern") {
            result = trackPatternLengthRef.current[activePatternRef.current] >= patternLengthsRef.current[activePatternRef.current]
                ? n
                : n % trackPatternLengthRef.current[activePatternRef.current]
        } else {
            const pattern = patternTrackerRef.current[0];
            const timeb = patternTrackerRef.current[1] ? patternTrackerRef.current[1] : 0;
            const timebbs = Tone.Time(timeb, 's').toBarsBeatsSixteenths();
            const step = n - sixteenthFromBBS(timebbs);
            const patternLocation = step % patternLengthsRef.current[pattern];
            if (!patternLocation) return -1
            result = trackPatternLengthRef.current[pattern] < patternLengthsRef.current[activePatternRef.current]
                ? patternLocation % trackPatternLengthRef.current[pattern]
                : patternLocation;
        };
        return result;
    }, [
        arrangerModeRef,
        patternTrackerRef,
        patternLengthsRef,
        activePatternRef,
        trackPatternLengthRef
    ]
    )

    const noteLock = useCallback((
        note: string,
        velocity: number,
        pattern: number
    ): void => {
        selectedStepsRef.current.forEach(step => {
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
            triggRefs.current[pattern][index].instrument.at(time, event)
            dispatch(setNoteMidi(index, event['note'], velocity, step));
        });

    }, [dispatch, index, triggRefs, eventsRef, selectedStepsRef]);

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
        triggRefs.current[pattern][index].instrument.remove(pastTime);
        dispatch(
            noteInput(
                pattern,
                index,
                step,
                offset,
                noteName,
                velocity
            )
        );
        onHoldNotes.current[noteName] = {
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
        triggRefs,
        eventsRef,
        overrideRef
    ]
    )

    const midiInCallback = useCallback((e: InputEventNoteon) => {
        const noteNumber = e.note.number;
        const noteName = e.note.name + e.note.octave;
        const velocity = e.velocity * 127;
        const time = Date.now() / 1000;

        if (midi.device) {
            dispatch(noteOn([noteNumber], midi.device));
        }

        noteInCallback(noteNumber, noteName, time, velocity)
    }, [midi.device])

    const midiOffCallback = useCallback((e: InputEventNoteoff) => {
        const noteNumber = e.note.number;
        const noteName = e.note.name + e.note.octave;
        if (midi.device) {
            dispatch(noteOff([noteNumber], midi.device))
        }

        noteOffCallback(noteNumber, noteName)
    }, [])



    const noteInCallback = useCallback((noteNumber: number, noteName: string, time: number, velocity?: number) => {
        if (!velocity) velocity = 60
        if (isRecordingRef.current && isPlayingRef.current) {

            // recording playiback logic 
            instrumentRef.current.triggerAttack(noteName, 0, velocity);
            const position = Tone.Transport.position.toString();
            const multiplier = parseFloat("0." + position.split(".")[1]);
            let offset = Math.round(127 * multiplier);
            const pattern = arrangerModeRef.current
                ? activePatternRef.current
                : patternTrackerRef.current[0];
            let step = returnStep(position);
            if (step >= 0) {
                if (
                    eventsRef.current[activePatternRef.current][step + 1]
                    && !eventsRef.current[activePatternRef.current][step + 1]['note']
                ) {
                    step = step + 1
                    offset = 1 - offset;
                }
                setNoteInput(pattern, step, offset, noteName, velocity, time)
            }
        } else if (selectedStepsRef.current.length >= 0 && !isRecordingRef.current) {
            noteLock(noteName, velocity, activePatternRef.current);
        } else {
            instrumentRef.current.triggerAttack(noteName, 0, velocity);
        }
    }, [noteLock,
        setNoteInput,
        activePatternRef,
        arrangerModeRef,
        eventsRef,
        isPlayingRef,
        isRecordingRef,
        patternTrackerRef,
        returnStep,
        selectedStepsRef
    ]
    )


    const noteOffCallback = useCallback((noteNumber: number, noteName: string): void => {
        const noteObj = onHoldNotes.current[noteName];

        if (isRecordingRef.current && isPlayingRef.current) {
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
            triggRefs.current[pattern][index].instrument.at(time, e);
            dispatch(
                setNoteLengthPlayback(
                    noteName,
                    pattern,
                    index,
                    step,
                    length,
                )
            );
            onHoldNotes.current[noteName] = {};
        }
        if (!(selectedStepsRef.current.length > 0) && !isRecordingRef.current) {
            instrumentRef.current.triggerRelease(noteName);
        }
    }, [
        dispatch,
        index,
        triggRefs,
        isPlayingRef,
        isRecordingRef,
        selectedStepsRef,
    ]
    );

    const instrumentKeyDown = useCallback(function dd(this: Document, ev: KeyboardEvent) {
        if (ev.repeat) { return }
        const time = Date.now() / 1000;
        const key = ev.key.toLowerCase()
        if (Object.keys(noteDict).includes(key)) {
            const noteNumber = noteDict[key] + (keyboardRangeRef.current * 12)
            const noteName = numberToNote(noteNumber);
            if (noteNumber < 127) {
                const time = Date.now() / 1000;
                dispatch(noteOn([noteNumber], 'onboardKey'));
                noteInCallback(noteNumber, noteName, time)
            }
        }
    }, [noteDict, keyboardRangeRef])

    const instrumentKeyUp = useCallback(function dd(this: Document, ev: KeyboardEvent) {
        const key = ev.key.toLowerCase()
        if (Object.keys(noteDict).includes(key)) {
            const noteNumber = noteDict[key] + (keyboardRangeRef.current * 12)
            const noteName = numberToNote(noteNumber);
            if (noteNumber < 127) {
                dispatch(noteOff([noteNumber], 'onboardKey'));
                noteOffCallback(noteNumber, noteName)
            }
        }
    }, [dispatch, noteOffCallback])



    const wrapBind = (f: Function, cc: number): (e: InputEventControlchange) => void => {
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
        const f = wrapBind(
            getNested(
                propertyCalculationCallbacks,
                property
            ), cc);
        setNestedValue(CCMaps.current, {
            func: f,
            device: device,
            channel: channel,
            cc: cc,
        })
        if (device && channel) {
            let i = WebMidi.getInputByName(device)
            if (i) {
                i.addListener(
                    'controlchange',
                    channel,
                    f
                );
            }
        }
    }

    const midiLearn = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, property: string) => {
        event.preventDefault()
        let locked = false;
        const mappedProperty = getNested(CCMaps.current, property);
        if (mappedProperty) {
            locked = true;
            let device = WebMidi.getInputByName(mappedProperty.device);
            if (device) {
                device.removeListener(
                    'controlchange',
                    mappedProperty.channel,
                    mappedProperty.func,
                )
                deleteProperty(CCMaps.current, property);
            }
        }
        if (!locked) {
            listenCC.current = (e: InputEventControlchange): void => {
                return bindCCtoParameter(
                    e.target.name,
                    e.channel,
                    e.controller.number,
                    property,
                )
            }
            WebMidi.inputs.forEach(input => {
                if (listenCC.current) {
                    input.addListener(
                        'controlchange',
                        'all',
                        listenCC.current
                    )
                }
            });
        }
    }




    // change instrument logic 
    useEffect(() => {
        instrumentRef.current = returnInstrument(voice, optionsRef.current);
        // toneRefEmitter.emit(
        //     trackEventTypes.CHANGE_INSTRUMENT,
        //     { instrument: instrumentRef.current, trackId: id }
        // );
        if (refsContext && refsContext.current[id].instrument) {
            const chain = refsContext.current[id].chain;
            refsContext.current[id].instrument.disconnect();
            refsContext.current[id].instrument.dispose();
            instrumentRef.current.connect(chain.in);
            refsContext.current[id].instrument = instrumentRef.current;
        }
        Object.keys(triggRefs.current).forEach(key => {
            let keyNumber = parseInt(key);
            triggRefs.current[keyNumber][index].instrument.callback = instrumentCallback;
        });
    }, [
        voice,
        id,
        index,
        triggRefs,
        instrumentCallback,
        optionsRef
    ]);

    // keyboard note/midi input listeners
    useEffect(() => {
        if (midi.channel && midi.device && midi.device !== 'onboardKey') {
            inputRef.current = WebMidi.getInputByName(midi.device);
            if (
                inputRef.current
                && !inputRef.current.hasListener('noteon', midi.channel, midiInCallback)
            ) {
                inputRef.current.addListener('noteon', midi.channel, midiInCallback);
                inputRef.current.addListener('noteoff', midi.channel, midiOffCallback);
            }

            return () => {
                if (inputRef.current
                    && midi.channel
                    && inputRef.current.hasListener('noteon', midi.channel, midiInCallback)
                ) {
                    inputRef.current.removeListener('noteon', midi.channel, midiInCallback);
                    inputRef.current.removeListener('noteoff', midi.channel, midiOffCallback);
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
    }, [])


    // adding instrument to context in first render
    useEffect(() => {
        // talvez pode dar problema pq add instrument vai ser async ?¿
        // e ai quando for colocar o instrumentCallback ainda não vai ter o instrumento no objeto?¿
        // se isso for o caso, passar instrumentCallback pro emissor de evento também (aliás, pq não foi esse o caso?)
        if (firstRender) {
            // console.log('this is the first render, and should be emitting an event')
            // toneRefEmitter.emit(
            //     trackEventTypes.ADD_INSTRUMENT,
            //     { instrument: instrumentRef.current, trackId: id }
            // );

            if (refsContext && !refsContext.current[id].instrument) {
                refsContext.current[id].instrument = instrumentRef.current;
                instrumentRef.current.connect(refsContext.current[id].chain.in);
            }
            Object.keys(triggRefs.current).forEach(key => {
                let k = parseInt(key)
                triggRefs.current[k][index].instrument.callback = instrumentCallback;
            })
            setRender(false);
        }

    }, []);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {/* {properties.map(property => {
                // vai passar () => midiLearn(property) como funcão 
                const [value, r, indicatorType, curve] = getNested(options, property)
                switch (indicatorType) {
                    case indicators.DROPDOWN:
                        return (
                            <Dropdown 
                                property={property} 
                                value={value} 
                                option={r} 
                                calc={accessNested(calcCallback, property)}>
                            </Dropdown>
                            console.log()
                        )
                    case indicators.KNOB:
                        return (
                            <Knob 
                                property={property} 
                                value={value} 
                                range={r} 
                                curve={curve}
                                calc={accessNested(calcCallback, property)}>
                            </Knob>
                            console.log()
                        )
                    case indicators.RADIO:
                        return (
                            <Radio 
                                property={property} 
                                value={value} 
                                option={r} 
                                calc={accessNested(calcCallback, property)}>
                            </Radio>
                            console.log()
                        )
                    case indicators.VERTICAL_SLIDER:
                        return (
                            <VSlider 
                                property={property} 
                                value={value} 
                                option={r} 
                                calc={accessNested(calcCallback, property)}>
                            </VSlider>
                            console.log()
                        )
                };
                return ''
            })} */}
        </div>
    )
}
