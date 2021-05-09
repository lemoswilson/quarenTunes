import React, { useMemo } from 'react';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer';
import { widgetTabIndexTrkStart, trackMax} from '../../../../containers/Track/defaults';
import SteppedIndicator from '../../SteppedIndicator';

export interface PhaserProps {
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

const Phaser: React.FC<PhaserProps> = ({
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
    const stages = options.stages;
    const frequency = options.frequency;
    const octaves = options.octaves;
    const baseFreq = options.baseFrequency;
    const Q = options.Q

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
        <div className={styles.wrapper}>
            <div className={styles.title}>Phaser</div>

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
                ccMouseCalculationCallback={calcCallbacks.octaves}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'octaves'}
                removePropertyLock={removeEffectPropertyLocks.octaves}
                max={octaves[1][1]}
                midiLearn={() => { }}
                min={octaves[1][0]}
                type={'knob'}
                curve={octaves[4]}
                unit={octaves[2]}
                value={getPropertyValue('octaves')}
                indicatorId={`instrument${trackId}:effect${fxId}:octaves`}
                valueUpdateCallback={propertyUpdateCallbacks.octaves}
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
                ccMouseCalculationCallback={calcCallbacks.baseFrequency}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'baseFreq'}
                removePropertyLock={removeEffectPropertyLocks.baseFrequency}
                max={baseFreq[1][1]}
                midiLearn={() => { }}
                min={baseFreq[1][0]}
                type={'knob'}
                curve={baseFreq[4]}
                unit={baseFreq[2]}
                value={getPropertyValue('baseFrequency')}
                indicatorId={`instrument${trackId}:effect${fxId}:baseFrequency`}
                valueUpdateCallback={propertyUpdateCallbacks.baseFrequency}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.Q}
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
            <SteppedIndicator
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                ccMouseCalculationCallback={calcCallbacks.stages}
                label={'stages'}
                midiLearn={() => { }}
                options={stages[1]}
                selected={
                    selected && selected.length > 1 && !parameterLockValues.stages[0] && !parameterLockValues.stages[2]
                        ? '*'
                        : parameterLockValues.stages[0]
                            ? parameterLockValues.stages[1]
                            : getNested(options, 'stages')[0]
                }
                unit={''}
                valueUpdateCallback={propertyUpdateCallbacks.stages}
            />
        </div>

    )
}

export default Phaser;