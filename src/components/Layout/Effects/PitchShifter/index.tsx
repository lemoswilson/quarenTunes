import React, { useMemo } from 'react';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer';
import { widgetTabIndexTrkStart, trackMax} from '../../../../containers/Track/defaults';
import SteppedIndicator from '../../SteppedIndicator';

export interface PitchShifterProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    removeEffectPropertyLocks: any,
    propertyUpdateCallbacks: any,
    trackIndex: number,
    ccMaps: any,
    midiLearn: (property: string) => void,
    trackId: number,
    fxId: number,
    fxIndex: number,
    selected?: number[],
    events: event[],
    properties: any[];
}

const PitchShifter: React.FC<PitchShifterProps> = ({
    calcCallbacks,
    options,
    propertyUpdateCallbacks,
    removeEffectPropertyLocks,
    trackIndex,
    trackId,
    ccMaps,
    midiLearn,
    fxIndex,
    fxId,
    events,
    properties,
    selected,
}) => {

    const wet = options.wet;
    const feedback = options.feedback;
    const pitch = options.pitch;
    const delayTime = options.delayTime;
    const windowSize = options.windowSize

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
            <div className={styles.title}>PitchShifter</div>

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
                ccMouseCalculationCallback={calcCallbacks.pitch}
                selectedLock={false}
                detail={'detune'}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Pitch'}
                removePropertyLock={removeEffectPropertyLocks.pitch}
                max={pitch[1][1]}
                midiLearn={() => { midiLearn('detune') }}
                ccMap={getNested(ccMaps.current, 'detune')}
                min={pitch[1][0]}
                type={'knob'}
                curve={pitch[4]}
                unit={pitch[2]}
                value={getPropertyValue('pitch')}
                indicatorId={`instrument${trackId}:effect${fxId}:pitch`}
                valueUpdateCallback={propertyUpdateCallbacks.pitch}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.feedback}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Feedback'}
                removePropertyLock={removeEffectPropertyLocks.feedback}
                max={feedback[1][1]}
                midiLearn={() => { midiLearn('feedback') }}
                ccMap={getNested(ccMaps.current, 'feedback')}
                min={feedback[1][0]}
                type={'knob'}
                curve={feedback[4]}
                unit={feedback[2]}
                value={getPropertyValue('feedback')}
                indicatorId={`instrument${trackId}:effect${fxId}:feedback`}
                valueUpdateCallback={propertyUpdateCallbacks.feedback}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.delayTime}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'delayTime'}
                removePropertyLock={removeEffectPropertyLocks.delayTime}
                max={delayTime[1][1]}
                midiLearn={() => { midiLearn('delayTime') }}
                ccMap={getNested(ccMaps.current, 'delayTime')}
                min={delayTime[1][0]}
                type={'knob'}
                curve={delayTime[4]}
                unit={delayTime[2]}
                value={getPropertyValue('delayTime')}
                indicatorId={`instrument${trackId}:effect${fxId}:delayTime`}
                valueUpdateCallback={propertyUpdateCallbacks.delayTime}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.windowSize}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'windowSize'}
                removePropertyLock={removeEffectPropertyLocks.windowSize}
                max={windowSize[1][1]}
                midiLearn={() => { midiLearn('windowSize') }}
                ccMap={getNested(ccMaps.current, 'windowSize')}
                min={windowSize[1][0]}
                type={'knob'}
                curve={windowSize[4]}
                unit={windowSize[2]}
                value={getPropertyValue('windowSize')}
                indicatorId={`instrument${trackId}:effect${fxId}:windowSize`}
                valueUpdateCallback={propertyUpdateCallbacks.windowSize}
            />
        </div>

    )
}

export default PitchShifter;