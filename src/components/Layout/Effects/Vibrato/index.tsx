import React, { useMemo } from 'react';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer';
import { widgetTabIndexTrkStart, trackMax} from '../../../../containers/Track/defaults';
import SteppedIndicator from '../../SteppedIndicator';
import WaveformSelector from '../../WaveformSelector';

export interface VibratoProps {
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

const Vibrato: React.FC<VibratoProps> = ({
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

    const wet = options.wet;
    const frequency = options.frequency;
    const depth = options.depth;
    const spread = options.spread;
    const maxDelay = options.maxDelay

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
        <div className={styles.title}>Vibrato</div>
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
                    midiLearn={() => { }}
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
                    midiLearn={() => { }}
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
                        midiLearn={() => { }}
                        min={depth[1][0]}
                        type={'knob'}
                        curve={depth[4]}
                        unit={depth[2]}
                        value={getPropertyValue('depth')}
                        indicatorId={`instrument${trackId}:effect${fxId}:depth`}
                        valueUpdateCallback={propertyUpdateCallbacks.depth}
                    />

                    {/* <ContinuousIndicator
                        ccMouseCalculationCallback={calcCallbacks.spread}
                        selectedLock={false}
                        tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                        label={'Spread'}
                        className={styles.knob}
                        removePropertyLock={removeEffectPropertyLocks.spread}
                        max={spread[1][1]}
                        midiLearn={() => { }}
                        min={spread[1][0]}
                        type={'knob'}
                        curve={spread[4]}
                        unit={spread[2]}
                        value={getPropertyValue('spread')}
                        indicatorId={`instrument${trackId}:effect${fxId}:spread`}
                        valueUpdateCallback={propertyUpdateCallbacks.spread}
                    />        */}
                </div> 
            </div>
            <div className={styles.mid}>
                <WaveformSelector
                    selectWaveform={(wave) => { propertyUpdateCallbacks.type(wave) }}
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    selected={options.type[0]}
                />
            </div>
            <div className={styles.doubleKnob}>
                <div className={styles.block}>
                <ContinuousIndicator
                    ccMouseCalculationCallback={calcCallbacks.maxDelay}
                    selectedLock={false}
                    tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                    label={'maxDelay'}
                    removePropertyLock={removeEffectPropertyLocks.maxDelay}
                    max={maxDelay[1][1]}
                    midiLearn={() => { }}
                    min={maxDelay[1][0]}
                    type={'knob'}
                    curve={maxDelay[4]}
                    unit={maxDelay[2]}
                    value={getPropertyValue('maxDelay')}
                    indicatorId={`instrument${trackId}:effect${fxId}:maxDelay`}
                    valueUpdateCallback={propertyUpdateCallbacks.maxDelay}
                />
                </div>
                <div className={styles.block}>
                    <ContinuousIndicator
                        ccMouseCalculationCallback={calcCallbacks.spread}
                        selectedLock={false}
                        tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                        label={'Spread'}
                        // className={styles.knob}
                        removePropertyLock={removeEffectPropertyLocks.spread}
                        max={spread[1][1]}
                        midiLearn={() => { }}
                        min={spread[1][0]}
                        type={'knob'}
                        curve={spread[4]}
                        unit={spread[2]}
                        value={getPropertyValue('spread')}
                        indicatorId={`instrument${trackId}:effect${fxId}:spread`}
                        valueUpdateCallback={propertyUpdateCallbacks.spread}
                    />       
                </div>
            </div>
        </div>
       </React.Fragment>

    )
}

export default Vibrato;