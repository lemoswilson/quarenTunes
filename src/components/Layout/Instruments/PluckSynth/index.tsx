import React, { useMemo } from 'react';
import { updateEnvelopeCurve } from '../../../../store/Track';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import CurveSelector from '../../CurveSelector';
import { useDispatch } from 'react-redux';
import SteppedIndicator from '../../SteppedIndicator';
import { event } from '../../../../store/Sequencer';
import { widgetTabIndexTrkStart } from '../../../../containers/Track/defaults';

export interface PluckSynthProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    propertyUpdateCallbacks: any,
    removePropertyLocks: any,
    index: number,
    trackId: number,
    selected?: number[],
    events: event[],
    properties: any[];
}

const PluckSynth: React.FC<PluckSynthProps> = ({
    calcCallbacks,
    options,
    removePropertyLocks,
    propertyUpdateCallbacks,
    index,
    trackId,
    events,
    properties,
    selected,
}) => {
    const dispatch = useDispatch()
    const attackNoise = options.attackNoise;
    const dampening = options.dampening;
    const resonance = options.resonance;
    const release = options.release;
    const volume = options.volume;

    // const fadeIn = options.noise.fadeIn;
    // const fadeOut = options.noise.fadeOut;
    // const rate = options.noise.playbackRate;
    // const noiseType = options.noise.type;
    const parameterLockValues = useMemo(() => {
        const o: any = {}
        properties.forEach(property => {
            const selectedPropertyArray = selected?.map(s => getNested(events[s].instrument, property))

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
                    allValuesEqual && selectedPropertyArray ? selectedPropertyArray[0] : false,
                    noValuesInSelected
                ],
                o,
            )
        })
        return o
    }, [properties, selected, events])


    const getPropertyValue = (property: string): number | '*' => {
        const pmValues = getNested(parameterLockValues, property)
        return selected && selected.length > 1 && !pmValues[0] && !pmValues[2]
            ? '*'
            : pmValues[0]
                ? pmValues[1]
                : getNested(options, property)[0]
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.sideTitle}><h1>PluckSynth</h1></div>
            <div className={styles.tweakers}>
                <div className={styles.top}>
                    <div className={styles.title}>Pluck</div>
                    <div className={styles.indicators}>
                        <div className={styles.envelope}>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    selectedLock={false}
                                    // ccMouseCalculationCallback={calcCallbacks.attackNoise}
                                    ccMouseCalculationCallback={calcCallbacks.attackNoise}
                                    label={'attackNoise'}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    removePropertyLock={removePropertyLocks.attackNoise}
                                    max={attackNoise[1][1]}
                                    midiLearn={() => { }}
                                    min={attackNoise[1][0]}
                                    type={'knob'}
                                    unit={attackNoise[2]}
                                    value={getPropertyValue('attackNoise')}
                                    curve={attackNoise[4]}
                                    valueUpdateCallback={propertyUpdateCallbacks.attackNoise}
                                    indicatorId={`instrument${trackId}:attackNoise`}
                                    className={styles.envelopeAttack}
                                />
                                <ContinuousIndicator
                                    selectedLock={false}
                                    ccMouseCalculationCallback={calcCallbacks.dampening}
                                    label={'Damp'}
                                    removePropertyLock={removePropertyLocks.dampening}
                                    max={dampening[1][1]}
                                    midiLearn={() => { }}
                                    min={dampening[1][0]}
                                    type={'knob'}
                                    unit={dampening[2]}
                                    value={getPropertyValue('dampening')}
                                    indicatorId={`instrument${trackId}:dampening`}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    curve={dampening[4]}
                                    valueUpdateCallback={propertyUpdateCallbacks.dampening}
                                    className={styles.envelopeDecay}
                                />
                                {/* <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.dampening}
                                    selectedLock={false}
                                    label={'Damp'}
                                    max={dampening[1][1]}
                                    midiLearn={() => { }}
                                    curve={dampening[4]}
                                    min={dampening[1][0]}
                                    type={'knob'}
                                    // unit={dampening[2]}
                                    unit={''}
                                    value={getPropertyValue('dampening')}
                                    valueUpdateCallback={propertyUpdateCallbacks.dampening}
                                    className={styles.envelopeDecay}
                                /> */}
                            </div>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.resonance}
                                    removePropertyLock={removePropertyLocks.resonance}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    selectedLock={false}
                                    label={'Resoance'}
                                    max={resonance[1][1]}
                                    midiLearn={() => { }}
                                    min={resonance[1][0]}
                                    // detail={'envelopeZero'}
                                    type={'knob'}
                                    curve={resonance[4]}
                                    unit={resonance[2]}
                                    value={getPropertyValue('resonance')}
                                    indicatorId={`instrument${trackId}:resonance`}
                                    valueUpdateCallback={propertyUpdateCallbacks.resonance}
                                    className={styles.envelopeSustain}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.release}
                                    selectedLock={false}
                                    label={'Release'}
                                    max={release[1][1]}
                                    midiLearn={() => { }}
                                    min={release[1][0]}
                                    curve={release[4]}
                                    type={'knob'}
                                    unit={release[2]}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    removePropertyLock={removePropertyLocks.release}
                                    value={getPropertyValue('release')}
                                    indicatorId={`instrument${trackId}:release`}
                                    valueUpdateCallback={propertyUpdateCallbacks.release}
                                    className={styles.envelopeRelease}
                                />
                            </div>
                        </div>
                        {/* <div className={styles.selectors}>
                            <CurveSelector
                                display={'horizontal'}
                                selectCurve={(curve) => dispatch(updateEnvelopeCurve(index, 'envelope', curve))}
                                selected={options.envelope.decayCurve[0]}
                                className={styles.curve}
                            />
                        </div> */}
                        <div className={styles.voices}>
                            <ContinuousIndicator
                                ccMouseCalculationCallback={calcCallbacks.volume}
                                selectedLock={false}
                                label={'Volume'}
                                max={volume[1][1]}
                                midiLearn={() => { }}
                                min={volume[1][0]}
                                tabIndex={widgetTabIndexTrkStart + index}
                                type={'slider'}
                                detail={'volume'}
                                curve={volume[4]}
                                unit={volume[2]}
                                value={getPropertyValue('volume')}
                                removePropertyLock={removePropertyLocks.volume}
                                indicatorId={`instrument${trackId}:volume`}
                                valueUpdateCallback={propertyUpdateCallbacks.volume}
                                className={styles.volume}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PluckSynth;