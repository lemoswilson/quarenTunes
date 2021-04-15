import React, { useMemo } from 'react';
import { updateEnvelopeCurve } from '../../../../store/Track';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import CurveSelector from '../../CurveSelector';
import { useDispatch } from 'react-redux';
import SteppedIndicator from '../../SteppedIndicator';
import { event } from '../../../../store/Sequencer';

export interface NoiseSynthProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    propertyUpdateCallbacks: any,
    index: number,
    selected: number[],
    events: event[],
    properties: any[];
}

const NoiseSynth: React.FC<NoiseSynthProps> = ({
    calcCallbacks,
    options,
    propertyUpdateCallbacks,
    index,
    events,
    properties,
    selected,
}) => {
    const dispatch = useDispatch()
    const envelopeAttack = options.envelope.attack;
    const envelopeDecay = options.envelope.decay;
    const envelopeSustain = options.envelope.sustain;
    const envelopeRelease = options.envelope.release;
    const fadeIn = options.noise.fadeIn;
    const fadeOut = options.noise.fadeOut;
    const volume = options.volume;
    const rate = options.noise.playbackRate;
    const noiseType = options.noise.type;

    const parameterLockValues = useMemo(() => {
        const o: any = {}
        properties.forEach(property => {
            const selectedPropertyArray = selected.map(s => getNested(events[s].instrument, property))

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
            <div className={styles.sideTitle}><h1>NoiseSynth</h1></div>
            <div className={styles.tweakers}>
                <div className={styles.top}>
                    <div className={styles.title}>Noise</div>
                    <div className={styles.indicators}>
                        <div className={styles.envelope}>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    selectedLock={false}
                                    ccMouseCalculationCallback={calcCallbacks.envelope.attack}
                                    label={'Attack'}
                                    max={envelopeAttack[1][1]}
                                    midiLearn={() => { }}
                                    min={envelopeAttack[1][0]}
                                    type={'knob'}
                                    unit={envelopeAttack[2]}
                                    value={getPropertyValue('envelope.attack')}
                                    curve={envelopeAttack[4]}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.attack}
                                    className={styles.envelopeAttack}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.envelope.decay}
                                    selectedLock={false}
                                    label={'Decay'}
                                    max={envelopeDecay[1][1]}
                                    midiLearn={() => { }}
                                    curve={envelopeDecay[4]}
                                    min={envelopeDecay[1][0]}
                                    type={'knob'}
                                    unit={envelopeDecay[2]}
                                    value={getPropertyValue('envelope.decay')}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.decay}
                                    className={styles.envelopeDecay}
                                />
                            </div>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.envelope.sustain}
                                    selectedLock={false}
                                    label={'Sustain'}
                                    max={envelopeSustain[1][1]}
                                    midiLearn={() => { }}
                                    min={envelopeSustain[1][0]}
                                    detail={'envelopeZero'}
                                    type={'knob'}
                                    curve={envelopeSustain[4]}
                                    unit={envelopeSustain[2]}
                                    value={getPropertyValue('envelope.sustain')}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.sustain}
                                    className={styles.envelopeSustain}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.envelope.release}
                                    selectedLock={false}
                                    label={'Release'}
                                    max={envelopeRelease[1][1]}
                                    midiLearn={() => { }}
                                    min={envelopeRelease[1][0]}
                                    curve={envelopeRelease[4]}
                                    type={'knob'}
                                    unit={envelopeRelease[2]}
                                    value={getPropertyValue('envelope.release')}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.release}
                                    className={styles.envelopeRelease}
                                />
                            </div>
                        </div>
                        <div className={styles.selectors}>
                            <CurveSelector
                                display={'horizontal'}
                                selectCurve={(curve) => dispatch(updateEnvelopeCurve(index, 'envelope', curve))}
                                selected={options.envelope.decayCurve[0]}
                                className={styles.curve}
                            />
                            <div className={styles.fade}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.noise.fadeIn}
                                    selectedLock={false}
                                    label={'FadeIn'}
                                    max={fadeIn[1][1]}
                                    midiLearn={() => { }}
                                    min={fadeIn[1][0]}
                                    type={'knob'}
                                    curve={fadeIn[4]}
                                    unit={fadeIn[2]}
                                    value={getPropertyValue('noise.fadeIn')}
                                    valueUpdateCallback={propertyUpdateCallbacks.noise.fadeIn}
                                    className={styles.in}
                                    detail={'envelopeZero'}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.noise.fadeOut}
                                    selectedLock={false}
                                    label={'FadeOut'}
                                    max={fadeOut[1][1]}
                                    midiLearn={() => { }}
                                    min={fadeOut[1][0]}
                                    type={'knob'}
                                    curve={fadeOut[4]}
                                    unit={fadeOut[2]}
                                    value={getPropertyValue('noise.fadeOut')}
                                    valueUpdateCallback={propertyUpdateCallbacks.noise.fadeOut}
                                    className={styles.out}
                                    detail={'envelopeZero'}
                                />
                            </div>
                        </div>
                        <div className={styles.voices}>
                            <ContinuousIndicator
                                ccMouseCalculationCallback={calcCallbacks.volume}
                                selectedLock={false}
                                label={'Volume'}
                                max={volume[1][1]}
                                midiLearn={() => { }}
                                min={volume[1][0]}
                                type={'slider'}
                                detail={'volume'}
                                curve={volume[4]}
                                unit={volume[2]}
                                value={getPropertyValue('volume')}
                                valueUpdateCallback={propertyUpdateCallbacks.volume}
                                className={styles.volume}
                            />
                            <div className={styles.rateType}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.noise.playbackRate}
                                    selectedLock={false}
                                    label={'Rate'}
                                    max={rate[1][1]}
                                    midiLearn={() => { }}
                                    min={rate[1][0]}
                                    type={'knob'}
                                    curve={rate[4]}
                                    unit={rate[2]}
                                    value={getPropertyValue('noise.playbackRate')}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'noise.playbackRate')}
                                    className={styles.rate}
                                />
                                <SteppedIndicator
                                    ccMouseCalculationCallback={calcCallbacks.noise.type}
                                    label={'Type'}
                                    midiLearn={() => { }}
                                    options={noiseType[1]}
                                    selected={
                                        selected.length > 1 && !parameterLockValues.noise.type[0] && !parameterLockValues.noise.type[2]
                                            ? '*'
                                            : parameterLockValues.noise.type[0]
                                                ? parameterLockValues.noise.type[1]
                                                : getNested(options, 'noise.type')[0]
                                    }
                                    unit={''}
                                    valueUpdateCallback={propertyUpdateCallbacks.noise.type}
                                    className={styles.type}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NoiseSynth;