import React, { useRef, useMemo, useContext, MutableRefObject, useState, useEffect, useCallback } from 'react';
import usePrevious from '../../../hooks/usePrevious';
import { useEffectProperties } from '../../../hooks/useProperty';


import { useDispatch, useSelector } from 'react-redux';
import { effectTypes, toneEffects, increaseDecreaseEffectProperty } from '../../../store/Track';
import { updateEffectState } from '../../../store/Track/actions'
import { event } from '../../../store/Sequencer'
import { parameterLockEffect, parameterLockEffectIncreaseDecrease, removeEffectPropertyLock } from '../../../store/Sequencer/actions'


import ToneObjectsContext from '../../../context/ToneObjectsContext';

import WebMidi, { InputEventControlchange, Input } from 'webmidi';

import { timeObjFromEvent, typeMovement } from '../../../lib/utility';
import valueFromCC, { optionFromCC, valueFromMouse } from '../../../lib/curves';
import { onlyValues, propertiesToArray, getNested, setNestedValue, copyToNew, deleteProperty } from '../../../lib/objectDecompose';
import toneRefEmitter, { trackEventTypes } from '../../../lib/toneRefsEmitter';
// import Tone from '../../../lib/tone'
import * as Tone from 'tone';
import { Gain } from 'tone';
// import ToneContext from '../../../context/ToneContext';

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
import Gate from '../../../components/Layout/Effects/Gate';
import Limiter from '../../../components/Layout/Effects/Limiter';
import FreqShifter from '../../../components/Layout/Effects/FreqShifter';
import Widener from '../../../components/Layout/Effects/Widener';
import EQ3 from '../../../components/Layout/Effects/EQ3';
import FeedbackDelay from '../../../components/Layout/Effects/FeedbackDelay';
import JCVerb from '../../../components/Layout/Effects/JCVerb';
import FreeVerb from '../../../components/Layout/Effects/FreeVerb';
import Phaser from '../../../components/Layout/Effects/Phaser';
import PingPong from '../../../components/Layout/Effects/PingPong';
import PitchShifter from '../../../components/Layout/Effects/PitchShifter';
import Tremolo from '../../../components/Layout/Effects/Tremolo';
import AutoPan from '../../../components/Layout/Effects/AutoPan';
import Bitcrusher from '../../../components/Layout/Effects/Bitcrusher';
import Chebyshev from '../../../components/Layout/Effects/Chebyshev';
import Distortion from '../../../components/Layout/Effects/Distortion';
import Vibrato from '../../../components/Layout/Effects/Vibrato';
import AutoFilter from '../../../components/Layout/Effects/AutoFilter';
import Chorus from '../../../components/Layout/Effects/Chorus';
import Filter from '../../../components/Layout/Effects/Filter';

export interface effectLayoutProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    removeEffectPropertyLocks: any,
    ccMaps: any,
    midiLearn: (property: string) => void,
    propertyUpdateCallbacks: any,
    trackIndex: number,
    trackId: number,
    fxId: number,
    fxIndex: number,
    selected?: number[],
    events: event[],
    properties: any[];
}

const Effect: React.FC<effectsProps> = ({ 
    fxId, 
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
    // const Tone = useContext(ToneContext);
    // const effectRef = useRef(returnEffect(type, options))
    const dispatch = useDispatch();
    const fxProps = useMemo(() => propertiesToArray(getEffectsInitials(type)), [type]);
    const [firstRender, setRender] = useState(true);
    const previousType = usePrevious(type)

    useEffect(() => {
        // console.log('effect index', fxIndex, 'type', type, 'options', options)
    }, [fxIndex, type])

    const ref_trackIndex = useRef(trackIndex);
    useEffect(() => { ref_trackIndex.current = trackIndex }, [trackIndex])

    const ref_fxIndex = useRef(fxIndex)
    useEffect(() => { ref_fxIndex.current = fxIndex}, [fxIndex])
    const ref_CCMaps = useRef<any>({});
    const ref_listenCC = useRef<controlChangeEvent>();

    const ref_lockedParameters: MutableRefObject<effectsInitials> = useRef({});
    const ref_input = useRef<false | Input>(false);

    const ref_trackId = useRef(trackId);
    useEffect(() => { ref_trackId.current = trackId }, [trackId])

    const ref_options = useRef(options)
    useEffect(() => { ref_options.current = options }, [options])

    // const re_index = useRef(fxIndex);
    // useEffect(() => { re_index.current = fxIndex }, [fxIndex]);

    const pattTracker = useSelector((state: RootState) => state.arranger.present.patternTracker);
    const ref_pattTracker = useRef(pattTracker);
    useEffect(() => { ref_pattTracker.current = pattTracker }, [pattTracker]);

    const fxCount = useSelector((state: RootState) => state.track.present.tracks[trackIndex].fx.length)

    const arrgMode = useSelector((state: RootState) => state.arranger.present.mode);
    const ref_arrgMode = useRef(arrgMode);
    useEffect(() => { ref_arrgMode.current = arrgMode }, [arrgMode]);

    const activePatt = useSelector((state: RootState) => state.sequencer.present.activePattern);
    const ref_activePatt = useRef(activePatt);
    useEffect(() => { ref_activePatt.current = activePatt }, [activePatt]);

    const selectedSteps = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[trackIndex].selected)
    const ref_selectedSteps = useRef(selectedSteps);
    useEffect(() => { ref_selectedSteps.current = selectedSteps }, [selectedSteps]);

    const isRec = useSelector((state: RootState) => state.transport.present.recording);
    const ref_isRec = useRef(isRec);
    useEffect(() => { ref_isRec.current = isRec }, [isRec])

    const isPlay = useSelector((state: RootState) => state.transport.present.isPlaying);
    const ref_isPlay = useRef(isPlay);
    useEffect(() => { ref_isPlay.current = isPlay }, [isPlay]);
    const prev_isPlay = usePrevious(isPlay);

    const pattLens = useSelector(
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

    const ref_pattLens = useRef(pattLens);
    useEffect(() => { ref_pattLens.current = pattLens }, [pattLens])

    const trkPattLen = useSelector(
        (state: RootState) => {
            let o: { [key: number]: any } = {}
            Object.keys(state.sequencer.present.patterns).forEach(key => {
                let k = parseInt(key)
                o[k] = state.sequencer.present.patterns[k].tracks[trackIndex].length
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
                o[k] = state.sequencer.present.patterns[k].tracks[trackIndex].events
            });
            return o;
        }
    );
    // const events = useQuickRef(ev);
    const ref_events = useRef(events);
    useEffect(() => { ref_events.current = events }, [events])

    const propertiesUpdate: any = useMemo(() => {
        let o = {}
        let callArray = fxProps.map((property) => {
            return (value: any) => {
                // console.log('should be calling properties update fx, property:', property);
                let temp = setNestedValue(property, value)
                // instrumentRef.current.set(temp);
                // dispatch(updateEffectState(indexRef.current, temp));
                dispatch(updateEffectState(ref_trackIndex.current, temp, ref_fxIndex.current));
            }
        });
        callArray.forEach((call, idx, arr) => {
            setNestedValue(fxProps[idx], call, o);
        });
        return o
    }, [
        dispatch,
        fxIndex,
        ref_fxIndex,
        fxProps,
        ref_options,
    ]);

    const propertiesIncDec: any = useMemo(() => {
        const callArray = fxProps.map((property) => {
            return (e: any) => {

                const propertyArr = getNested(ref_options.current, property);
                const indicatorType = propertyArr[3]
                const stateValue = propertyArr[0]

                const isContinuous = indicatorType === indicators.KNOB
                    || indicatorType === indicators.VERTICAL_SLIDER

                const cc = e.controller && e.controller.number

                // if (ref_selectedSteps.current && ref_selectedSteps.current.length > 0) {
                //     ref_selectedSteps.current.forEach(step => {
                //         console.log(`dispatching parameterlock effect step ${step}`)
                //         dispatch(parameterLockEffectIncreaseDecrease(
                //             ref_activePatt.current,
                //             ref_trackIndex.current,
                //             step,
                //             ref_fxIndex.current, // fx have order between them (chainning) 
                //             cc ? e.value : e.movementY,
                //             property,
                //             // propertyArr,
                //             getNested(ref_options.current, property),
                //             cc,
                //             isContinuous
                //         ))
                //     })
                // } else {
                //     dispatch(increaseDecreaseEffectProperty(
                //         ref_trackIndex.current,
                //         ref_fxIndex.current,
                //         property,
                //         cc ? e.value : e.movementY,
                //         cc,
                //         isContinuous
                //     ))
                // }
                dispatch(increaseDecreaseEffectProperty(
                    ref_trackIndex.current,
                    ref_fxIndex.current,
                    property,
                    cc ? e.value : e.movementY,
                    cc,
                    isContinuous
                ))
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
        ref_fxIndex,
        ref_options,
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
    }, [type])

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
                
                // ref_ToneEffect.current.chain()
                // ref_ToneEffect.current.disconnect()
                
                // splice actually pushes to array if index passed is === length

                ref_toneObjects.current.tracks[trackIndex].effects.splice(fxIndex, 0, ref_ToneEffect.current)

                Object.keys(ref_toneObjects.current.patterns).forEach(key => {
                    // NEED TO ADD PART TO EFFECTS ( PUSH A OBJECT FIRST )
                    let k = parseInt(key);
                    if (ref_toneObjects.current){
                        // ref_toneObjects.current.patterns[k][trackIndex].effects.splice(fxIndex, 0, new Tone.Part())
                        ref_toneObjects.current.patterns[k][trackIndex].effects[fxIndex].callback = effectCallback
                    }

                });

                ref_toneObjects.current.arranger.forEach((_, idx, __) => {
                    if (ref_toneObjects.current) {
                        // ref_toneObjects.current.arranger[idx][trackIndex].effects.splice(fxIndex, 0, new Tone.Part())
                        console.log(`inside arranger, should be setting callback into fx ${fxIndex}`)
                        console.log('tone objects is ', ref_toneObjects.current);
                        ref_toneObjects.current.arranger[idx][trackIndex].effects[fxIndex].callback = effectCallback;
                    }
                })

                // ref_toneObjects.current.flagObjects[trackIndex].effects.splice(fxIndex, 0, {callback: effectCallback, flag: false})
                ref_toneObjects.current.flagObjects[trackIndex].effects[fxIndex].callback = effectCallback;

                for (let i = 0; i < ref_toneObjects.current.tracks[trackIndex].effects.length ; i ++)
                    ref_toneObjects.current.tracks[trackIndex].effects[i].disconnect()

                ref_toneObjects.current.tracks[trackIndex].instrument?.disconnect()
                chain.in.disconnect()

                ref_toneObjects.current?.tracks[trackIndex].instrument?.chain(chain.in, ...ref_toneObjects.current.tracks[trackIndex].effects, chain.out)
            }
            setRender(false);
        }

    }, [])


    useEffectProperties(ref_ToneEffect, options)

    // get handle of input object
    // useEffect(() => {
    //     if (midi.channel && midi.device && midi.device !== 'onboardKey') {
    //         inputRef.current = WebMidi.getInputByName(midi.device);
    //     }
    // })
    



    // reset locked property values after stopping playback
    useEffect(() => {
        if (!isPlay && prev_isPlay) {
            let p = propertiesToArray(ref_lockedParameters.current);
            p.forEach((property) => {
                const d = copyToNew(ref_lockedParameters.current, property)
                // effectRef.current.set(d);
                dispatch(updateEffectState(trackId, d, fxIndex));
            });
        }
        ref_isPlay.current = isPlay;
    }, [
        isPlay,
        dispatch,
        trackId,
        fxIndex,
        prev_isPlay,
        ref_isPlay
    ]
    );

    const effectCallback = useCallback((time: number, value: any) => {
        // console.log(`this is the effect callback, track ${trackId}, effect ${fxId}`);

        fxProps.forEach(property => {

            const currVal = getNested(ref_options.current, property);
            const callbackVal = getNested(value, property);
            const lockVal = getNested(ref_lockedParameters.current, property);

            if (callbackVal && callbackVal !== currVal[0]) {
                // propertiesUpdate[property](callbackVal);
                console.log('should be updating the vallue inside effect callback');
                ref_toneObjects.current?.tracks[ref_trackIndex.current].effects[ref_fxIndex.current].set(setNestedValue(property, callbackVal));
                getNested(propertiesUpdate, property)(callbackVal);
                if (!lockVal)
                    setNestedValue(property, currVal[0], ref_lockedParameters.current);

            } else if (!callbackVal && lockVal && currVal[0] !== lockVal) {
                // propertiesUpdate[property](lockVal);
                ref_toneObjects.current?.tracks[ref_trackIndex.current].effects[ref_fxIndex.current].set(setNestedValue(property, lockVal));
                getNested(propertiesUpdate, property)(lockVal);
                deleteProperty(ref_lockedParameters.current, property);

                // setNestedValue(property, undefined, lockedParameters.current)
            }
        });

    }, [
        fxProps,
        propertiesUpdate,
        // activePattern,
        // arrangerMode,
        ref_options,
        // patternTracker,
    ])


    // change effect logic
    // should only change if previous effect
    // is different than current effect
    useEffect(() => {
        if (previousType && previousType !== type) {
            ref_ToneEffect.current = returnEffect(type, ref_options.current);
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

                ref_toneObjects.current?.arranger.forEach((_, idx, __) => {
                    if (ref_toneObjects.current)
                        ref_toneObjects.current.arranger[idx][trackIndex].effects[fxIndex].callback = effectCallback
                })

                ref_toneObjects.current.flagObjects[trackIndex].effects[fxIndex].callback = effectCallback;
                
            }
        }



    }, [
        type,
        fxId,
        fxIndex,
        trackIndex,
        ToneObjectsContext,
        ref_options
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

        setNestedValue(
            property,
             {
                func: f,
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
                    f
                );
            }
        }

        WebMidi.inputs.forEach(input => {
            input.removeListener('controlchange', 'all', ref_listenCC.current)
        })
        ref_listenCC.current = undefined;
        
    }

    const midiLearn = (property: string) => {
        let locked = false;
        const p = getNested(ref_CCMaps.current, property);
        if (p) {
            locked = true;
            let device = WebMidi.getInputByName(p.device);
            if (device) {
                device.removeListener(
                    'controlchange',
                    p.channel,
                    p.func,
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

    const Component =
        type === effectTypes.COMPRESSOR
            ? <Compressor
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps}
                events={events[activePatt]}
                trackId={trackId}
                fxId={fxId}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}
            />
            : type === effectTypes.GATE 
            ? <Gate 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                events={events[activePatt]}
                fxIndex={fxIndex}
                trackId={trackId}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                fxId={fxId}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}
            />
            : type === effectTypes.LIMITER
            ? <Limiter
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                events={events[activePatt]}
                fxIndex={fxIndex}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                trackId={trackId}
                fxId={fxId}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}  
            />
            : type === effectTypes.FREQUENCYSHIFTER
            ? <FreqShifter 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                events={events[activePatt]}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                fxIndex={fxIndex}
                trackId={trackId}
                fxId={fxId}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}   
            />
            : type === effectTypes.STEREOWIDENER
            ? <Widener 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                trackId={trackId}
                fxId={fxId}
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}   
            />
            : type === effectTypes.EQ3
            ? <EQ3 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}     
            />
            : type === effectTypes.FEEDBACKDELAY
            ? <FeedbackDelay 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                fxId={fxId}
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}       
            />
            : type === effectTypes.JCREVERB
            ? <JCVerb
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                events={events[activePatt]}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            />
            : type === effectTypes.FREEVERB
            ? <FreeVerb
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                fxId={fxId}
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            />
            : type === effectTypes.PHASER
            ? <Phaser 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                fxId={fxId}
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            />
            : type === effectTypes.PINGPONGDELAY
            ? <PingPong 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            />
            : type === effectTypes.PITCHSHIFT
            ? <PitchShifter 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                events={events[activePatt]}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            />
            : type === effectTypes.TREMOLO
            ? <Tremolo 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                events={events[activePatt]}
                fxIndex={fxIndex}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            />
            : type === effectTypes.AUTOPANNER
            ? <AutoPan 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                events={events[activePatt]}
                fxIndex={fxIndex}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            />
            : type === effectTypes.BITCRUSHER
            ? <Bitcrusher 
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                events={events[activePatt]}
                fxIndex={fxIndex}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            />
            : type === effectTypes.CHEBYSHEV
            ? <Chebyshev
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            /> 
            : type === effectTypes.DISTORTION
            ? <Distortion
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                events={events[activePatt]}
                fxIndex={fxIndex}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            /> 
            : type === effectTypes.VIBRATO
            ? <Vibrato
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            /> 
            : type === effectTypes.AUTOFILTER
            ? <AutoFilter
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            /> 
            : type === effectTypes.CHORUS
            ? <Chorus
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            /> 
            : type === effectTypes.FILTER
            ? <Filter
                removeEffectPropertyLocks={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                trackId={trackId}
                fxId={fxId}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps} 
                events={events[activePatt]}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackId}         
            /> 
            : null



    return (
        <div onClick={() => console.log(ref_selectedSteps.current)} className={styles.fx}>
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
                    { Component }
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
