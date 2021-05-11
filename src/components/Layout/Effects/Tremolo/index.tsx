import React, { useMemo } from 'react';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer';
import { widgetTabIndexTrkStart, trackMax} from '../../../../containers/Track/defaults';
import SteppedIndicator from '../../SteppedIndicator';
import WaveformSelector from '../../WaveformSelector';

export interface TremoloProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    removeEffectPropertyLocks: any,
    propertyUpdateCallbacks: any,
    ccMaps: any,
    midiLearn: (property: string) => void,
    trackIndex: number,
    trackId: number,
    fxId: number,
    fxIndex: number,
    selected?: number[],
    events: event[],
    properties: any[];
}

const Tremolo: React.FC<TremoloProps> = ({
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
    const depth  = options.depth;
    const frequency = options.frequency;
    const spread = options.spread;

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
            <div className={styles.title}>Tremolo</div>

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
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'frequency'}
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
            <WaveformSelector
                selectWaveform={(wave) => { propertyUpdateCallbacks.type(wave) }}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                selected={options.type[0]}
                square={true}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.depth}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Depth'}
                removePropertyLock={removeEffectPropertyLocks.depth}
                max={depth [1][1]}
                midiLearn={() => { midiLearn('depth') }}
                ccMap={getNested(ccMaps.current, 'depth')}
                min={depth [1][0]}
                type={'knob'}
                curve={depth [4]}
                unit={depth [2]}
                value={getPropertyValue('depth')}
                indicatorId={`instrument${trackId}:effect${fxId}:depth`}
                valueUpdateCallback={propertyUpdateCallbacks.depth}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.spread}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Spread'}
                removePropertyLock={removeEffectPropertyLocks.spread}
                max={spread[1][1]}
                midiLearn={() => { midiLearn('spread') }}
                ccMap={getNested(ccMaps.current, 'spread')}
                min={spread[1][0]}
                type={'knob'}
                curve={spread[4]}
                unit={spread[2]}
                value={getPropertyValue('spread')}
                indicatorId={`instrument${trackId}:effect${fxId}:spread`}
                valueUpdateCallback={propertyUpdateCallbacks.spread}
            />
        </div>

    )
}

export default Tremolo;