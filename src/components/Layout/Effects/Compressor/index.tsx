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

export interface CompressorProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    removeEffectPropertyLocks: any,
    propertyUpdateCallbacks: any,
    trackIndex: number,
    trackId: number,
    fxIndex: number,
    fxId: number,
    selected?: number[],
    events: event[],
    properties: any[];
}

const Compressor: React.FC<CompressorProps> = ({
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
    const dispatch = useDispatch()
    const attack = options.attack;
    const ratio = options.ratio;
    const threshold = options.threshold;
    const release = options.release;
    const knee = options.knee;

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
            <div className={styles.title}>Compressor</div>
            <ContinuousIndicator
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                ccMouseCalculationCallback={calcCallbacks.attack}
                removePropertyLock={removeEffectPropertyLocks.attack}
                label={'Attack'}
                max={attack[1][1]}
                midiLearn={() => { }}
                min={attack[1][0]}
                type={'knob'}
                unit={attack[2]}
                value={getPropertyValue('attack')}
                indicatorId={`instrument${trackId}:effect${fxId}:attack`}
                // value={getPropertyValue('attack')}
                curve={attack[4]}
                valueUpdateCallback={propertyUpdateCallbacks.attack}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.ratio}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                selectedLock={false}
                removePropertyLock={removeEffectPropertyLocks.ratio}
                label={'Ratio'}
                max={ratio[1][1]}
                midiLearn={() => { }}
                curve={ratio[4]}
                min={ratio[1][0]}
                type={'knob'}
                unit={ratio[2]}
                value={getPropertyValue('ratio')}
                indicatorId={`instrument${trackId}:effect${fxId}:ratio`}
                valueUpdateCallback={propertyUpdateCallbacks.ratio}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.threshold}
                selectedLock={false}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                label={'Threshold'}
                removePropertyLock={removeEffectPropertyLocks.threshold}
                max={threshold[1][1]}
                midiLearn={() => { }}
                min={threshold[1][0]}
                // detail={'envelopeZero'}
                type={'knob'}
                curve={threshold[4]}
                unit={threshold[2]}
                value={getPropertyValue('threshold')}
                indicatorId={`instrument${trackId}:effect${fxId}:threshold`}
                valueUpdateCallback={propertyUpdateCallbacks.threshold}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.release}
                selectedLock={false}
                label={'Release'}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                removePropertyLock={removeEffectPropertyLocks.release}
                max={release[1][1]}
                midiLearn={() => { }}
                min={release[1][0]}
                curve={release[4]}
                type={'knob'}
                unit={release[2]}
                value={getPropertyValue('release')}
                indicatorId={`instrument${trackId}:effect${fxId}:release`}
                valueUpdateCallback={propertyUpdateCallbacks.release}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.knee}
                tabIndex={widgetTabIndexTrkStart + trackMax + fxIndex + 1}
                selectedLock={false}
                label={'Knee'}
                removePropertyLock={removeEffectPropertyLocks.knee}
                max={knee[1][1]}
                midiLearn={() => { }}
                min={knee[1][0]}
                type={'knob'}
                curve={knee[4]}
                unit={knee[2]}
                value={getPropertyValue('knee')}
                indicatorId={`instrument${trackId}:effect${fxId}:knee`}
                valueUpdateCallback={propertyUpdateCallbacks.knee}
            // detail={'envelopeZero'}
            />
        </div>
    )
}

export default Compressor;