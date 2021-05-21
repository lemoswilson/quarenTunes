import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { xolombrisxInstruments, updateEnvelopeCurve } from '../../../store/Track'
import { event } from '../../../store/Sequencer'

import ModulationSynth from '../../../components/Layout/Instruments/ModulationSynth';
import NoiseSynth from '../../../components/Layout/Instruments/NoiseSynth';
import MembraneSynth from '../../../components/Layout/Instruments/MembraneSynth';
import MetalSynth from '../../../components/Layout/Instruments/MetalSynth';
import DrumRack from '../../../components/Layout/Instruments/DrumRack';

import ContinuousIndicator from '../../../components/UI/ContinuousIndicator';
import SteppedIndicator from '../../../components/UI/SteppedIndicator';
import CurveSelector from '../../../components/UI/CurveSelector';
import WaveformSelector from '../../../components/UI/WaveformSelector';

import { getParameterLockValue, getPropertyValue} from '../utility';

import { getNested } from '../../../lib/objectDecompose';
import { widgetTabIndexTrkStart } from '../../../containers/Track/defaults';
import { createContinuousIndicator, createCurveSelector, createSteppedIndicator, createWaveformSelector} from '../../../components/UI/Creators';

export interface InstrumentLoaderProps {
    options: any,
    calcCallbacks: any,
    propertyUpdateCallbacks: any,
    removePropertyLock: any,
    midiLearn: (property: string) => void,
    ccMaps: any,
    trackIndex: number,
    trackId: number,
    events: event[],
    selected: number[],
    properties: string[],
    voice: any
}

export interface InstrumentLayoutProps {
    index?: number,
    voice?: xolombrisxInstruments,
    
    getContinuousIndicator?: (
        property: string, 
        label: string, 
        className?: string, 
        detail?: any, 
        slider?: boolean,
        keyFunction?: (value: number | '*') => number |'*',

    ) => JSX.Element;

    getCurveSelector?: (
        property: string, 
        orientation: 'horizontal' | 'vertical', 
        className?: string, 
        modulationOrEnvelope?: 'envelope' | 'modulationEnvelope', 
        drumrack?: boolean, 
        padIdx?: number

    ) => JSX.Element;

    getSteppedKnob?: (
        property: string, 
        label: string, 
        className?: string,
        titleClassName?: string,
    ) => JSX.Element;

    getWaveformSelector?: (
        property: string, 
        className?: string,
        square?: boolean,
    ) => JSX.Element

}

const InstrumentLoader: React.FC<InstrumentLoaderProps> = (props) => {

    const dispatch = useDispatch();

    const parameterLockValues = useMemo(() => {
        const o: any = {}
        props.properties.forEach((property) => {
            getParameterLockValue(property, props.selected, props.events, o)
        })
        return o
        
    }, [props.properties, props.selected, props.events])

    const _getPropertyValue = <T extends number | string>(property: string): T | '*' => {
        return getPropertyValue(property, parameterLockValues, props.options, props.selected) 
    };


    const _continuousIndicator = (property: string, label: string, className?: string, detail?: any, slider?: boolean) => ( 
        createContinuousIndicator(
            props,
            widgetTabIndexTrkStart + props.trackIndex,
            property,
            label, 
            _getPropertyValue(property),
            `instrument${props.trackId}:${property}`,
            className,
            false,
            detail, 
            slider,
        )
    )

    const _steppedIndicator = (property: string, label: string, className?: string) => (
        createSteppedIndicator(
            props, 
            widgetTabIndexTrkStart + props.trackIndex,
            property,
            label,
            _getPropertyValue(property),
            className
        )
    )

    const getCurveSelector = (
        property: string, 
        orientation: 'horizontal' | 'vertical', 
        className?: string, 
        modulationOrEnvelope?: 'envelope' | 'modulationEnvelope', 
        drumrack?: boolean, 
        padIdx?: number
    ) => (
        createCurveSelector(
            props,
            orientation,
            (curve) => dispatch(updateEnvelopeCurve(
                props.trackIndex, 
                drumrack ? 'drumrack': modulationOrEnvelope ? modulationOrEnvelope : 'envelope',
                curve, 
                padIdx
            )),
            widgetTabIndexTrkStart + props.trackIndex,
            property,
            drumrack,
            className
        )
    )

    const getWaveformSelector = (property: string, className?: string) => (
        createWaveformSelector(
            props,
            widgetTabIndexTrkStart + props.trackIndex,
            property,
            className
        )
    )

    
    const Voice = 
        props.voice === xolombrisxInstruments.FMSYNTH || props.voice === xolombrisxInstruments.AMSYNTH
        ? ModulationSynth 
        : props.voice === xolombrisxInstruments.NOISESYNTH
        ? NoiseSynth 
        : props.voice === xolombrisxInstruments.MEMBRANESYNTH
        ? MembraneSynth 
        : props.voice === xolombrisxInstruments.METALSYNTH
        ? MetalSynth  
        : props.voice === xolombrisxInstruments.DRUMRACK
        ? DrumRack 
        : null;
    
    const Component = 
        Voice 
        ? <Voice {...props}  
            getWaveformSelector={getWaveformSelector}
            getContinuousIndicator={_continuousIndicator}
            getCurveSelector={getCurveSelector}
            getSteppedKnob={_steppedIndicator} 
        />
        : null;

    return Component
    
}

export default InstrumentLoader;