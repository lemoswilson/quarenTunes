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

export interface GateProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    removeEffectPropertyLocks: any,
    ccMaps: any,
    midiLearn: (property: string) => void,
    propertyUpdateCallbacks: any,
    trackIndex: number,
    trackId: number,
    fxIndex: number,
    fxId: number,
    selected?: number[],
    events: event[],
    properties: any[];
}

const Gate: React.FC<GateProps> = ({
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
    const smoothing = options.smoothing;
    const threshold = options.threshold;

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
            <div className={styles.title}>Gate</div>
            <ContinuousIndicator
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                ccMouseCalculationCallback={calcCallbacks.smoothing}
                removePropertyLock={removeEffectPropertyLocks.smoothing}
                label={'Smoothing'}
                max={smoothing[1][1]}
                midiLearn={() => { midiLearn('smoothing') }}
                ccMap={getNested(ccMaps.current, 'smoothing')}
                min={smoothing[1][0]}
                type={'knob'}
                unit={smoothing[2]}
                value={getPropertyValue('smoothing')}
                indicatorId={`instrument${trackId}:effect${fxId}:smoothing`}
                // value={getPropertyValue('attack')}
                curve={smoothing[4]}
                valueUpdateCallback={propertyUpdateCallbacks.smoothing}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.threshold}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Threshold'}
                removePropertyLock={removeEffectPropertyLocks.threshold}
                max={threshold[1][1]}
                midiLearn={() => { midiLearn('threshold') }}
                ccMap={getNested(ccMaps.current, 'threshold')}
                min={threshold[1][0]}
                // detail={'envelopeZero'}
                type={'knob'}
                curve={threshold[4]}
                unit={threshold[2]}
                value={getPropertyValue('threshold')}
                indicatorId={`instrument${trackId}:effect${fxId}:threshold`}
                valueUpdateCallback={propertyUpdateCallbacks.threshold}
            />
        </div>
    )
}

export default Gate;