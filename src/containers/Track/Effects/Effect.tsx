import React, { useRef, useMemo, useContext, MutableRefObject, useState, useEffect, useCallback } from 'react';
import usePrevious from '../../../hooks/usePrevious';
import { useEffectProperties } from '../../../hooks/useProperty';


import { useDispatch, useSelector } from 'react-redux';
import { effectTypes, toneEffects, increaseDecreaseEffectProperty } from '../../../store/Track';
import { updateEffectState } from '../../../store/Track/actions'
import { parameterLockEffect, parameterLockEffectIncreaseDecrease, removeEffectPropertyLock } from '../../../store/Sequencer/actions'

import triggContext from '../../../context/triggState';
import ToneObjectsContext from '../../../context/ToneObjectsContext';

import WebMidi, { InputEventControlchange, Input } from 'webmidi';

import { timeObjFromEvent, typeMovement } from '../../../lib/utility';
import valueFromCC, { optionFromCC, valueFromMouse } from '../../../lib/curves';
import { onlyValues, propertiesToArray, getNested, setNestedValue, copyToNew, deleteProperty } from '../../../lib/objectDecompose';
import toneRefEmitter, { trackEventTypes } from '../../../lib/toneRefsEmitter';
// import Tone from '../../../lib/tone'
// import * as Tone from 'tone';
import { Gain } from 'tone';
import ToneContext from '../../../context/ToneContext';

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

import { returnEffect } from '../../Xolombrisx';
import MenuButton from '../../../components/Layout/Instruments/Tabs/MenuButton';
import Tabs from '../../../components/Layout/Effects/Tabs';


const Effect: React.FC<effectsProps> = ({ fxId, 
    fxIndex, 
    midi, 
    options, 
    type, 
    trackId, 
    trackIndex, 
    deleteEffect,
    changeEffect, 
    addEffect 
}) => {
    // const ref_toneTriggCtx = useContext(triggContext);
    const ref_toneObjects = useContext(ToneObjectsContext);
    const ref_ToneEffect: MutableRefObject<ReturnType<typeof returnEffect> | null> = useRef(null)
    const Tone = useContext(ToneContext);
    // const effectRef = useRef(returnEffect(type, options))
    const dispatch = useDispatch();
    const fxProps = useMemo(() => propertiesToArray(getEffectsInitials(type)), [type]);
    const [firstRender, setRender] = useState(true);
    const previousType = usePrevious(type)


    const ref_trackIndex = useRef(trackIndex);
    useEffect(() => { ref_trackIndex.current = trackIndex }, [trackIndex])

    const ref_fxIndex = useRef(fxIndex)
    useEffect(() => { ref_fxIndex.current = fxIndex}, [fxIndex])
    const CCMaps = useRef<any>({});
    const listenCC = useRef<controlChangeEvent>();

    const lockedParameters: MutableRefObject<effectsInitials> = useRef({});
    const inputRef = useRef<false | Input>(false);

    const trackIdRef = useRef(trackId);
    useEffect(() => { trackIdRef.current = trackId }, [trackId])

    const optionsRef = useRef(options)
    useEffect(() => { optionsRef.current = options }, [options])

    const indexRef = useRef(fxIndex);
    useEffect(() => { indexRef.current = fxIndex }, [fxIndex]);

    const patternTracker = useSelector((state: RootState) => state.arranger.present.patternTracker);
    const patternTrackerRef = useRef(patternTracker);
    useEffect(() => { patternTrackerRef.current = patternTracker }, [patternTracker]);

    const fxCount = useSelector((state: RootState) => state.track.present.tracks[trackIndex].fx.length)

    const arrangerMode = useSelector((state: RootState) => state.arranger.present.mode);
    const arrangerModeRef = useRef(arrangerMode);
    useEffect(() => { arrangerModeRef.current = arrangerMode }, [arrangerMode]);

    const activePattern = useSelector((state: RootState) => state.sequencer.present.activePattern);
    const ref_activePatt = useRef(activePattern);
    useEffect(() => { ref_activePatt.current = activePattern }, [activePattern]);

    const selectedSteps = useSelector((state: RootState) => {
        if (state.sequencer.present.patterns[activePattern] && state.sequencer.present.patterns[activePattern].tracks[trackIndex])
            return state.sequencer.present.patterns[activePattern].tracks[trackIndex].selected
    });
    const ref_selectedSteps = useRef(selectedSteps);
    useEffect(() => { ref_selectedSteps.current = selectedSteps }, [selectedSteps]);

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
                o[k] = state.sequencer.present.patterns[k].tracks[fxIndex].length
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
                o[k] = state.sequencer.present.patterns[k].tracks[fxIndex].events
            });
            return o;
        }
    );
    // const events = useQuickRef(ev);
    const eventsRef = useRef(events);
    useEffect(() => { eventsRef.current = events }, [events])

    const propertiesUpdate: any = useMemo(() => {
        let o = {}
        let callArray = fxProps.map((property) => {
            return (value: any) => {
                if (ref_ToneEffect.current && getNested(ref_ToneEffect.current.get(), property)
                    === getNested(optionsRef.current, property)[0]) {
                    let temp = setNestedValue(property, value)
                    // instrumentRef.current.set(temp);
                    // dispatch(updateEffectState(indexRef.current, temp));
                    dispatch(updateEffectState(trackIdRef.current, temp, fxIndex));
                };
            }
        });
        callArray.forEach((call, idx, arr) => {
            setNestedValue(fxProps[idx], call, o);
        });
        return o
    }, [
        dispatch,
        fxIndex,
        indexRef,
        fxProps,
        optionsRef,
    ]);

    const propertiesIncDec: any = useMemo(() => {
        const callArray = fxProps.map((property) => {
            return (e: any) => {

                const propertyArr = getNested(optionsRef.current, property);
                const indicatorType = propertyArr[3]
                const stateValue = propertyArr[0]

                const isContinuous = indicatorType === indicators.KNOB
                    || indicatorType === indicators.VERTICAL_SLIDER

                const cc = e.controller && e.controller.number

                if (ref_selectedSteps.current && ref_selectedSteps.current.length >= 1) {
                    ref_selectedSteps.current.forEach(step => {
                        dispatch(parameterLockEffectIncreaseDecrease(
                            ref_activePatt.current,
                            trackIdRef.current,
                            step,
                            fxIndex, // fx have order between them (chainning) 
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
                        fxIndex,
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
        fxProps.forEach((_, idx, __) => {
            setNestedValue(fxProps[idx], callArray[idx], o);
        });
        return o;
    }, [
        dispatch,
        ref_activePatt,
        indexRef,
        optionsRef,
        ref_selectedSteps,
        fxProps,
    ]);

    const removeEffectPropertyLockCallbacks: any = useMemo(() => {
        let o = {}
        let callArray = fxProps.map(property => {
            return () => {
                if (ref_selectedSteps.current && ref_selectedSteps.current.length > 0)
                    ref_selectedSteps.current.forEach(step => {
                        dispatch(removeEffectPropertyLock(
                            ref_trackIndex.current,
                            ref_activePatt.current,
                            step,
                            property,    
                            ref_fxIndex.current,
                        ))
                    }
                )
            }
        })
        callArray.forEach((call, idx, arr) => {
            setNestedValue(fxProps[idx], call, o);
        });
        return o
    }, [])

        // add effect first render logic 
        useEffect(() => {
            if (firstRender) {
                // toneRefEmitter.emit(
                //     trackEventTypes.ADD_EFFECT,
                //     { effect: effectRef.current, trackId: trackId, effectIndex: index }
                // );
                ref_ToneEffect.current = returnEffect(type, options)
                if (ref_toneObjects.current) {
                    let lgth = ref_toneObjects.current.tracks[trackIndex].effects.length;
                    let chain = ref_toneObjects.current.tracks[trackIndex].chain;
    
                    if (lgth > 0) {
                        let from, to;
                        if (fxIndex === lgth - 1) {
                            from = ref_toneObjects.current.tracks[trackIndex].effects[lgth - 1];
                            to = chain.out
                        } else {
                            from = ref_toneObjects.current.tracks[trackIndex].effects[fxIndex]
                            to = ref_toneObjects.current.tracks[trackIndex].effects[fxIndex + 1]
                        }
                        if (from && to) {
                            from.disconnect();
                            from.connect(ref_ToneEffect.current);
                            ref_ToneEffect.current.connect(to);
                        }
                    } else {
                        chain.in.disconnect();
                        chain.in.connect(ref_ToneEffect.current);
                        ref_ToneEffect.current.connect(chain.out);
                    }
                    ref_toneObjects.current.tracks[trackIndex].effects.push(ref_ToneEffect.current);
    
                    Object.keys(ref_toneObjects.current.patterns).forEach(key => {
                        let k = parseInt(key);
                        if (ref_toneObjects.current)
                            ref_toneObjects.current.patterns[k][trackIndex].effects[fxIndex].callback = effectCallback
                    });
                }
    
                setRender(false);
            }
        }, [])


    useEffectProperties(ref_ToneEffect, options)

    // get handle of input object
    useEffect(() => {
        if (midi.channel && midi.device && midi.device !== 'onboardKey') {
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
                dispatch(updateEffectState(trackId, d, fxIndex));
            });
        }
        isPlayingRef.current = isPlaying;
    }, [
        isPlaying,
        dispatch,
        trackId,
        fxIndex,
        previousPlaying,
        isPlayingRef
    ]
    );

    const effectCallback = useCallback((time: number, value: any) => {

        fxProps.forEach(property => {

            const currVal = getNested(optionsRef.current, property);
            const callbackVal = getNested(value, property);
            const lockVal = getNested(lockedParameters.current, property);

            if (callbackVal && callbackVal !== currVal[0]) {
                propertiesUpdate[property](callbackVal);
                setNestedValue(property, callbackVal, lockedParameters);

            } else if (!callbackVal && lockVal && currVal[0] !== lockVal) {
                propertiesUpdate[property](lockVal);
                deleteProperty(lockedParameters.current, property);

                // setNestedValue(property, undefined, lockedParameters.current)
            }
        });

    }, [
        fxProps,
        propertiesUpdate,
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
            ref_ToneEffect.current = returnEffect(type, optionsRef.current);
            // toneRefEmitter.emit(
            //     trackEventTypes.CHANGE_EFFECT,
            //     { effect: effectRef.current, trackId: trackId, effectsIndex: index }
            // );

            if (ref_toneObjects?.current) {
                const chain = ref_toneObjects.current.tracks[trackIndex].chain
                const effects = ref_toneObjects.current.tracks[trackIndex].effects;
                let prev, next: Gain | toneEffects;
                if (fxIndex === effects.length - 1) {
                    next = chain.out
                    if (fxIndex === 0) prev = chain.in;
                    else prev = effects[fxIndex - 1];
                } else {
                    next = effects[fxIndex + 1]
                    if (fxIndex === 0) prev = chain.in
                    else prev = effects[fxIndex - 1]
                }

                effects[fxIndex].disconnect();
                prev.disconnect()
                prev.connect(ref_ToneEffect.current);
                ref_ToneEffect.current.connect(next)
                effects[fxIndex].dispose();
                effects[fxIndex] = ref_ToneEffect.current;

                Object.keys(ref_toneObjects.current.patterns).forEach(key => {
                    let k = parseInt(key);
                    if (ref_toneObjects.current)
                        ref_toneObjects.current.patterns[k][trackIndex].effects[fxIndex].callback = effectCallback
                });
            }
        }



    }, [
        type,
        fxId,
        fxIndex,
        trackIndex,
        ToneObjectsContext,
        optionsRef
    ]);




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
                propertiesIncDec,
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
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                events={events[activePattern]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}
            />
            : null


    return (
        <div className={styles.fx}>
            <div className={styles.box}>
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
            </div>
            <Tabs 
                fxIndex={fxIndex}
                trackIndex={trackIndex}
                type={type} 
                fxCount={fxCount}
                removeEffect={deleteEffect}
                insertEffect={addEffect}
                selectEffect={changeEffect}
            />
            {/* <div className={styles.tabs}>
                <div className={styles.selector}>
                    <div className={styles.border}>
                        <div className={styles.effectTitle}>
                            { type }        
                        </div> 
                        <div className={styles.menuWrapper}>
                            <MenuButton onClick={menuOnClick}/> 
                        </div> 
                    </div> 
                </div>  
            </div> */}
        </div>
    )
};

export default Effect;
