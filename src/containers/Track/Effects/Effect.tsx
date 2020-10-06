import React, { useRef, useMemo, useContext, MutableRefObject, useState, useEffect, useCallback } from 'react';
import { indicators } from '../defaults'
import valueFromCC, { optionFromCC, valueFromMouse } from '../../../lib/curves';
import WebMidi, { InputEventControlchange, Input } from 'webmidi';
import { parameterLockEffect } from '../../../store/Sequencer/actions'
import { onlyValues, propertiesToArray, getNested, setNestedValue, copyToNew, deleteProperty } from '../../../lib/objectDecompose';
import { effectTypes } from '../../../store/Track';
import { sixteenthFromBBS } from '../../Arranger'
import { timeObjFromEvent, typeMovement } from '../../../lib/utility';
import { effectsInitials, effectsInitialsArray } from '../Instruments';
import toneRefEmitter, { trackEventTypes } from '../../../lib/toneRefsEmitter';
import Tone from '../../../lib/tone'
import usePrevious from '../../../hooks/usePrevious';
import useQuickRef from '../../../hooks/useQuickRef';
import { updateEffectState } from '../../../store/Track/actions'
import { controlChangeEvent } from '../Instruments'
import { effectsProps } from './types';
import { RootState } from '../../../App';
import { useDispatch, useSelector } from 'react-redux';
import { getEffectsInitials } from '../defaults';
import triggContext from '../../../context/triggState';
import { useEffectProperty } from '../../../hooks/useProperty';
import webmidi from 'webmidi';

export const returnEffect = (type: effectTypes, opt: effectsInitialsArray) => {
    let options = onlyValues(opt);

    switch (type) {
        case effectTypes.AUTOFILTER:
            return new Tone.AutoFilter(options);
        case effectTypes.AUTOPANNER:
            return new Tone.AutoPanner(options);
        case effectTypes.BITCRUSHER:
            return new Tone.BitCrusher(options);
        case effectTypes.CHEBYSHEV:
            return new Tone.Chebyshev(options);
        case effectTypes.CHORUS:
            return new Tone.Chorus(options);
        case effectTypes.COMPRESSOR:
            return new Tone.Compressor(options);
        case effectTypes.DISTORTION:
            return new Tone.Distortion(options);
        case effectTypes.EQ3:
            return new Tone.EQ3(options);
        case effectTypes.FEEDBACKDELAY:
            return new Tone.FeedbackDelay(options);
        case effectTypes.FILTER:
            return new Tone.Filter(options);
        case effectTypes.FREEVERB:
            return new Tone.Freeverb(options);
        case effectTypes.FREQUENCYSHIFTER:
            return new Tone.FrequencyShifter(options);
        case effectTypes.GATE:
            return new Tone.Gate(options);
        case effectTypes.JCREVERB:
            return new Tone.JCReverb(options);
        case effectTypes.LIMITER:
            return new Tone.Limiter(options);
        case effectTypes.MULTIBANDCOMPRESSOR:
            return new Tone.MultibandCompressor(options);
        case effectTypes.PHASER:
            return new Tone.Phaser(options)
        case effectTypes.PINGPONGDELAY:
            return new Tone.PingPongDelay(options)
        case effectTypes.PITCHSHIFT:
            return new Tone.PitchShift(options)
        case effectTypes.STEREOWIDENER:
            return new Tone.StereoWidener(options)
        case effectTypes.TREMOLO:
            return new Tone.Tremolo(options)
        case effectTypes.VIBRATO:
            return new Tone.Vibrato(options)
        default:
            return new Tone.Vibrato(options)
    }
}

const Effect: React.FC<effectsProps> = ({ id, index, midi, options, type, track, trackId }) => {
    const dispatch = useDispatch();
    const effectRef = useRef(returnEffect(type, options))
    const properties = useMemo(() => propertiesToArray(getEffectsInitials(type)), [type]);
    const CCMaps = useRef<any>({});
    const listenCC = useRef<controlChangeEvent>();
    const triggRefs = useContext(triggContext);
    const patTracker = useSelector((state: RootState) => state.arranger.present.patternTracker);
    const arrMode = useSelector((state: RootState) => state.arranger.present.mode);
    const actPat = useSelector((state: RootState) => state.sequencer.present.activePattern);
    const selSteps = useSelector((state: RootState) => state.sequencer.present.patterns[actPat].tracks[index].selected);
    const lockedParameters: MutableRefObject<effectsInitials> = useRef({});
    const inputRef = useRef<false | Input>(false);
    // const ovr = useSelector((state: RootState) => state.sequencer.override);
    const isRecording = useSelector((state: RootState) => state.transport.present.recording);
    const isPlaying = useSelector((state: RootState) => state.transport.present.isPlaying);
    const previousPlaying = usePrevious(isPlaying);
    const [firstRender, setRender] = useState(true);

    // const optionsRef = useQuickRef(options)
    const optionsRef = useRef(options)
    useEffect(() => { optionsRef.current = options }, [options])
    // const indexRef = useQuickRef(index);
    const indexRef = useRef(index);
    useEffect(() => { indexRef.current = index }, [index]);
    // const patternTracker = useQuickRef(patTracker);
    const patternTracker = useRef(patTracker);
    useEffect(() => { patternTracker.current = patTracker }, [patTracker]);
    // const arrangerMode = useQuickRef(arrMode);
    const arrangerMode = useRef(arrMode);
    useEffect(() => { arrangerMode.current = arrMode }, [arrMode]);
    // const activePattern = useQuickRef(actPat);
    const activePattern = useRef(actPat);
    useEffect(() => { activePattern.current = actPat }, [actPat]);
    // const selectedSteps = useQuickRef(selSteps);
    const selectedSteps = useRef(selSteps);
    useEffect(() => { selectedSteps.current = selSteps }, [selSteps]);
    // const isRec = useQuickRef(isRecording);
    const isRec = useRef(isRecording);
    useEffect(() => { isRec.current = isRecording }, [isRecording])
    // const isPlay = useQuickRef(isPlaying);
    const isPlay = useRef(isPlaying);
    useEffect(() => { isPlay.current = isPlaying }, [isPlaying]);

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
        let callArray = properties.map((property) => {
            return (value: any) => {
                if (getNested(effectRef.current.get(), property)
                    === getNested(optionsRef.current, property)[0]) {
                    let temp = setNestedValue(property, value)
                    // instrumentRef.current.set(temp);
                    // dispatch(updateEffectState(indexRef.current, temp));
                    dispatch(updateEffectState(track, temp, index));
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
                                parameterLockEffect(
                                    activePattern.current,
                                    track,
                                    step,
                                    index,
                                    data
                                )
                            );
                        }
                    }
                } else {
                    // no steps selected logic
                    if (isContinuous) {
                        if (
                            stateValue === getNested(
                                effectRef.current.get(),
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
                                updateEffectState(track, setNestedValue(property, val), index))
                        }
                    } else {
                        let val = e.controller && e.controller.number
                            ? optionFromCC(e.value, parameterOptions)
                            : e.target.value
                        if (val !== stateValue) {
                            let data = setNestedValue(property, val);
                            // instrumentRef.current.set(data);
                            dispatch(updateEffectState(track, data, index))
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

    useEffectProperty(effectRef, options, 'Q');
    useEffectProperty(effectRef, options, 'attack');
    useEffectProperty(effectRef, options, 'baseFrequency');
    useEffectProperty(effectRef, options, 'bits');
    useEffectProperty(effectRef, options, 'dampening');
    useEffectProperty(effectRef, options, 'delayTime');
    useEffectProperty(effectRef, options, 'depth');
    useEffectProperty(effectRef, options, 'detune');
    useEffectProperty(effectRef, options, 'distortion');
    useEffectProperty(effectRef, options, 'feedback');
    useEffectProperty(effectRef, options, 'filter');
    useEffectProperty(effectRef, options, 'frequency');
    useEffectProperty(effectRef, options, 'gain');
    useEffectProperty(effectRef, options, 'high');
    useEffectProperty(effectRef, options, 'highFrequency');
    useEffectProperty(effectRef, options, 'knee');
    useEffectProperty(effectRef, options, 'low');
    useEffectProperty(effectRef, options, 'lowFrequency');
    useEffectProperty(effectRef, options, 'maxDelay');
    useEffectProperty(effectRef, options, 'mid');
    useEffectProperty(effectRef, options, 'octaves');
    useEffectProperty(effectRef, options, 'order');
    useEffectProperty(effectRef, options, 'oversample');
    useEffectProperty(effectRef, options, 'pitch');
    useEffectProperty(effectRef, options, 'ratio');
    useEffectProperty(effectRef, options, 'release');
    useEffectProperty(effectRef, options, 'rolloff');
    useEffectProperty(effectRef, options, 'roomSize');
    useEffectProperty(effectRef, options, 'smoothing');
    useEffectProperty(effectRef, options, 'spread');
    useEffectProperty(effectRef, options, 'stages');
    useEffectProperty(effectRef, options, 'threshold');
    useEffectProperty(effectRef, options, 'type');
    useEffectProperty(effectRef, options, 'wet');
    useEffectProperty(effectRef, options, 'width');
    useEffectProperty(effectRef, options, 'windowSize');


    useEffect(() => {
        if (midi.channel && midi.device) {
            inputRef.current = WebMidi.getInputByName(midi.device);
        }
    })


    useEffect(() => {
        if (!isPlaying && previousPlaying) {
            let p = propertiesToArray(lockedParameters.current);
            p.forEach((property) => {
                const d = copyToNew(lockedParameters.current, property)
                // effectRef.current.set(d);
                dispatch(updateEffectState(track, d, index));
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

    const effectCallback = useCallback((time: number, value: any) => {

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

    }, [
        properties,
        propertyUpdate,
        activePattern,
        arrangerMode,
        optionsRef,
        patternTracker,
    ])

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

    useEffect(() => {
        effectRef.current = returnEffect(type, optionsRef.current);
        toneRefEmitter.emit(
            trackEventTypes.CHANGE_EFFECT,
            { effect: effectRef.current, trackId: trackId, effectsIndex: index }
        );
        Object.keys(triggRefs.current).forEach(key => {
            let k = parseInt(key);
            triggRefs.current[k][track].effects[index].callback = effectCallback
        });
    }, [
        type,
        id,
        index,
        triggRefs,
        effectCallback,
        optionsRef
    ]);

    useEffect(() => {
        if (firstRender) {
            toneRefEmitter.emit(
                trackEventTypes.ADD_EFFECT,
                { effect: effectRef.current, trackId: trackId, effectIndex: index }
            );
            Object.keys(triggRefs.current).forEach(key => {
                let k = parseInt(key);
                triggRefs.current[k][track].effects[index].callback = effectCallback
            });
            setRender(false);
        }
    }, [])

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
            { properties.map(property => {
                // vai passar () => midiLearn(property) como funcão 
                const [value, r, unit, indicatorType, curve, utypes] = getNested(options, property)
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
                    case indicators.STEPPED_KNOB:
                        return (
                            // <STEPKNOB 
                            //     property={property} 
                            //     value={value} 
                            //     option={r} 
                            //     calc={accessNested(calcCallback, property)}>
                            // </STEPKNOB>
                            console.log()
                        )

                };
                return ''
            })}
        </div>
    )
};

export default Effect;
