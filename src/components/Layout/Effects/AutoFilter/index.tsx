import React, { useMemo } from 'react';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer';
import { widgetTabIndexTrkStart, trackMax} from '../../../../containers/Track/defaults';
import SteppedIndicator from '../../SteppedIndicator';
import WaveformSelector from '../../WaveformSelector';
import { effectLayoutProps } from '../../../../containers/Track/Effects'

export interface AutoFilterProps {
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

const AutoFilter: React.FC<effectLayoutProps> = ({
    calcCallbacks,
    options,
    propertyUpdateCallbacks,
    removeEffectPropertyLocks,
    ccMaps,
    midiLearn,
    trackIndex,
    trackId,
    fxIndex,
    fxId,
    events,
    properties,
    selected,
}) => {

    const wet = options.wet;
    const frequency = options.frequency;
    const depth = options.depth;
    const octaves = options.octaves;
    const baseFreq = options.baseFrequency;
    const rolloff = options.filter.rolloff;
    const Q = options.filter.Q;
    const type = options.filter.type;

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
        <div className={styles.title}>AutoFilter</div>
        <div className={styles.wrapper}>
            <div className={`${styles.doubleKnob} ${styles.marginleft}`}>
               <div className={styles.block}>
                <ContinuousIndicator
                    ccMouseCalculationCallback={calcCallbacks.wet}
                    selectedLock={false}
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    label={'DryWet'}
                    removePropertyLock={removeEffectPropertyLocks.wet}
                    max={wet[1][1]}
                    midiLearn={() => { midiLearn('wet') }}
                    ccMap={getNested(ccMaps.current, 'wet')}
                    min={wet[1][0]}
                    keyFunction={getPercentage}
                    type={'knob'}
                    curve={wet[4]}
                    unit={wet[2]}
                    value={getPropertyValue('wet')}
                    indicatorId={`instrument${trackId}:effect${fxId}:wet`}
                    valueUpdateCallback={propertyUpdateCallbacks.wet}
                />
                <ContinuousIndicator
                    ccMouseCalculationCallback={calcCallbacks.frequency}
                    className={styles.knob}
                    selectedLock={false}
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    label={'Frequency'}
                    removePropertyLock={removeEffectPropertyLocks.frequency}
                    max={frequency[1][1]}
                    midiLearn={() => { midiLearn('frequency') }}
                    ccMap={getNested(ccMaps.current, 'frequency')}
                    min={frequency[1][0]}
                    type={'knob'}
                    curve={frequency[4]}
                    unit={frequency[2]}
                    value={getPropertyValue('frequency')}
                    indicatorId={`instrument${trackId}:effect${fxId}:frequency`}
                    valueUpdateCallback={propertyUpdateCallbacks.frequency}
                />
               </div>
               <div className={styles.block}>
                    <ContinuousIndicator
                        ccMouseCalculationCallback={calcCallbacks.depth}
                        selectedLock={false}
                        tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                        label={'Depth'}
                        removePropertyLock={removeEffectPropertyLocks.depth}
                        max={depth[1][1]}
                        midiLearn={() => { midiLearn('depth') }}
                        ccMap={getNested(ccMaps.current, 'depth')}
                        min={depth[1][0]}
                        type={'knob'}
                        curve={depth[4]}
                        unit={depth[2]}
                        value={getPropertyValue('depth')}
                        indicatorId={`instrument${trackId}:effect${fxId}:depth`}
                        valueUpdateCallback={propertyUpdateCallbacks.depth}
                    />

                    <ContinuousIndicator
                        ccMouseCalculationCallback={calcCallbacks.octaves}
                        selectedLock={false}
                        tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                        label={'Octaves'}
                        className={styles.knob}
                        removePropertyLock={removeEffectPropertyLocks.octaves}
                        max={octaves[1][1]}
                        midiLearn={() => { midiLearn('octaves') }}
                        ccMap={getNested(ccMaps.current, 'octaves')}
                        min={octaves[1][0]}
                        type={'knob'}
                        curve={octaves[4]}
                        unit={octaves[2]}
                        value={getPropertyValue('octaves')}
                        indicatorId={`instrument${trackId}:effect${fxId}:octaves`}
                        valueUpdateCallback={propertyUpdateCallbacks.octaves}
                    />       
                </div> 
            </div>
            <div className={styles.mid}>
                <WaveformSelector
                    selectWaveform={(wave) => { propertyUpdateCallbacks.type(wave) }}
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    selected={options.type[0]}
                    square={true}
                />
            </div>
            <div className={styles.doubleKnob}>
                <div className={styles.block}>
                    <ContinuousIndicator
                        ccMouseCalculationCallback={calcCallbacks.baseFrequency}
                        selectedLock={false}
                        tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                        label={'baseFreq'}
                        removePropertyLock={removeEffectPropertyLocks.baseFrequency}
                        max={baseFreq[1][1]}
                        midiLearn={() => { midiLearn('baseFrequency') }}
                        ccMap={getNested(ccMaps.current, 'baseFrequency')}
                        min={baseFreq[1][0]}
                        type={'knob'}
                        curve={baseFreq[4]}
                        unit={baseFreq[2]}
                        value={getPropertyValue('baseFrequency')}
                        indicatorId={`instrument${trackId}:effect${fxId}:baseFrequency`}
                        valueUpdateCallback={propertyUpdateCallbacks.baseFrequency}
                />
                <SteppedIndicator
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    ccMouseCalculationCallback={calcCallbacks.filter.rolloff}
                    label={'Rolloff'}
                    className={styles.steppedKnob}
                    titleClassName={styles.titleClass}
                    midiLearn={() => { }}
                    options={rolloff[1]}
                    selected={
                        selected && selected.length > 1 && !parameterLockValues.filter.rolloff[0] && !parameterLockValues.filter.rolloff[2]
                            ? '*'
                            : parameterLockValues.filter.rolloff[0]
                                ? parameterLockValues.filter.rolloff[1]
                                : getNested(options, 'filter.rolloff')[0]
                    }
                    unit={''}
                    valueUpdateCallback={propertyUpdateCallbacks.filter.rolloff}
                />
                </div>
                <div className={styles.block}>
                    <ContinuousIndicator
                        ccMouseCalculationCallback={calcCallbacks.filter.Q}
                        selectedLock={false}
                        tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                        label={'Q'}
                        removePropertyLock={removeEffectPropertyLocks.filter.Q}
                        max={Q[1][1]}
                        midiLearn={() => { midiLearn('filter.Q') }}
                        ccMap={getNested(ccMaps.current, 'filter.Q')}
                        min={Q[1][0]}
                        type={'knob'}
                        curve={Q[4]}
                        unit={Q[2]}
                        value={getPropertyValue('filter.Q')}
                        indicatorId={`instrument${trackId}:effect${fxId}:filter.Q`}
                        valueUpdateCallback={propertyUpdateCallbacks.filter.Q}
                />
                <SteppedIndicator
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    ccMouseCalculationCallback={calcCallbacks.filter.type}
                    label={'type'}
                    className={styles.steppedKnob}
                    titleClassName={styles.titleClass}
                    midiLearn={() => { }}
                    options={type[1]}
                    selected={
                        selected && selected.length > 1 && !parameterLockValues.filter.type[0] && !parameterLockValues.filter.type[2]
                            ? '*'
                            : parameterLockValues.filter.type[0]
                                ? parameterLockValues.filter.type[1]
                                : getNested(options, 'filter.type')[0]
                    }
                    unit={''}
                    valueUpdateCallback={propertyUpdateCallbacks.filter.type}
                />
                </div>
            </div>
        </div>
       </React.Fragment>

    )
}

export default AutoFilter;