import React, { useMemo } from 'react';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer';
import { widgetTabIndexTrkStart, trackMax} from '../../../../containers/Track/defaults';
import SteppedIndicator from '../../SteppedIndicator';

export interface DistortionProps {
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

const Distortion: React.FC<DistortionProps> = ({
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
    const distortion  = options.distortion;
    const oversample = options.oversample;

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
            <div className={styles.title}>Distortion</div>

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
            {/* <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.oversample}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Oversample'}
                removePropertyLock={removeEffectPropertyLocks.oversample}
                max={oversample[1][1]}
                midiLearn={() => { }}
                min={oversample[1][0]}
                type={'knob'}
                curve={oversample[4]}
                unit={oversample[2]}
                value={getPropertyValue('oversample')}
                indicatorId={`instrument${trackId}:effect${fxId}:oversample`}
                valueUpdateCallback={propertyUpdateCallbacks.oversample}
            /> */}
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.distortion}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Distortion'}
                removePropertyLock={removeEffectPropertyLocks.distortion}
                max={distortion[1][1]}
                midiLearn={() => { }}
                min={distortion[1][0]}
                type={'knob'}
                curve={distortion [4]}
                unit={distortion [2]}
                value={getPropertyValue('distortion')}
                indicatorId={`instrument${trackId}:effect${fxId}:distortion`}
                valueUpdateCallback={propertyUpdateCallbacks.distortion}
            />
            <SteppedIndicator
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                ccMouseCalculationCallback={calcCallbacks.oversample}
                label={'Oversample'}
                midiLearn={() => { }}
                options={oversample[1]}
                selected={
                    selected && selected.length > 1 && !parameterLockValues.oversample[0] && !parameterLockValues.stages[2]
                        ? '*'
                        : parameterLockValues.oversample[0]
                            ? parameterLockValues.oversample[1]
                            : getNested(options, 'oversample')[0]
                }
                unit={''}
                valueUpdateCallback={propertyUpdateCallbacks.oversample}
            />
        </div>

    )
}

export default Distortion;