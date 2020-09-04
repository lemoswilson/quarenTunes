import React, { useEffect, useRef, FunctionComponent, useMemo, useState, useContext } from 'react';
import Tone from '../../../lib/tone';
import triggCtx from '../../../context/triggState';
import toneRefsContext from '../../../context/toneRefsContext';
import toneRefEmitter, { trackEventTypes } from '../../../lib/toneRefsEmitter';
import { propertiesToArray, setNestedPropertyValue, accessNestedProperty, onlyValues } from '../../../lib/objectDecompose'
import { InstrumentProps, parcialInstrumentProp } from './index'
import { instrumentTypes, toneInstruments, updateInstrumentState } from '../../../store/Track';
import { useDispatch, useSelector } from 'react-redux';
import { indicators } from '../defaults';
import { access } from 'fs';
import { RootState } from '../../../App';

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

    let dispatch = useDispatch()
    let instrumentRef = useRef(returnInstrument(voice, options));
    let properties: string[] = useMemo(() => propertiesToArray(options), [voice]);
    let optionsRef = useRef(options);
    let triggRefs = useContext(triggCtx);
    let patternTracker = useSelector(
        (state: RootState) => state.arranger.patternTracker
    );
    let patternTrackerRef = useRef(patternTracker);
    let arrangerMode = useSelector(
        (state: RootState) => state.arranger.mode
    );
    let arrangerModeRef = useRef(arrangerMode);
    let patternVelocities = useSelector(
        (state: RootState) => {
            let o: { [key: number]: number } = {}
            Object.keys(state.sequencer.patterns).forEach(key => {
                let k: number = parseInt(key);
                o[k] = state.sequencer.patterns[k].tracks[index].velocity;
            });
            return o;
        }
    );
    let patternNoteLengths = useSelector(
        (state: RootState) => {
            let o: { [key: number]: string | number } = {}
            Object.keys(state.sequencer.patterns).forEach(key => {
                let k: number = parseInt(key);
                o[k] = state.sequencer.patterns[k].tracks[index].noteLength;
            });
            return o
        }
    );

    let activePattern = useSelector(
        (state: RootState) => state.sequencer.activePattern
    );

    const [firstRender, setRender] = useState(true);

    let callbacks: any = useMemo(() => {
        let o = {}
        let callArray = properties.map((property) => {
            return (value: any) => {
                if (accessNestedProperty(instrumentRef.current.get(), property)
                    === accessNestedProperty(optionsRef.current, property)) {
                    let temp = setNestedPropertyValue({}, property, value)
                    instrumentRef.current.set(temp);
                    dispatch(updateInstrumentState(index, temp));
                };
            }
        });
        callArray.forEach((call, idx, arr) => {
            setNestedPropertyValue(o, properties[idx], call);
        });
        return o
    }, [voice]);


    let stateShouldBe: typeof options = {};

    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    useEffect(() => {
        arrangerModeRef.current = arrangerMode;
    });

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
        properties.forEach(property => {
            if (accessNestedProperty(value, property)
                && accessNestedProperty(value, property)
                !== accessNestedProperty(optionsRef.current, property)[0]
            ) {
                callbacks[property](accessNestedProperty(value, property));

            } else if (!accessNestedProperty(value, property)
                && accessNestedProperty(optionsRef, property)
                !== accessNestedProperty(stateShouldBe, property)
            ) {
                callbacks[property](accessNestedProperty(stateShouldBe, property));
            }
        });

        let velocity: number = value.velocity ? value.velocity
            : arrangerModeRef.current === "pattern"
                ? patternVelocities[activePattern]
                : patternVelocities[patternTrackerRef.current[0]]
        let length: string | number = value.length ? value.length
            : arrangerModeRef.current === "pattern"
                ? patternNoteLengths[activePattern]
                : patternNoteLengths[patternTrackerRef.current[0]]
        let notes: string[] | undefined = value.note ? value.note : undefined;

        if (notes) {
            notes.forEach(note => {
                if (note) {
                    instrumentRef.current.triggerAttackRelease(note, length, time, velocity);
                }
            })
        }
    };

    return (
        <div>
            {properties.map(property => {
                switch (accessNestedProperty(options, property)[2]) {
                    case indicators.DROPDOWN:
                        // return a JSX dropdown with classes as property name and instrument type
                        break;
                    case indicators.KNOB:
                        // return a JSX knob with classes as property name and instrument type
                        break;
                    case indicators.RADIO:
                    // return a JSX radio with classes as property name and instrument type
                    case indicators.SLIDER:
                    // return a JSX slider with classes as property name and instrument type
                };
            })}
        </div>
    )
}