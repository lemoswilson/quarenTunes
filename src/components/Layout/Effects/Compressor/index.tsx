import React, { useMemo } from 'react';
// import { updateEnvelopeCurve } from '../../../../store/Track';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
// import CurveSelector from '../../CurveSelector';
import { useDispatch } from 'react-redux';
// import SteppedIndicator from '../../SteppedIndicator';
import { event } from '../../../../store/Sequencer';

export interface CompressorProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    removeEffectPropertyLocks: any,
    propertyUpdateCallbacks: any,
    trackIndex: number,
    fxIndex: number,
    selected: number[],
    events: event[],
    properties: any[];
}

const Compressor: React.FC<CompressorProps> = ({
    calcCallbacks,
    options,
    propertyUpdateCallbacks,
    removeEffectPropertyLocks,
    trackIndex,
    fxIndex,
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
            const selectedPropertyArray = selected.map(s => getNested(events[s].fx[fxIndex], property))

            const allValuesEqual =
                selected.length > 0
                    ? selectedPropertyArray.every((v, idx, arr) => v && v === arr[0])
                    : false;
            const noValuesInSelected =
                selected.length > 0
                    ? selectedPropertyArray.every(v => v === undefined)
                    : false;

            setNestedValue(
                property,
                [
                    allValuesEqual,
                    allValuesEqual ? selectedPropertyArray[0] : false,
                    noValuesInSelected
                ],
                o,
            )
        })
        return o
    }, [properties, selected, events])


    const getPropertyValue = (property: string): number | '*' => {
        const pmValues: (number | boolean | string)[] = getNested(parameterLockValues, property)
        return selected.length > 1 && !pmValues[0] && !pmValues[2]
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
                ccMouseCalculationCallback={calcCallbacks.attack}
                removePropertyLock={removeEffectPropertyLocks.attack}
                label={'Attack'}
                max={attack[1][1]}
                midiLearn={() => { }}
                min={attack[1][0]}
                type={'knob'}
                unit={attack[2]}
                value={getPropertyValue('attack')}
                indicatorId={`instrument${trackIndex}:effect${fxIndex}:attack`}
                // value={getPropertyValue('attack')}
                curve={attack[4]}
                valueUpdateCallback={propertyUpdateCallbacks.attack}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.ratio}
                selectedLock={false}
                removePropertyLock={removeEffectPropertyLocks.ration}
                label={'Ratio'}
                max={ratio[1][1]}
                midiLearn={() => { }}
                curve={ratio[4]}
                min={ratio[1][0]}
                type={'knob'}
                unit={ratio[2]}
                value={getPropertyValue('ratio')}
                indicatorId={`instrument${trackIndex}:effect${fxIndex}:ratio`}
                valueUpdateCallback={propertyUpdateCallbacks.ratio}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.threshold}
                selectedLock={false}
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
                indicatorId={`instrument${trackIndex}:effect${fxIndex}:threshold`}
                valueUpdateCallback={propertyUpdateCallbacks.threshold}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.release}
                selectedLock={false}
                label={'Release'}
                removePropertyLock={removeEffectPropertyLocks.release}
                max={release[1][1]}
                midiLearn={() => { }}
                min={release[1][0]}
                curve={release[4]}
                type={'knob'}
                unit={release[2]}
                value={getPropertyValue('release')}
                indicatorId={`instrument${trackIndex}:effect${fxIndex}:release`}
                valueUpdateCallback={propertyUpdateCallbacks.release}
            />
            <ContinuousIndicator
                ccMouseCalculationCallback={calcCallbacks.knee}
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
                indicatorId={`instrument${trackIndex}:effect${fxIndex}:knee`}
                valueUpdateCallback={propertyUpdateCallbacks.knee}
            // detail={'envelopeZero'}
            />
        </div>
    )
}

export default Compressor;