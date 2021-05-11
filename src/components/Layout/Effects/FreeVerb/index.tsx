import React, { useMemo } from 'react';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer';
import { widgetTabIndexTrkStart, trackMax} from '../../../../containers/Track/defaults';

export interface FreeVerbProps {
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

const FreeVerb: React.FC<FreeVerbProps> = ({
    calcCallbacks,
    options,
    propertyUpdateCallbacks,
    removeEffectPropertyLocks,
    trackIndex,
    ccMaps,
    midiLearn,
    trackId,
    fxIndex,
    fxId,
    events,
    properties,
    selected,
}) => {

    const wet = options.wet;
    const roomSize = options.roomSize;
    const dampening = options.dampening;

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
            <div className={styles.title}>FreeVerb</div>

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
                ccMouseCalculationCallback={calcCallbacks.dampening}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Dampening'}
                removePropertyLock={removeEffectPropertyLocks.dampening}
                max={dampening[1][1]}
                midiLearn={() => { midiLearn('dampening') }}
                ccMap={getNested(ccMaps.current, 'dampening')}
                min={dampening[1][0]}
                type={'knob'}
                curve={dampening[4]}
                unit={dampening[2]}
                value={getPropertyValue('dampening')}
                indicatorId={`instrument${trackId}:effect${fxId}:dampening`}
                valueUpdateCallback={propertyUpdateCallbacks.dampening}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.roomSize}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'RoomSize'}
                removePropertyLock={removeEffectPropertyLocks.roomSize}
                max={roomSize[1][1]}
                midiLearn={() => { }}
                min={roomSize[1][0]}
                type={'knob'}
                curve={roomSize[4]}
                unit={roomSize[2]}
                value={getPropertyValue('roomSize')}
                indicatorId={`instrument${trackId}:effect${fxId}:roomSize`}
                valueUpdateCallback={propertyUpdateCallbacks.roomSize}
            />
        </div>
    )
}

export default FreeVerb;