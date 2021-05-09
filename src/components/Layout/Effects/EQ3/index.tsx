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

export interface EQ3Props {
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

const EQ3: React.FC<EQ3Props> = ({
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
    const high = options.high;
    const mid = options.mid;
    const low = options.low;
    const lowFrequency = options.lowFrequency;
    const highFrequency = options.highFrequency;

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

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>EQ3</div>
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.lowFrequency}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'LowFreq'}
                removePropertyLock={removeEffectPropertyLocks.lowFrequency}
                max={lowFrequency[1][1]}
                midiLearn={() => { }}
                min={lowFrequency[1][0]}
                // keyFunction={getPercentage}
                // detail={'envelopeZero'}
                type={'knob'}
                curve={lowFrequency[4]}
                unit={lowFrequency[2]}
                value={getPropertyValue('lowFrequency')}
                indicatorId={`instrument${trackId}:effect${fxId}:lowFrequency`}
                valueUpdateCallback={propertyUpdateCallbacks.lowFrequency}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.low}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'LowGain'}
                removePropertyLock={removeEffectPropertyLocks.low}
                max={low[1][1]}
                midiLearn={() => { }}
                min={low[1][0]}
                detail={'detune'}
                // keyFunction={getPercentage}
                // detail={'envelopeZero'}
                type={'knob'}
                curve={low[4]}
                unit={low[2]}
                value={getPropertyValue('low')}
                indicatorId={`instrument${trackId}:effect${fxId}:low`}
                valueUpdateCallback={propertyUpdateCallbacks.low}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.mid}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'MidGain'}
                removePropertyLock={removeEffectPropertyLocks.mid}
                max={mid[1][1]}
                midiLearn={() => { }}
                min={mid[1][0]}
                detail={'detune'}
                // detail={'envelopeZero'}
                type={'knob'}
                curve={mid[4]}
                unit={mid[2]}
                value={getPropertyValue('mid')}
                indicatorId={`instrument${trackId}:effect${fxId}:mid`}
                valueUpdateCallback={propertyUpdateCallbacks.mid}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.highFrequency}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'HighFreq'}
                removePropertyLock={removeEffectPropertyLocks.highFrequency}
                max={highFrequency[1][1]}
                midiLearn={() => { }}
                min={highFrequency[1][0]}
                // keyFunction={getPercentage}
                // detail={'envelopeZero'}
                type={'knob'}
                curve={highFrequency[4]}
                unit={highFrequency[2]}
                value={getPropertyValue('highFrequency')}
                indicatorId={`instrument${trackId}:effect${fxId}:highFrequency`}
                valueUpdateCallback={propertyUpdateCallbacks.highFrequency}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.high}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'HighGain'}
                removePropertyLock={removeEffectPropertyLocks.high}
                detail={'detune'}
                max={high[1][1]}
                midiLearn={() => { }}
                min={high[1][0]}
                // keyFunction={getPercentage}
                // detail={'envelopeZero'}
                type={'knob'}
                curve={high[4]}
                unit={high[2]}
                value={getPropertyValue('high')}
                indicatorId={`instrument${trackId}:effect${fxId}:high`}
                valueUpdateCallback={propertyUpdateCallbacks.high}
            />

        </div>
    )
}

export default EQ3;