import React, { useMemo } from 'react';
// import { updateEnvelopeCurve } from '../../../../store/Track';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
// import CurveSelector from '../../CurveSelector';
import { useDispatch } from 'react-redux';
// import SteppedIndicator from '../../SteppedIndicator';
import { event } from '../../../../store/Sequencer';
import { widgetTabIndexTrkStart, trackMax} from '../../../../containers/Track/defaults';

export interface FeedbackDelayProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    removeEffectPropertyLocks: any,
    ccMaps: any,
    midiLearn: (property: string) => void,
    propertyUpdateCallbacks: any,
    trackIndex: number,
    trackId: number,
    fxId: number,
    fxIndex: number,
    selected?: number[],
    events: event[],
    properties: any[];
}

const FeedbackDelay: React.FC<FeedbackDelayProps> = ({
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
    const maxDelay = options.maxDelay;
    const delayTime = options.delayTime;
    const feedback = options.feedback;

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
            <div className={styles.title}>FeedDelay</div>
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
                // detail={'envelopeZero'}
                type={'knob'}
                curve={wet[4]}
                unit={wet[2]}
                value={getPropertyValue('wet')}
                indicatorId={`instrument${trackId}:effect${fxId}:wet`}
                valueUpdateCallback={propertyUpdateCallbacks.wet}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.maxDelay}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'MaxDelay'}
                removePropertyLock={removeEffectPropertyLocks.maxDelay}
                max={maxDelay[1][1]}
                midiLearn={() => { midiLearn('maxDelay') }}
                ccMap={getNested(ccMaps.current, 'maxDelay')}
                min={maxDelay[1][0]}
                // detail={'envelopeZero'}
                type={'knob'}
                curve={maxDelay[4]}
                unit={maxDelay[2]}
                value={getPropertyValue('maxDelay')}
                indicatorId={`instrument${trackId}:effect${fxId}:maxDelay`}
                valueUpdateCallback={propertyUpdateCallbacks.maxDelay}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.delayTime}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'DelayTime'}
                removePropertyLock={removeEffectPropertyLocks.delayTime}
                max={delayTime[1][1]}
                midiLearn={() => { midiLearn('delayTime') }}
                ccMap={getNested(ccMaps.current, 'delayTime')}
                min={delayTime[1][0]}
                // detail={'envelopeZero'}
                type={'knob'}
                curve={delayTime[4]}
                unit={delayTime[2]}
                value={getPropertyValue('delayTime')}
                indicatorId={`instrument${trackId}:effect${fxId}:delayTime`}
                valueUpdateCallback={propertyUpdateCallbacks.delayTime}
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
                // detail={'envelopeZero'}
                type={'knob'}
                curve={feedback[4]}
                unit={feedback[2]}
                value={getPropertyValue('feedback')}
                indicatorId={`instrument${trackId}:effect${fxId}:feedback`}
                valueUpdateCallback={propertyUpdateCallbacks.feedback}
            />
        </div>
    )
}

export default FeedbackDelay;