import React, { useRef, useMemo, useContext, MutableRefObject, useState, useEffect, useCallback } from 'react';
import usePrevious from '../../../hooks/usePrevious';
import { useEffectProperties } from '../../../hooks/useProperty';


import { useDispatch, useSelector } from 'react-redux';
import { effectTypes, toneEffects, increaseDecreaseEffectProperty } from '../../../store/Track';
import { updateEffectState } from '../../../store/Track/actions'
import { parameterLockEffect, parameterLockEffectIncreaseDecrease } from '../../../store/Sequencer/actions'

import triggContext from '../../../context/triggState';
import toneRefsContext from '../../../context/toneRefsContext';

import WebMidi, { InputEventControlchange, Input } from 'webmidi';

import { timeObjFromEvent, typeMovement } from '../../../lib/utility';
import valueFromCC, { optionFromCC, valueFromMouse } from '../../../lib/curves';
import { onlyValues, propertiesToArray, getNested, setNestedValue, copyToNew, deleteProperty } from '../../../lib/objectDecompose';
import toneRefEmitter, { trackEventTypes } from '../../../lib/toneRefsEmitter';
import Tone from '../../../lib/tone'

import { sixteenthFromBBS } from '../../Arranger'
import { effectsInitials, effectsInitialsArray } from '../Instruments';
import { controlChangeEvent } from '../Instruments'
import { RootState } from '../../Xolombrisx';

import { effectsProps } from './types';
import { getEffectsInitials } from '../defaults';
import { indicators } from '../defaults'

import styles from './style.module.scss';
import DevicePresetManager from '../../../components/Layout/DevicePresetManager';

import Compressor from '../../../components/Layout/Effects/Compressor';

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

const Effect: React.FC<effectsProps> = ({ id, index, midi, options, type, trackId }) => {
    const triggRefs = useContext(triggContext);
    const toneObjRef = useContext(toneRefsContext);
    const effectRef: MutableRefObject<ReturnType<typeof returnEffect> | null> = useRef(null)
    // const effectRef = useRef(returnEffect(type, options))
    const dispatch = useDispatch();
    const properties = useMemo(() => propertiesToArray(getEffectsInitials(type)), [type]);
    const [firstRender, setRender] = useState(true);
    const previousType = usePrevious(type)


    const CCMaps = useRef<any>({});
    const listenCC = useRef<controlChangeEvent>();

    const lockedParameters: MutableRefObject<effectsInitials> = useRef({});
    const inputRef = useRef<false | Input>(false);

    const trackIdRef = useRef(trackId);
    useEffect(() => { trackIdRef.current = trackId }, [trackId])

    const optionsRef = useRef(options)
    useEffect(() => { optionsRef.current = options }, [options])

    const indexRef = useRef(index);
    useEffect(() => { indexRef.current = index }, [index]);

    const patternTracker = useSelector((state: RootState) => state.arranger.present.patternTracker);
    const patternTrackerRef = useRef(patternTracker);
    useEffect(() => { patternTrackerRef.current = patternTracker }, [patternTracker]);

    const arrangerMode = useSelector((state: RootState) => state.arranger.present.mode);
    const arrangerModeRef = useRef(arrangerMode);
    useEffect(() => { arrangerModeRef.current = arrangerMode }, [arrangerMode]);

    const activePattern = useSelector((state: RootState) => state.sequencer.present.activePattern);
    const activePatternRef = useRef(activePattern);
    useEffect(() => { activePatternRef.current = activePattern }, [activePattern]);

    const selectedSteps = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[index].selected);
    const selectedStepsRef = useRef(selectedSteps);
    useEffect(() => { selectedStepsRef.current = selectedSteps }, [selectedSteps]);

    const isRecording = useSelector((state: RootState) => state.transport.present.recording);
    const isRecordingRef = useRef(isRecording);
    useEffect(() => { isRecordingRef.current = isRecording }, [isRecording])

    const isPlaying = useSelector((state: RootState) => state.transport.present.isPlaying);
    const isPlayingRef = useRef(isPlaying);
    useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying]);
    const previousPlaying = usePrevious(isPlaying);

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
    // const patternLengths = useQuickRef(patLen);
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
    // const events = useQuickRef(ev);
    const eventsRef = useRef(events);
    useEffect(() => { eventsRef.current = events }, [events])

    const propertyValueUpdateCallback: any = useMemo(() => {
        let o = {}
        let callArray = properties.map((property) => {
            return (value: any) => {
                if (effectRef.current && getNested(effectRef.current.get(), property)
                    === getNested(optionsRef.current, property)[0]) {
                    let temp = setNestedValue(property, value)
                    // instrumentRef.current.set(temp);
                    // dispatch(updateEffectState(indexRef.current, temp));
                    dispatch(updateEffectState(trackIdRef.current, temp, index));
                };
            }
        });
        callArray.forEach((call, idx, arr) => {
            setNestedValue(properties[idx], call, o);
        });
        return o
    }, [
        dispatch,
        index,
        indexRef,
        properties,
        optionsRef,
    ]);

    const propertyIncreaseDecrease: any = useMemo(() => {
        const callArray = properties.map((property) => {
            return (e: any) => {

                const propertyArr = getNested(optionsRef.current, property);
                const indicatorType = propertyArr[3]
                const stateValue = propertyArr[0]

                const isContinuous = indicatorType === indicators.KNOB
                    || indicatorType === indicators.VERTICAL_SLIDER

                const cc = e.controller && e.controller.number

                if (selectedStepsRef.current.length >= 1) {
                    selectedStepsRef.current.forEach(step => {
                        dispatch(parameterLockEffectIncreaseDecrease(
                            activePatternRef.current,
                            trackIdRef.current,
                            step,
                            index, // fx have order between them (chainning) 
                            cc ? e.value : e.movementY,
                            property,
                            propertyArr,
                            cc,
                            isContinuous
                        ))
                    })
                    // } else if (stateValue === getNested(
                    //     instrumentRef.current.get(),
                    //     property
                    // )) {
                } else {
                    dispatch(increaseDecreaseEffectProperty(
                        trackIdRef.current,
                        index,
                        property,
                        cc ? e.value : e.movementY,
                        cc,
                        isContinuous
                    ))
                    // console.log(
                    //     'increasing decreasing',
                    //     'property:', property,
                    //     'cc:', cc,
                    //     'isContinuous:', isContinuous,
                    //     'e', e,
                    // )
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
        indexRef,
        optionsRef,
        selectedStepsRef,
        properties,
    ]);


    useEffectProperties(effectRef, options)

    // get handle of input object
    useEffect(() => {
        if (midi.channel && midi.device) {
            inputRef.current = WebMidi.getInputByName(midi.device);
        }
    })


    // reset locked property values after stopping playback
    useEffect(() => {
        if (!isPlaying && previousPlaying) {
            let p = propertiesToArray(lockedParameters.current);
            p.forEach((property) => {
                const d = copyToNew(lockedParameters.current, property)
                // effectRef.current.set(d);
                dispatch(updateEffectState(trackId, d, index));
            });
        }
        isPlayingRef.current = isPlaying;
    }, [
        isPlaying,
        dispatch,
        trackId,
        index,
        previousPlaying,
        isPlayingRef
    ]
    );

    const effectCallback = useCallback((time: number, value: any) => {

        properties.forEach(property => {
            const currVal = getNested(optionsRef.current, property);
            const callbackVal = getNested(value, property);
            const lockVal = getNested(lockedParameters.current, property);
            if (callbackVal && callbackVal !== currVal[0]) {
                propertyValueUpdateCallback[property](callbackVal);
                setNestedValue(property, callbackVal, lockedParameters);
            } else if (!callbackVal && lockVal && currVal[0] !== lockVal) {
                propertyValueUpdateCallback[property](lockVal);
                deleteProperty(lockedParameters.current, property);
                // setNestedValue(property, undefined, lockedParameters.current)
            }
        });

    }, [
        properties,
        propertyValueUpdateCallback,
        // activePattern,
        // arrangerMode,
        optionsRef,
        // patternTracker,
    ])


    // change effect logic
    // should only change if previous effect
    // is different than current effect
    useEffect(() => {
        if (previousType && previousType !== type) {
            effectRef.current = returnEffect(type, optionsRef.current);
            // toneRefEmitter.emit(
            //     trackEventTypes.CHANGE_EFFECT,
            //     { effect: effectRef.current, trackId: trackId, effectsIndex: index }
            // );

            if (toneObjRef?.current) {
                const chain = toneObjRef.current[trackId].chain
                const effects = toneObjRef.current[trackId].effects;
                let prev, next: Tone.Gain | toneEffects;
                if (index === toneObjRef.current[trackId].effects.length - 1) {
                    next = chain.out
                    if (index === 0) prev = chain.in;
                    else prev = effects[index - 1];
                } else {
                    next = effects[index + 1]
                    if (index === 0) prev = chain.in
                    else prev = effects[index - 1]
                }

                effects[index].disconnect();
                prev.disconnect()
                prev.connect(effectRef.current);
                effectRef.current.connect(next)
                effects[index].dispose();
                effects[index] = effectRef.current;
            }
            Object.keys(triggRefs.current).forEach(key => {
                let k = parseInt(key);
                triggRefs.current[k][trackId].effects[index].callback = effectCallback
            });
        }



    }, [
        type,
        id,
        index,
        trackId,
        triggRefs,
        effectCallback,
        optionsRef
    ]);


    // add effect first render logic 
    useEffect(() => {
        // if (firstRender) {
            // toneRefEmitter.emit(
            //     trackEventTypes.ADD_EFFECT,
            //     { effect: effectRef.current, trackId: trackId, effectIndex: index }
            // );
            effectRef.current = returnEffect(type, options)
            if (toneObjRef?.current) {
                let lgth = toneObjRef.current[trackId].effects.length;
                let chain = toneObjRef.current[trackId].chain;

                if (lgth > 0) {
                    let from, to;
                    if (index === lgth - 1) {
                        from = toneObjRef.current[trackId].effects[lgth - 1];
                        to = chain.out
                    } else {
                        from = toneObjRef.current[trackId].effects[index]
                        to = toneObjRef.current[trackId].effects[index + 1]
                    }
                    if (from && to) {
                        from.disconnect();
                        from.connect(effectRef.current);
                        effectRef.current.connect(to);
                    }
                } else {
                    chain.in.disconnect();
                    chain.in.connect(effectRef.current);
                    effectRef.current.connect(chain.out);
                }
                toneObjRef.current[trackId].effects.push(effectRef.current);
            }

            Object.keys(triggRefs.current).forEach(key => {
                let k = parseInt(key);
                triggRefs.current[k][trackId].effects[index].callback = effectCallback
            });
            // setRender(false);
        // }
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
                propertyIncreaseDecrease,
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

    const Component =
        type === effectTypes.COMPRESSOR
            ? <Compressor
                calcCallbacks={propertyIncreaseDecrease}
                events={events[activePattern]}
                fxIndex={index}
                options={options}
                properties={properties}
                propertyUpdateCallbacks={propertyValueUpdateCallback}
                selected={selectedSteps}
                trackIndex={trackId}
            />
            : null


    return (
        <div className={styles.border}>
            <div className={styles.deviceManager}>
                <DevicePresetManager
                    deviceId={''}
                    keyValue={[]}
                    onSubmit={() => { }}
                    remove={() => { }}
                    save={() => { }}
                    select={() => { }}
                    selected={''}
                />
            </div>
            { Component}
        </div>
    )
};

export default Effect;
