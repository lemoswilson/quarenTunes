import React, {
    useEffect,
    useRef,
    useMemo,
    useState,
    useContext,
    useCallback,
    MouseEvent, MutableRefObject
} from 'react';
import {
    propertiesToArray,
    setNestedValue,
    getNested,
    onlyValues, deleteProperty, copyToNew
} from '../../../lib/objectDecompose'
import Tone from '../../../lib/tone';
import triggCtx from '../../../context/triggState';
import toneRefEmitter, { trackEventTypes } from '../../../lib/toneRefsEmitter';
import WebMidi, {
    InputEventNoteoff,
    InputEventNoteon,
    Input,
    InputEventControlchange
} from 'webmidi';
import { InstrumentProps, initials } from './index'
import { instrumentTypes, updateInstrumentState } from '../../../store/Track';
import { useDispatch, useSelector } from 'react-redux';
import { getInitials, indicators } from '../defaults';
import { RootState } from '../../Xolombrisx';
import {
    parameterLock,
    setNoteMidi,
    noteInput,
    setNoteLengthPlayback
} from '../../../store/Sequencer';
import valueFromCC, { valueFromMouse, optionFromCC } from '../../../lib/curves';
import { timeObjFromEvent, extendObj, typeMovement } from '../../../lib/utility';
import { sixteenthFromBBS } from '../../Arranger';
import usePrevious from '../../../hooks/usePrevious';
import { useProperty } from '../../../hooks/useProperty';
import useQuickRef from '../../../hooks/useQuickRef';
import { eventOptions, initialsArray } from './types';

export const returnInstrument = (voice: instrumentTypes, opt: initialsArray) => {
    let options = onlyValues(opt);

    switch (voice) {
        case instrumentTypes.AMSYNTH:
            return new Tone.PolySynth(Tone.AMSynth, options);
        case instrumentTypes.FMSYNTH:
            return new Tone.PolySynth(Tone.FMSynth, options);
        case instrumentTypes.MEMBRANESYNTH:
            return new Tone.PolySynth(Tone.MembraneSynth, options);
        case instrumentTypes.METALSYNTH:
            return new Tone.PolySynth(Tone.MetalSynth, options);
        case instrumentTypes.NOISESYNTH:
            return new Tone.NoiseSynth(options);
        case instrumentTypes.PLUCKSYNTH:
            return new Tone.PluckSynth(options);
        default:
            return new Tone.Sampler();
    }
}

export type controlChangeEvent = (e: InputEventControlchange) => void;

export const Instrument = <T extends instrumentTypes>({ id, index, midi, voice, maxPolyphony, options, dummy }: InstrumentProps<T>) => {

    const dispatch = useDispatch()
    const instrumentRef = useRef(returnInstrument(voice, options));
    const properties: string[] = useMemo(() => propertiesToArray(getInitials(voice)), [voice]);
    const CCMaps = useRef<any>({});
    const listenCC = useRef<controlChangeEvent>();
    const inputRef = useRef<false | Input>(false);
    // const previousMidi = usePrevious(midi);
    const triggRefs = useContext(triggCtx);
    const patTracker = useSelector((state: RootState) => state.arranger.present.patternTracker);
    const arrMode = useSelector((state: RootState) => state.arranger.present.mode);
    const actPat = useSelector((state: RootState) => state.sequencer.present.activePattern);
    const selSteps = useSelector((state: RootState) => state.sequencer.present.patterns[actPat].tracks[index].selected);
    const lockedParameters: MutableRefObject<initials> = useRef({});
    const ovr = useSelector((state: RootState) => state.sequencer.present.override);
    const isRecording = useSelector((state: RootState) => state.transport.present.recording);
    const isPlaying = useSelector((state: RootState) => state.transport.present.isPlaying);
    const previousPlaying = usePrevious(isPlaying);
    const onHoldNotes = useRef<{ [key: string]: any }>({});
    const [firstRender, setRender] = useState(true);

    // const override = useQuickRef(ovr);
    const override = useRef(ovr);
    useEffect(() => { override.current = ovr }, [ovr])
    // const optionsRef = useQuickRef(options)
    const optionsRef = useRef(options);
    useEffect(() => { optionsRef.current = options }, [options])
    // const indexRef = useQuickRef(index);
    const indexRef = useRef(index);
    useEffect(() => { indexRef.current = index }, [index])
    // const patternTracker = useQuickRef(patTracker);
    const patternTracker = useRef(patTracker);
    useEffect(() => { patternTracker.current = patTracker }, [patTracker])
    // const arrangerMode = useQuickRef(arrMode);
    const arrangerMode = useRef(arrMode);
    useEffect(() => { arrangerMode.current = arrMode }, [arrMode])
    // const activePattern = useQuickRef(actPat)
    const activePattern = useRef(actPat);
    useEffect(() => { activePattern.current = actPat }, [actPat]);
    // const selectedSteps = useQuickRef(selSteps);
    const selectedSteps = useRef(selSteps);
    useEffect(() => { selectedSteps.current = selSteps }, [selSteps])
    // const isRec = useQuickRef(isRecording);
    const isRec = useRef(isRecording);
    useEffect(() => { isRec.current = isRecording }, [isRecording])
    // const isPlay = useQuickRef(isPlaying);
    const isPlay = useRef(isPlaying);
    useEffect(() => { isPlay.current = isPlaying }, [isPlaying])

    const patternVelos = useSelector(
        (state: RootState) => {
            let o: { [key: number]: number } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].tracks[index].velocity
            });
            return o;
        }
    );

    // const patternVelocities = useQuickRef(patternVelos);
    const patternVelocities = useRef(patternVelos);
    useEffect(() => { patternVelocities.current = patternVelos }, [patternVelos])

    const patNoteLen = useSelector(
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
    // const patternNoteLens = useQuickRef(patNoteLen);
    const patternNoteLens = useRef(patNoteLen);
    useEffect(() => { patternNoteLens.current = patNoteLen }, [patNoteLen])

    const patLen = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].patternLength
            });
            return o;
        }
    );
    // const patternLengths = useQuickRef(patLen);
    const patternLengths = useRef(patLen);
    useEffect(() => { patternLengths.current = patLen }, [patLen])

    const trkPatLen = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].tracks[index].length
            });
            return o;
        }
    );
    // const trackPatternLength = useQuickRef(trkPatLen);
    const trackPatternLength = useRef(trkPatLen);
    useEffect(() => { trackPatternLength.current = trkPatLen }, [trkPatLen])

    const ev = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].tracks[index].events
            });
            return o;
        }
    );
    // const events = useQuickRef(ev);
    const events = useRef(ev);
    useEffect(() => { events.current = ev }, [ev])

    const propertyUpdate: any = useMemo(() => {
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
    const calcCallbacks: any = useMemo(() => {
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

                if (selectedSteps.current.length >= 1) {

                    for (let step of selectedSteps.current) {
                        let data, propVal;
                        let event = { ...events.current[activePattern.current][step] }
                        const time = timeObjFromEvent(step, event)
                        const trigg = triggRefs.current[activePattern.current][indexRef.current].instrument
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
                                    activePattern.current,
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
        activePattern,
        events,
        indexRef,
        optionsRef,
        selectedSteps,
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
            let p = propertiesToArray(lockedParameters.current);
            p.forEach((property) => {
                const d = copyToNew(lockedParameters.current, property)
                // instrumentRef.current.set(d);
                dispatch(updateInstrumentState(index, d));
            });
        }
        isPlay.current = isPlaying;
    }, [
        isPlaying,
        dispatch,
        index,
        previousPlaying,
        isPlay
    ]
    );

    // const instrumentCallback = useCallback((time: number, value: any) => {
    const instrumentCallback = useCallback((time: number, value: eventOptions) => {
        let velocity: number = value.velocity
            ? value.velocity
            : arrangerMode.current === "pattern"
                ? patternVelocities.current[activePattern.current]
                : patternVelocities.current[patternTracker.current[0]]
        let length: string | number = value.length
            ? value.length
            : arrangerMode.current === "pattern"
                ? patternNoteLens.current[activePattern.current]
                : patternNoteLens.current[patternTracker.current[0]]
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

        const p = propertiesToArray(value);

        p.forEach(property => {
            if (
                property !== 'velocity'
                && property !== 'length'
                && property !== 'note'
            ) {
                const currVal = getNested(optionsRef.current, property);
                const callbackVal = getNested(value, property);
                const lockVal = getNested(lockedParameters.current, property);
                if (callbackVal && callbackVal !== currVal[0]) {
                    propertyUpdate[property](callbackVal);
                    setNestedValue(property, callbackVal, lockedParameters);
                } else if (!callbackVal && lockVal && currVal[0] !== lockVal) {
                    propertyUpdate[property](lockVal);
                    deleteProperty(lockedParameters.current, property);
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
        propertyUpdate,
        activePattern,
        arrangerMode,
        optionsRef,
        patternNoteLens,
        patternTracker,
        patternVelocities,
    ]
    );

    const returnStep = useCallback((t: string): number => {
        let result;
        const n = sixteenthFromBBS(t)
        if (arrangerMode.current === "pattern") {
            result = trackPatternLength.current[activePattern.current] >= patternLengths.current[activePattern.current]
                ? n
                : n % trackPatternLength.current[activePattern.current]
        } else {
            const pattern = patternTracker.current[0];
            const timeb = patternTracker.current[1] ? patternTracker.current[1] : 0;
            const timebbs = Tone.Time(timeb, 's').toBarsBeatsSixteenths();
            const step = n - sixteenthFromBBS(timebbs);
            const patternLocation = step % patternLengths.current[pattern];
            if (!patternLocation) return -1
            result = trackPatternLength.current[pattern] < patternLengths.current[activePattern.current]
                ? patternLocation % trackPatternLength.current[pattern]
                : patternLocation;
        };
        return result;
    }, [
        arrangerMode,
        patternTracker,
        patternLengths,
        activePattern,
        trackPatternLength
    ]
    )

    const noteLock = useCallback((
        note: string,
        velocity: number,
        pattern: number
    ): void => {
        selectedSteps.current.forEach(step => {
            const event = {
                ...events.current[pattern][step],
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

    }, [dispatch, index, triggRefs, events, selectedSteps]);

    const setNoteInput = useCallback((
        pattern: number,
        step: number,
        offset: number,
        noteName: string,
        velocity: number,
        time: number,
    ): void => {
        const e = {
            ...events.current[pattern][step],
            note: []
        };
        const pastTime = timeObjFromEvent(step, e);
        e.offset = offset;
        e.velocity = velocity;
        if (override.current) {
            e.note = [noteName];
        } else if (!override && !e.note.includes(noteName)) {
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
        events,
        override
    ]
    )

    const noteInCallback = useCallback((e: InputEventNoteon) => {
        const noteName = e.note.name + e.note.octave;
        const time = Date.now() / 1000;
        const velocity = e.velocity * 127;
        if (isRec.current && isPlay.current) {

            // recording playiback logic 
            instrumentRef.current.triggerAttack(noteName, 0, velocity);
            const position = Tone.Transport.position.toString();
            const multiplier = parseFloat("0." + position.split(".")[1]);
            let offset = Math.round(127 * multiplier);
            const pattern = arrangerMode.current
                ? activePattern.current
                : patternTracker.current[0];
            let step = returnStep(position);
            if (step >= 0) {
                if (
                    events.current[activePattern.current][step + 1]
                    && !events.current[activePattern.current][step + 1]['note']
                ) {
                    step = step + 1
                    offset = 1 - offset;
                }
                setNoteInput(pattern, step, offset, noteName, velocity, time)
            }
        } else if (selectedSteps.current.length >= 0 && !isRec.current) {
            noteLock(noteName, velocity, activePattern.current);
        } else {
            instrumentRef.current.triggerAttack(noteName, 0, velocity);
        }
    }, [noteLock,
        setNoteInput,
        activePattern,
        arrangerMode,
        events,
        isPlay,
        isRec,
        patternTracker,
        returnStep,
        selectedSteps
    ]
    )


    const noteOffCallback = useCallback((e: InputEventNoteoff): void => {
        const noteName = e.note.name + e.note.octave;
        const noteObj = onHoldNotes.current[noteName];
        if (isRec.current && isPlay.current) {
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
        if (!(selectedSteps.current.length > 0) && !isRec.current) {
            instrumentRef.current.triggerRelease(noteName);
        }
    }, [
        dispatch,
        index,
        triggRefs,
        isPlay,
        isRec,
        selectedSteps,
    ]
    );

    useEffect(() => {
        instrumentRef.current = returnInstrument(voice, optionsRef.current);
        toneRefEmitter.emit(
            trackEventTypes.CHANGE_INSTRUMENT,
            { instrument: instrumentRef.current, trackId: id }
        );
        Object.keys(triggRefs.current).forEach(key => {
            let k = parseInt(key);
            triggRefs.current[k][index].instrument.callback = instrumentCallback;
        });
    }, [
        voice,
        id,
        index,
        triggRefs,
        instrumentCallback,
        optionsRef
    ]);

    useEffect(() => {
        if (midi.channel && midi.device) {
            inputRef.current = WebMidi.getInputByName(midi.device);
            if (
                inputRef.current
                && !inputRef.current.hasListener('noteon', midi.channel, noteInCallback)
            ) {
                inputRef.current.addListener('noteon', midi.channel, noteInCallback);
                inputRef.current.addListener('noteoff', midi.channel, noteOffCallback);
            }

            return () => {
                if (inputRef.current
                    && midi.channel
                    && inputRef.current.hasListener('noteon', midi.channel, noteInCallback)
                ) {
                    inputRef.current.removeListener('noteon', midi.channel, noteInCallback);
                    inputRef.current.removeListener('noteon', midi.channel, noteInCallback);
                }
            }
        }
    }, [])

    useEffect(() => {
        if (firstRender) {
            toneRefEmitter.emit(
                trackEventTypes.ADD_INSTRUMENT,
                { instrument: instrumentRef.current, trackId: id }
            );
            Object.keys(triggRefs.current).forEach(key => {
                let k = parseInt(key)
                triggRefs.current[k][index].instrument.callback = instrumentCallback;
            })
            setRender(false);
        }
    }, []);

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
                calcCallbacks,
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

    const midiLearn = (property: string) => {
        let locked = false;
        const p = getNested(CCMaps.current, property);
        if (p) {
            locked = true;
            let device = WebMidi.getInputByName(p.device);
            if (device) {
                device.removeListener(
                    'controlchange',
                    p.channel,
                    p.func,
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


    return (
        <div>
            {properties.map(property => {
                // vai passar () => midiLearn(property) como funcão 
                const [value, r, indicatorType, curve] = getNested(options, property)
                switch (indicatorType) {
                    case indicators.DROPDOWN:
                        return (
                            // <Dropdown 
                            //     property={property} 
                            //     value={value} 
                            //     option={r} 
                            //     calc={accessNested(calcCallback, property)}>
                            // </Dropdown>
                            console.log()
                        )
                    case indicators.KNOB:
                        return (
                            // <Knob 
                            //     property={property} 
                            //     value={value} 
                            //     range={r} 
                            //     curve={curve}
                            //     calc={accessNested(calcCallback, property)}>
                            // </Knob>
                            console.log()
                        )
                    case indicators.RADIO:
                        return (
                            // <Radio 
                            //     property={property} 
                            //     value={value} 
                            //     option={r} 
                            //     calc={accessNested(calcCallback, property)}>
                            // </Radio>
                            console.log()
                        )
                    case indicators.VERTICAL_SLIDER:
                        return (
                            // <VSlider 
                            //     property={property} 
                            //     value={value} 
                            //     option={r} 
                            //     calc={accessNested(calcCallback, property)}>
                            // </VSlider>
                            console.log()
                        )

                };
                return ''
            })}
        </div>
    )
}
