import deep_diff from 'deep-diff';
import React, {
    useEffect,
    useRef,
    useMemo,
    useState,
    useContext,
    useCallback,
} from 'react';
import {
    propertiesToArray,
    setNestedValue,
    getNested,
    onlyValues,
    deleteProperty,
    copyToNew,
    definedPropertiesToArray,
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
import { InstrumentProps, RecursiveFunction } from './index'
import { instrumentTypes, updateInstrumentState } from '../../../store/Track';
import { useDispatch, useSelector } from 'react-redux';
import { getInitials, indicators, instrumentOptions } from '../defaults';
import { RootState } from '../../../App';
import {
    parameterLock,
    setNoteMidi,
    noteInput,
    setNoteLengthPlayback
} from '../../../store/Sequencer';
import valueFromCC, { valueFromMouse, optionFromCC } from '../../../lib/curves';
import { useProperty } from '../../../hooks/useProperty';
import { timeObjFromEvent, extendObj, typeMovement } from '../../../lib/utility';
import { sixteenthFromBBS } from '../../Arranger';
import usePrevious from '../../../hooks/usePrevious';
import { newProps } from './types';

const returnInstrument = (voice: instrumentTypes, opt: any) => {
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

type controlChangeEvent = (e: InputEventControlchange) => void;

// export const Instruments = <T extends instrumentTypes>({ id, index, midi, voice, maxPolyphony, options, dummy }: InstrumentProps<T>) => {
export const DummyInstrument = <T extends instrumentTypes>({
    id,
    index,
    midi,
    voice,
    maxPolyphony,
    dummy,
    attack,
    attackNoise,
    baseUrl,
    curve,
    dampening,
    detune,
    envelope,
    harmonicity,
    modulation,
    modulationEnvelope,
    modulationIndex,
    noise,
    octaves,
    oscillator,
    pitchDecay,
    portamento,
    release,
    resonance,
    urls,
    volume,
}: newProps) => {




    const dispatch = useDispatch()
    const packed = {
        attack,
        attackNoise,
        baseUrl,
        curve,
        dampening,
        detune,
        envelope,
        harmonicity,
        modulation,
        modulationEnvelope,
        modulationIndex,
        noise,
        octaves,
        oscillator,
        pitchDecay,
        portamento,
        release,
        resonance,
        urls,
        volume,
    }
    const instrumentRef = useRef(returnInstrument(voice, packed));

    const properties: string[] = useMemo(() => definedPropertiesToArray({ ...packed }), [voice]);

    const optionsRef = useRef(packed);
    const indexRef = useRef(index);
    const CCMaps = useRef<any>({});
    const listenCC = useRef<controlChangeEvent>();
    const inputRef = useRef<false | Input>(false);
    const previousMidi = usePrevious(midi);
    const triggRefs = useContext(triggCtx);
    const patTracker = useSelector((state: RootState) => state.arranger.patternTracker);
    const patternTracker = useRef(patTracker);
    const arrMode = useSelector((state: RootState) => state.arranger.mode);
    const arrangerMode = useRef(arrMode);
    const actPat = useSelector((state: RootState) => state.sequencer.activePattern);
    const activePattern = useRef(actPat);
    const selSteps = useSelector((state: RootState) => state.sequencer.patterns[actPat].tracks[index].selected);
    const selectedSteps = useRef(selSteps);
    const lockedParameters = useRef({});
    const ovr = useSelector((state: RootState) => state.sequencer.override);
    const override = useRef(ovr);
    const isRecording = useSelector((state: RootState) => state.transport.recording);
    const isRec = useRef(isRecording);
    const isPlaying = useSelector((state: RootState) => state.transport.isPlaying);
    const isPlay = useRef(isPlaying);
    const onHoldNotes = useRef<{ [key: string]: any }>({});
    const [firstRender, setRender] = useState(true);

    // const harmonicity = options.harmonicity ? options.harmonicity[0] : undefined
    // const volume = options.volume ? options.volume[0] : undefined

    const patternVelos = useSelector(
        (state: RootState) => {
            let o: { [key: number]: number } = {}
            Object.keys(state.sequencer.patterns).forEach(key => {
                let k = parseInt(key);
                o[k] = state.sequencer.patterns[k].tracks[index].velocity;
            });
            return o;
        }
    );
    const patternVelocities = useRef(patternVelos);

    const patNoteLen = useSelector(
        (state: RootState) => {
            let o: { [key: number]: string | number } = {}
            Object.keys(state.sequencer.patterns).forEach(key => {
                let k = parseInt(key);
                o[k] = state.sequencer.patterns[k].tracks[index].noteLength;
            });
            return o
        }
    );
    const patternNoteLens = useRef(patNoteLen);

    const patLen = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.patterns).forEach(key => {
                let k = parseInt(key);
                o[k] = state.sequencer.patterns[k].patternLength;
            });
            return o;
        }
    );
    const patternLengths = useRef(patLen);

    const trkPatLen = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.patterns).forEach(key => {
                let k = parseInt(key);
                o[k] = state.sequencer.patterns[k].tracks[index].length;
            });
            return o;
        }
    );
    const trackPatternLength = useRef(trkPatLen);

    const ev = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.patterns).forEach(key => {
                let k = parseInt(key);
                o[k] = state.sequencer.patterns[k].tracks[index].events;
            });
            return o;
        }
    );
    const events = useRef(ev);

    const propertyUpdate: any = useMemo(() => {
        let o: RecursiveFunction<typeof packed> = {}
        let callArray = properties.map((property) => {
            return (value: any) => {
                // console.log(accessNested(instrumentRef.current.get(), property))
                // console.log(accessNested(optionsRef.current, property));
                if (getNested(instrumentRef.current.get(), property)
                    === getNested(optionsRef.current, property)[0]) {
                    // console.log('[instruments.tsx]: property updating', property, 'value', value);
                    let temp = setNestedValue(property, value)
                    instrumentRef.current.set(temp);
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
        properties
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

                if (selectedSteps.current.length >= 1) {

                    for (let step of selectedSteps.current) {
                        let data, propVal;
                        let event = { ...events.current[activePattern.current][step] }
                        const time = timeObjFromEvent(step, event)
                        const trigg = triggRefs.current[activePattern.current][indexRef.current]
                        const evp = getNested(event, property);

                        // parameter lock logic
                        if (
                            indicatorType === indicators.KNOB
                            || indicatorType === indicators.VERTICAL_SLIDER
                            || indicatorType === indicators.HORIZONTAL_SLIDER
                        ) {
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
                            event = extendObj(event, data);
                            trigg.at(time, event);
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

                    if (
                        indicatorType === indicators.KNOB
                        || indicatorType === indicators.VERTICAL_SLIDER
                        || indicatorType === indicators.HORIZONTAL_SLIDER
                    ) {
                        if (
                            stateValue
                            === getNested(
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
                            instrumentRef.current.set(setNestedValue(property, val))
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
                            instrumentRef.current.set(data);
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
        index,
        properties,
        triggRefs
    ]);


    // values that are used inside a tone schedule callback 
    // are all in a reference in order to avoid closure values
    // being used wrongly 

    useEffect(() => { optionsRef.current = packed; }, [packed]);
    useEffect(() => { indexRef.current = index; }, [index]);
    useEffect(() => { patternNoteLens.current = patNoteLen; }, [patNoteLen]);
    useEffect(() => { events.current = ev; }, [ev]);
    useEffect(() => { patternVelocities.current = patternVelos }, [patternVelos]);
    useEffect(() => { trackPatternLength.current = trkPatLen; }, [trkPatLen]);
    useEffect(() => { activePattern.current = actPat; }, [actPat]);
    useEffect(() => { selectedSteps.current = selSteps; }, [selSteps]);
    useEffect(() => { isRec.current = isRecording; }, [isRecording]);
    useEffect(() => { patternLengths.current = patLen; }, [patLen]);
    useEffect(() => { arrangerMode.current = arrMode; }, [arrMode]);
    useEffect(() => { override.current = ovr }, [ovr]);

    useEffect(() => {
        if (!isPlaying) {
            let p = propertiesToArray(lockedParameters.current);
            p.forEach((property) => {
                const d = copyToNew(lockedParameters.current, property)
                instrumentRef.current.set(d);
                dispatch(updateInstrumentState(index, d));
            });
        }
        isPlay.current = isPlaying;
    }, [isPlaying, dispatch, index]);

    const instrumentCallback = useCallback((time: number, value: any) => {
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

        // parameter lock
        properties.forEach(property => {
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
        });
    }, [properties, propertyUpdate]);

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
            triggRefs.current[pattern][index].at(time, event)
            dispatch(setNoteMidi(index, event['note'], velocity, step));
        });

    }, [dispatch, index, triggRefs])

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
        triggRefs.current[pattern][index].remove(pastTime);
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
    }, [dispatch, index, triggRefs])

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
    }, [noteLock, setNoteInput])


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
            triggRefs.current[pattern][index].at(time, e);
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
    }, [dispatch, index, triggRefs]);

    useEffect(() => {
        instrumentRef.current = returnInstrument(voice, optionsRef.current);
        toneRefEmitter.emit(
            trackEventTypes.CHANGE_INSTRUMENT,
            { instrument: instrumentRef.current, trackId: id }
        );
        Object.keys(triggRefs.current).forEach(key => {
            let k = parseInt(key);
            triggRefs.current[k][index].callback = instrumentCallback;
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
            if (JSON.stringify(midi) !== JSON.stringify(previousMidi)) {
                let inputPrev = previousMidi.device
                    ? WebMidi.getInputByName(previousMidi.device)
                    : undefined;
                if (
                    inputPrev
                    && previousMidi.device
                    && previousMidi.channel
                ) {
                    inputPrev.removeListener(
                        'noteon',
                        previousMidi.channel,
                        noteInCallback
                    );
                    inputPrev.removeListener(
                        'noteoff',
                        previousMidi.channel,
                        noteOffCallback
                    );
                }
                if (
                    inputRef.current
                    && !inputRef.current.hasListener(
                        'noteon',
                        midi.channel,
                        noteInCallback
                    )
                ) {
                    inputRef.current.addListener(
                        'noteon',
                        midi.channel,
                        noteInCallback
                    );
                    inputRef.current.addListener(
                        'noteoff',
                        midi.channel,
                        noteOffCallback
                    );
                }
            }
        }
    }, [
        midi,
        noteInCallback,
        noteOffCallback,
        previousMidi
    ])

    useEffect(() => {
        if (firstRender) {
            toneRefEmitter.emit(
                trackEventTypes.ADD_INSTRUMENT,
                { instrument: instrumentRef.current, trackId: id }
            );
            Object.keys(triggRefs.current).forEach(key => {
                let k = parseInt(key)
                triggRefs.current[k][index].callback = instrumentCallback;
            })
            setRender(false);
        }
    });

    useEffect(() => { console.log('options changed') }, [packed])
    useProperty(instrumentRef, harmonicity, 'harmonicity');
    useProperty(instrumentRef, attack, 'attack');
    useProperty(instrumentRef, attackNoise, 'attackNoise');
    useProperty(instrumentRef, curve, 'curve');
    useProperty(instrumentRef, dampening, 'dampening');
    useProperty(instrumentRef, detune, 'detune');
    useProperty(instrumentRef, envelope, 'envelope', true);
    useProperty(instrumentRef, modulation, 'modulation', true);
    useProperty(instrumentRef, modulationEnvelope, 'modulationEnvelope', true);
    useProperty(instrumentRef, noise, 'noise', true);
    useProperty(instrumentRef, octaves, 'octaves');
    useProperty(instrumentRef, pitchDecay, 'pitchDecay');
    useProperty(instrumentRef, oscillator, 'oscillator', true);
    useProperty(instrumentRef, modulationIndex, 'modulationIndex')
    useProperty(instrumentRef, portamento, 'portamento');
    useProperty(instrumentRef, resonance, 'resonance');
    useProperty(instrumentRef, volume, 'volume')


    useEffect(() => {
        if (volume) {
            let v = { resonance: getNested(packed, 'volume')[0] };
            instrumentRef.current.set(v);
        }
    }, [volume])

    const returnStep = (t: string): number => {
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
    }
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
        if (inputRef.current) {
            inputRef.current.addListener(
                'controlchange',
                channel,
                f
            );
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

    const setHarmonicity = () => {
        propertyUpdate['harmonicity'](4)
    };

    const logHarm = () => {
        console.log(getNested(instrumentRef.current.get(), 'harmonicity'))
    }

    return (
        <div>
            {properties.map(property => {
                // vai passar () => midiLearn(property) como funcão 
                switch (getNested(packed, property)[2]) {
                    case indicators.DROPDOWN:
                        // return a JSX dropdown with classes as property name and instrument type
                        break;
                    case indicators.KNOB:
                        // return a JSX knob with classes as property name and instrument type
                        break;
                    case indicators.RADIO:
                        // return a JSX radio with classes as property name and instrument type
                        break;
                    case indicators.VERTICAL_SLIDER:
                        // return a JSX slider with classes as property name and instrument type
                        break;
                };
            })}

            <h1>harmonicity {harmonicity ? harmonicity[0] : null}</h1>
            <h1>dummy {dummy}</h1>
            {/* <h1>properties</h1> */}
            {/* { properties.map(v => <h1>{v}</h1>)} */}
            {/* {propertiesToArray(propertyUpdate).map(k => <h1>{k}</h1>)} */}
            {}
            <button onClick={setHarmonicity}></button>
            <button onClick={logHarm}></button>
        </div>
    )
}

export default DummyInstrument;