import React, { useMemo } from 'react';
import { InstrumentLoaderProps, InstrumentLayoutProps } from '../Instruments/InstrumentLoader';
import { getParameterLockValue, getPropertyValue } from '../utility';
import { widgetTabIndexTrkStart, trackMax } from '../defaults';
import { createContinuousIndicator, createSteppedIndicator, createWaveformSelector } from '../../../components/UI/Creators';
import { effectTypes } from '../../../store/Track';

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
import Compressor from '../../../components/Layout/Effects/Compressor';

interface EffectsLoaderProps extends InstrumentLoaderProps {
    fxId: number,
    fxIndex: number,
}

export interface EffectsLayoutProps extends InstrumentLayoutProps {
    fxId?: number,
    fxIndex: number,
}

const EffectLoader: React.FC<EffectsLoaderProps> = (props) => {

    const parameterLockValues = useMemo(() => {
        const o: any = {};
        props.properties.forEach((property) => {
            getParameterLockValue(
                property, 
                props.selected, 
                props.events, 
                o, 
                true, 
                props.fxIndex
            )
        })
        return o
    }, [props.properties, props.selected, props.events, props.fxIndex])

    const _getPropertyValue = <T extends number | string>(property: string): T | '*' => {
        return getPropertyValue(property, parameterLockValues, props.options, props.selected) 
    };

    const _continuousIndicator = (
        property: string, 
        label: string, 
        className?: string, 
        detail?: any, 
        slider?: boolean, 
        keyFunction?: (value: number | '*') => number | '*'
    ) => ( 
        createContinuousIndicator(
            props,
            widgetTabIndexTrkStart + trackMax + props.fxIndex + 1,
            property,
            label, 
            _getPropertyValue(property),
            `instrument${props.trackId}:fx${props.fxId}${property}`,
            className,
            false,
            detail, 
            slider,
            keyFunction,
        )
    )

    const _steppedIndicator = (property: string, label: string, className?: string, titleClassName?: string,) => (
        createSteppedIndicator(
            props, 
            widgetTabIndexTrkStart + trackMax + props.fxIndex + 1,
            property,
            label,
            _getPropertyValue(property),
            className,
            titleClassName,
        )
    )

    const getWaveformSelector = (property: string, className?: string, square?: boolean,) => (
        createWaveformSelector(
            props,
            widgetTabIndexTrkStart + props.trackIndex,
            property,
            className,
            square
        )
    )

    const Effect = 
    props.voice === effectTypes.COMPRESSOR
    ? Compressor
    : props.voice === effectTypes.GATE 
    ? Gate 
    : props.voice === effectTypes.LIMITER
    ? Limiter
    : props.voice === effectTypes.FREQUENCYSHIFTER
    ? FreqShifter 
    : props.voice === effectTypes.STEREOWIDENER
    ? Widener 
    : props.voice === effectTypes.EQ3
    ? EQ3 
    : props.voice === effectTypes.FEEDBACKDELAY
    ? FeedbackDelay 
    : props.voice === effectTypes.JCREVERB
    ? JCVerb      
    : props.voice === effectTypes.FREEVERB
    ? FreeVerb      
    : props.voice === effectTypes.PHASER
    ? Phaser       
    : props.voice === effectTypes.PINGPONGDELAY
    ? PingPong       
    : props.voice === effectTypes.PITCHSHIFT
    ? PitchShifter      
    : props.voice === effectTypes.TREMOLO
    ? Tremolo       
    : props.voice === effectTypes.AUTOPANNER
    ? AutoPan       
    : props.voice === effectTypes.BITCRUSHER
    ? Bitcrusher       
    : props.voice === effectTypes.CHEBYSHEV
    ? Chebyshev       
    : props.voice === effectTypes.DISTORTION
    ? Distortion       
    : props.voice === effectTypes.VIBRATO
    ? Vibrato
    : props.voice === effectTypes.AUTOFILTER
    ? AutoFilter       
    : props.voice === effectTypes.CHORUS
    ? Chorus       
    : props.voice === effectTypes.FILTER
    ? Filter       
    : null

    const Component = 
    Effect ?
    <Effect {...props}
        getContinuousIndicator={_continuousIndicator}
        getSteppedKnob={_steppedIndicator}
        getWaveformSelector={getWaveformSelector}
    />
    : null

    return Component
}

export default EffectLoader;
