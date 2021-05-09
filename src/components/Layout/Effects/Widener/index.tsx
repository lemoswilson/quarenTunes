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

export interface WidenerProps {
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

const Widener: React.FC<WidenerProps> = ({
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
    const width = options.width;

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
            <div className={styles.title}>Widener</div>
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
                // detail={'envelopeZero'}
                type={'knob'}
                curve={wet[4]}
                unit={wet[2]}
                value={getPropertyValue('wet')}
                indicatorId={`instrument${trackId}:effect${fxId}:wet`}
                valueUpdateCallback={propertyUpdateCallbacks.wet}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.width}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Width'}
                removePropertyLock={removeEffectPropertyLocks.width}
                max={width[1][1]}
                midiLearn={() => { }}
                min={width[1][0]}
                // detail={'envelopeZero'}
                type={'knob'}
                curve={width[4]}
                unit={width[2]}
                value={getPropertyValue('width')}
                indicatorId={`instrument${trackId}:effect${fxId}:width`}
                valueUpdateCallback={propertyUpdateCallbacks.width}
            />
        </div>
    )
}

export default Widener;