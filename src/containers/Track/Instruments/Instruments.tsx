import React, {
    useEffect,
    useRef,
    useMemo,
    useState,
    useContext,
    useCallback
} from 'react';
import {
    propertiesToArray,
    setNestedValue,
    accessNested,
    onlyValues
} from '../../../lib/objectDecompose'
import Tone from '../../../lib/tone';
import triggCtx from '../../../context/triggState';
import toneRefEmitter, { trackEventTypes } from '../../../lib/toneRefsEmitter';
import { InstrumentProps } from './index'
import { instrumentTypes, updateInstrumentState } from '../../../store/Track';
import { useDispatch, useSelector } from 'react-redux';
import { indicators } from '../defaults';
import { RootState } from '../../../App';
import { parameterLock } from '../../../store/Sequencer';
import valueFromCC, { valueFromMouse, optionFromCC } from '../../../lib/curves';
import { timeObjFromEvent, extendObj, typeMovement } from '../../../lib/utility';

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

export const Instruments = <T extends instrumentTypes>({ id, index, midi, voice, maxPolyphony, options }: InstrumentProps<T>) => {

    const dispatch = useDispatch()
    const instrumentRef = useRef(returnInstrument(voice, options));
    const properties: string[] = useMemo(() => propertiesToArray(options), [voice]);
    const optionsRef = useRef(options);
    const triggRefs = useContext(triggCtx);
    const patternTracker = useSelector((state: RootState) => state.arranger.patternTracker);
    const patternTrackerRef = useRef(patternTracker);
    const arrangerMode = useSelector((state: RootState) => state.arranger.mode);
    const arrangerModeRef = useRef(arrangerMode);
    const activePattern = useSelector((state: RootState) => state.sequencer.activePattern);
    const selected = useSelector((state: RootState) => state.sequencer.patterns[activePattern].tracks[index].selected);
    const selectedRef = useRef(selected);
    const events = useSelector((state: RootState) => state.sequencer.patterns[activePattern].tracks[index].events);
    const eventsRef = useRef(events);
    const lockedParamRef = useRef({});
    const [firstRender, setRender] = useState(true);

    let patternVelocities = useSelector(
        (state: RootState) => {
            let o: { [key: number]: number } = {}
            Object.keys(state.sequencer.patterns).forEach(key => {
                let k = parseInt(key);
                o[k] = state.sequencer.patterns[k].tracks[index].velocity;
            });
            return o;
        }
    );

    let patternVelocitiesRef = useRef(patternVelocities);

    let patternNoteLengths = useSelector(
        (state: RootState) => {
            let o: { [key: number]: string | number } = {}
            Object.keys(state.sequencer.patterns).forEach(key => {
                let k = parseInt(key);
                o[k] = state.sequencer.patterns[k].tracks[index].noteLength;
            });
            return o
        }
    );

    let patternNoteLengthsRef = useRef(patternNoteLengths);

    let callbacks: any = useMemo(() => {
        let o = {}
        let callArray = properties.map((property) => {
            return (value: any) => {
                if (accessNested(instrumentRef.current.get(), property)
                    === accessNested(optionsRef.current, property)) {
                    let temp = setNestedValue(property, value)
                    instrumentRef.current.set(temp);
                    dispatch(updateInstrumentState(index, temp));
                };
            }
        });
        callArray.forEach((call, idx, arr) => {
            setNestedValue(properties[idx], call, o);
        });
        return o
    }, [voice]);

    // preciso definir o state should be pra usar dentro dessa callback aqui tambem
    const calcCallbacks: any = useCallback(() => {
        const callArray = properties.map((property) => {
            return (e: any) => {

                const [
                    stateValue,
                    parameterOptions,
                    indicatorType,
                    parameterPayload
                ] = [...accessNested(optionsRef.current, property)]
                const low = parameterOptions[0], high = parameterOptions[1]

                if (selectedRef.current.length >= 1) {

                    for (let step of selectedRef.current) {
                        let data, val;
                        let event = { ...events[step] }
                        const time = timeObjFromEvent(step, event)
                        const trigg = triggRefs.current[activePattern][index]
                        const evp = accessNested(event, property);

                        // parameter lock logic
                        if (
                            indicatorType === indicators.KNOB
                            || indicatorType === indicators.VERTICAL_SLIDER
                            || indicatorType == indicators.HORIZONTAL_SLIDER
                        ) {
                            const currentValue = evp ? evp : stateValue;
                            val = e.controller && e.controler.number
                                ? valueFromCC(e.value, low, high, parameterPayload)
                                : valueFromMouse(
                                    currentValue,
                                    typeMovement(indicatorType, e),
                                    low,
                                    high,
                                    parameterPayload
                                );
                            data = setNestedValue(property, val);
                        } else {
                            val = e.controller && e.controller.number
                                ? optionFromCC(e.value, parameterOptions)
                                : e.target.value
                            if (val !== stateValue) {
                                data = setNestedValue(property, val);
                            }
                        }
                        if (data) {
                            event = extendObj(event, data);
                            trigg.at(time, event);
                            dispatch(parameterLock(activePattern, index, step, data, property));
                        }
                    }
                } else {
                    // no steps selected logic
                    if (
                        indicatorType === indicators.KNOB
                        || indicatorType === indicators.VERTICAL_SLIDER
                        || indicatorType == indicators.HORIZONTAL_SLIDER
                    ) {
                        if (
                            stateValue
                            === accessNested(
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
    }, [voice]);

    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    useEffect(() => {
        patternNoteLengthsRef.current = patternNoteLengths;
    }, [patternNoteLengths]);

    useEffect(() => {
        patternVelocitiesRef.current = patternVelocities
    }, [patternVelocities]);

    useEffect(() => {
        selectedRef.current = selected;
    }, [selected]);

    useEffect(() => {
        eventsRef.current = events;
    }, [events]);

    useEffect(() => {
        arrangerModeRef.current = arrangerMode;
    }, [arrangerMode]);

    useEffect(() => {
        instrumentRef.current = returnInstrument(voice, options);
        toneRefEmitter.emit(
            trackEventTypes.CHANGE_INSTRUMENT,
            { instrument: instrumentRef.current, trackId: id }
        );
        Object.keys(triggRefs.current).forEach(key => {
            let k = parseInt(key);
            triggRefs.current[k][index].callback = instrumentCallback;
        });
    }, [voice]);

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
    }, []);

    const instrumentCallback = (time: number, value: any) => {
        let velocity: number = value.velocity
            ? value.velocity
            : arrangerModeRef.current === "pattern"
                ? patternVelocitiesRef.current[activePattern]
                : patternVelocitiesRef.current[patternTrackerRef.current[0]]
        let length: string | number = value.length
            ? value.length
            : arrangerModeRef.current === "pattern"
                ? patternNoteLengthsRef.current[activePattern]
                : patternNoteLengthsRef.current[patternTrackerRef.current[0]]
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
            let curr = accessNested(optionsRef.current, property);
            let val = accessNested(value, property);
            let lock = accessNested(lockedParamRef.current, property);
            if (val && val !== curr[0]) {
                callbacks[property](val);
                setNestedValue(property, val, lockedParamRef.current);

            } else if (!val && lock && curr[0] !== lock) {
                callbacks[property](lock);
                setNestedValue(property, undefined, lockedParamRef.current)
            }
        });
    };

    return (
        <div>
            {properties.map(property => {
                switch (accessNested(options, property)[2]) {
                    case indicators.DROPDOWN:
                        // return a JSX dropdown with classes as property name and instrument type
                        break;
                    case indicators.KNOB:
                        // return a JSX knob with classes as property name and instrument type
                        break;
                    case indicators.RADIO:
                    // return a JSX radio with classes as property name and instrument type
                    case indicators.VERTICAL_SLIDER:
                    // return a JSX slider with classes as property name and instrument type
                };
            })}
        </div>
    )
}