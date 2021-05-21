import React from 'react';
import ContinuousIndicator from '../ContinuousIndicator';
import SteppedIndicator from '../SteppedIndicator';
import CurveSelector from '../CurveSelector';
import { curveTypes } from '../../../containers/Track/defaults';
import WaveformSelector from '../WaveformSelector';
import { getNested } from '../../../lib/objectDecompose';
import { InstrumentLoaderProps } from '../../../containers/Track/Instruments/InstrumentLoader';



export const createContinuousIndicator = (
    props: InstrumentLoaderProps, 
    tabIndex: number, 
    property: string,
    label: string,
    value: number | "*",
    id: string,
    className?: string,
    selectedLock?: boolean, 
    detail?: any,
    slider?: boolean,
    keyFunction?: (value: number | '*') => number | '*'
) => {
    return (
        <ContinuousIndicator 
            selectedLock={selectedLock}
            ccMouseCalculationCallback={getNested(props.calcCallbacks, property)}
            tabIndex={tabIndex}
            label={label}
            removePropertyLock={getNested(props.removePropertyLock, property)}
            ccMap={getNested(props.ccMaps.current, property)}
            max={getNested(props.options, property)[1][1]}
            midiLearn={() => {props.midiLearn(property)}}
            min={getNested(props.options, property)[1][0]}
            type={slider ? 'slider' : 'knob' }
            unit={getNested(props.options, property)[2]}
            detail={detail}
            value={value}
            indicatorId={id}
            curve={getNested(props.options, property)[4]}
            valueUpdateCallback={getNested(props.propertyUpdateCallbacks, property)}
            className={className} 
            keyFunction={keyFunction}
        /> 
    )
};

export const createSteppedIndicator = (
    props: InstrumentLoaderProps, 
    tabIndex: number, 
    property: string,
    label: string,
    value: string,
    className?: string,
    titleClassName?: string,
) => {
    return (
        <SteppedIndicator
        tabIndex={tabIndex}
        ccMouseCalculationCallback={getNested(props.calcCallbacks, property)}
        label={label}
        midiLearn={() => { }}
        options={getNested(props.options, property)[1]}
        selected={value}
        unit={''}
        valueUpdateCallback={getNested(props.propertyUpdateCallbacks, property)}
        className={className}
        titleClassName={titleClassName}
    />
    )
}

export const createCurveSelector = (
    props: InstrumentLoaderProps, 
    orientation: 'horizontal' | 'vertical',
    selectCurve: (curve: curveTypes) => void,
    tabIndex: number, 
    property: string,
    drumrack?: boolean,
    className?: string,
) => {
    return <CurveSelector
        display={orientation}
        selectCurve={selectCurve}
        tabIndex={tabIndex}
        selected={ drumrack ? getNested(props.options, property)[0] :getNested(props.options, property).decayCurve[0]}
        className={className}
    />
}

export const createWaveformSelector = (
    props: InstrumentLoaderProps, 
    tabIndex: number, 
    property: string,
    className?: string,
    square?: boolean,
) => {
    return  <WaveformSelector
        selectWaveform={(wave) => { getNested( props.propertyUpdateCallbacks, property )(wave) }}
        tabIndex={tabIndex}
        selected={getNested( props.options, property )[0]  }
        className={className}
        square={square}
    />
}