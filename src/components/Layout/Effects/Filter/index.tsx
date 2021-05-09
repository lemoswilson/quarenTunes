import React, { useMemo } from 'react';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer';
import { widgetTabIndexTrkStart, trackMax} from '../../../../containers/Track/defaults';
import SteppedIndicator from '../../SteppedIndicator';
import WaveformSelector from '../../WaveformSelector';

export interface FilterProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    removeEffectPropertyLocks: any,
    propertyUpdateCallbacks: any,
    trackIndex: number,
    trackId: number,
    fxId: number,
    fxIndex: number,
    selected?: number[],
    events: event[],
    properties: any[];
}

const Filter: React.FC<FilterProps> = ({
    calcCallbacks,
    options,
    propertyUpdateCallbacks,
    removeEffectPropertyLocks,
    trackIndex,
    trackId,
    fxIndex,
    fxId,
    events,
    properties,
    selected,
}) => {

    const detune = options.detune;
    const rolloff = options.rolloff;
    const frequency = options.frequency;
    const type = options.type;
    const Q = options.Q
    const gain = options.gain;

    const parameterLockValues = useMemo(() => {
        const o: any = {}
        properties.forEach(property => {
            const selectedPropertyArray = selected?.map(s => getNested(events[s].fx[fxIndex], property))

            const allValuesEqual =
                selected && selected.length > 0
                    ? selectedPropertyArray?.every((v, idx, arr) => v && v === arr[0])
                    : false;
            const noValuesInSelected =
                selected && selected.length > 0
                    ? selectedPropertyArray?.every(v => v === undefined)
                    : false;

            setNestedValue(
                property,
                [
                    allValuesEqual,
                    allValuesEqual && selectedPropertyArray? selectedPropertyArray[0] : false,
                    noValuesInSelected
                ],
                o,
            )
        })
        return o
    }, [properties, selected, events])


    const getPropertyValue = (property: string): number | '*' => {
        const pmValues: (number | boolean | string)[] = getNested(parameterLockValues, property)
        return selected && selected.length > 1 && !pmValues[0] && !pmValues[2]
            ? '*'
            : pmValues[0]
                ? pmValues[1]
                : getNested(options, property)[0]
    };

    const getPercentage = (value: number | '*'): number | '*' => {
        if (value === '*')
            return value
        else
            return Number((100 * value).toFixed(4))
    }

    return (
       <React.Fragment>
        <div className={styles.title}>Filter</div>
        <div className={styles.wrapper}>
            {/* <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.Q}
                // className={styles.Q}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Q'}
                removePropertyLock={removeEffectPropertyLocks.Q}
                max={Q[1][1]}
                midiLearn={() => { }}
                min={Q[1][0]}
                type={'knob'}
                curve={Q[4]}
                unit={Q[2]}
                value={getPropertyValue('Q')}
                indicatorId={`instrument${trackId}:effect${fxId}:Q`}
                valueUpdateCallback={propertyUpdateCallbacks.Q}
            />
            <div className={styles.doubleKnob}>
                <div className={styles.block}>
                    <ContinuousIndicator
                        ccMouseCalculationCallback={calcCallbacks.detune}
                        selectedLock={false}
                        tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                        label={'Detune'}
                        removePropertyLock={removeEffectPropertyLocks.detune}
                        max={detune[1][1]}
                        midiLearn={() => { }}
                        min={detune[1][0]}
                        type={'knob'}
                        curve={detune[4]}
                        unit={detune[2]}
                        value={getPropertyValue('detune')}
                        indicatorId={`instrument${trackId}:effect${fxId}:detune`}
                        valueUpdateCallback={propertyUpdateCallbacks.detune}
                    />
                <SteppedIndicator
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    ccMouseCalculationCallback={calcCallbacks.rolloff}
                    label={'Rolloff'}
                    className={styles.steppedKnob}
                    titleClassName={styles.titleClass}
                    midiLearn={() => { }}
                    options={rolloff[1]}
                    selected={
                        selected && selected.length > 1 && !parameterLockValues.rolloff[0] && !parameterLockValues.rolloff[2]
                            ? '*'
                            : parameterLockValues.rolloff[0]
                                ? parameterLockValues.rolloff[1]
                                : getNested(options, 'rolloff')[0]
                    }
                    unit={''}
                    valueUpdateCallback={propertyUpdateCallbacks.rolloff}
                />
                </div>
                <div className={styles.block}>
                    <ContinuousIndicator
                        ccMouseCalculationCallback={calcCallbacks.frequency}
                        selectedLock={false}
                        tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                        label={'Frequency'}
                        removePropertyLock={removeEffectPropertyLocks.frequency}
                        max={frequency[1][1]}
                        midiLearn={() => { }}
                        min={frequency[1][0]}
                        type={'knob'}
                        curve={frequency[4]}
                        unit={frequency[2]}
                        value={getPropertyValue('frequency')}
                        indicatorId={`instrument${trackId}:effect${fxId}:frequency`}
                        valueUpdateCallback={propertyUpdateCallbacks.frequency}
                />
                <SteppedIndicator
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    ccMouseCalculationCallback={calcCallbacks.type}
                    label={'Type'}
                    className={styles.steppedKnob}
                    titleClassName={styles.titleClass}
                    midiLearn={() => { }}
                    options={type[1]}
                    selected={
                        selected && selected.length > 1 && !parameterLockValues.type[0] && !parameterLockValues.type[2]
                            ? '*'
                            : parameterLockValues.type[0]
                                ? parameterLockValues.type[1]
                                : getNested(options, 'type')[0]
                    }
                    unit={''}
                    valueUpdateCallback={propertyUpdateCallbacks.type}
                />
                </div>
                <ContinuousIndicator
                    ccMouseCalculationCallback={calcCallbacks.gain}
                    selectedLock={false}
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    label={'Gain'}
                    className={styles.gain}
                    removePropertyLock={removeEffectPropertyLocks.gain}
                    max={gain[1][1]}
                    midiLearn={() => { }}
                    min={gain[1][0]}
                    type={'knob'}
                    curve={gain[4]}
                    unit={gain[2]}
                    value={getPropertyValue('gain')}
                    indicatorId={`instrument${trackId}:effect${fxId}:gain`}
                    valueUpdateCallback={propertyUpdateCallbacks.gain}
                />
            </div> */}
                <SteppedIndicator
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    ccMouseCalculationCallback={calcCallbacks.type}
                    label={'Type'}
                    className={styles.steppedKnob}
                    titleClassName={styles.titleClass}
                    midiLearn={() => { }}
                    options={type[1]}
                    selected={
                        selected && selected.length > 1 && !parameterLockValues.type[0] && !parameterLockValues.type[2]
                            ? '*'
                            : parameterLockValues.type[0]
                                ? parameterLockValues.type[1]
                                : getNested(options, 'type')[0]
                    }
                    unit={''}
                    valueUpdateCallback={propertyUpdateCallbacks.type}
                />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.Q}
                // className={styles.Q}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Q'}
                removePropertyLock={removeEffectPropertyLocks.Q}
                max={Q[1][1]}
                midiLearn={() => { }}
                min={Q[1][0]}
                type={'knob'}
                curve={Q[4]}
                unit={Q[2]}
                value={getPropertyValue('Q')}
                indicatorId={`instrument${trackId}:effect${fxId}:Q`}
                valueUpdateCallback={propertyUpdateCallbacks.Q}
            />
                    <ContinuousIndicator
                        ccMouseCalculationCallback={calcCallbacks.detune}
                        selectedLock={false}
                        tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                        label={'Detune'}
                        removePropertyLock={removeEffectPropertyLocks.detune}
                        max={detune[1][1]}
                        midiLearn={() => { }}
                        min={detune[1][0]}
                        type={'knob'}
                        curve={detune[4]}
                        unit={detune[2]}
                        value={getPropertyValue('detune')}
                        indicatorId={`instrument${trackId}:effect${fxId}:detune`}
                        valueUpdateCallback={propertyUpdateCallbacks.detune}
                    />

                    <ContinuousIndicator
                        ccMouseCalculationCallback={calcCallbacks.frequency}
                        selectedLock={false}
                        tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                        label={'Frequency'}
                        removePropertyLock={removeEffectPropertyLocks.frequency}
                        max={frequency[1][1]}
                        midiLearn={() => { }}
                        min={frequency[1][0]}
                        type={'knob'}
                        curve={frequency[4]}
                        unit={frequency[2]}
                        value={getPropertyValue('frequency')}
                        indicatorId={`instrument${trackId}:effect${fxId}:frequency`}
                        valueUpdateCallback={propertyUpdateCallbacks.frequency}
                />
                <ContinuousIndicator
                    ccMouseCalculationCallback={calcCallbacks.gain}
                    selectedLock={false}
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    label={'Gain'}
                    // className={styles.gain}
                    removePropertyLock={removeEffectPropertyLocks.gain}
                    max={gain[1][1]}
                    midiLearn={() => { }}
                    min={gain[1][0]}
                    type={'knob'}
                    curve={gain[4]}
                    unit={gain[2]}
                    value={getPropertyValue('gain')}
                    indicatorId={`instrument${trackId}:effect${fxId}:gain`}
                    valueUpdateCallback={propertyUpdateCallbacks.gain}
                />
                <SteppedIndicator
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    ccMouseCalculationCallback={calcCallbacks.rolloff}
                    label={'Rolloff'}
                    className={styles.steppedKnob}
                    titleClassName={styles.titleClass}
                    midiLearn={() => { }}
                    options={rolloff[1]}
                    selected={
                        selected && selected.length > 1 && !parameterLockValues.rolloff[0] && !parameterLockValues.rolloff[2]
                            ? '*'
                            : parameterLockValues.rolloff[0]
                                ? parameterLockValues.rolloff[1]
                                : getNested(options, 'rolloff')[0]
                    }
                    unit={''}
                    valueUpdateCallback={propertyUpdateCallbacks.rolloff}
                />
        </div>
       </React.Fragment>

    )
}

export default Filter;