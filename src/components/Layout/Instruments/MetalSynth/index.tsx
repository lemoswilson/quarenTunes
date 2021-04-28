import React, { useMemo } from 'react';
import { updateEnvelopeCurve } from '../../../../store/Track';
import { getNested } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import CurveSelector from '../../CurveSelector';
import { setNestedValue } from '../../../../lib/objectDecompose';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer'

export interface MetalSynthProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    propertyUpdateCallbacks: any,
    index: number,
    events: event[],
    selected: number[],
    properties: any[],
}

const MetalSynth: React.FC<MetalSynthProps> = ({
    calcCallbacks,
    options,
    events,
    properties,
    selected,
    propertyUpdateCallbacks,
    index,
}) => {
    const envelopeAttack = options.envelope.attack;
    const envelopeDecay = options.envelope.decay
    const envelopeSustain = options.envelope.sustain;
    const envelopeRelease = options.envelope.release;
    const octaves = options.octaves;
    const detune = options.detune;
    const portamento = options.portamento;
    const volume = options.volume;
    const resonance = options.resonance;
    const harmonicity = options.harmonicity;
    const modulationIndex = options.modulationIndex;

    const dispatch = useDispatch()
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
            <div className={styles.sideTitle}><h1>MetalSynth</h1></div>
            <div className={styles.tweakers}>
                <div className={styles.top}>
                    {/* <div className={styles.title}>Oscillator</div> */}
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
                                    indicatorId={`instrument${index}:envelope.attack`}
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
                                    indicatorId={`instrument${index}:envelope.decay`}
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
                                    indicatorId={`instrument${index}:envelope.sustain`}
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
                                    indicatorId={`instrument${index}:envelope.release`}
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
                            <div className={styles.octavesResonance}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.octaves}
                                    selectedLock={false}
                                    label={'Octaves'}
                                    max={octaves[1][1]}
                                    midiLearn={() => { }}
                                    min={octaves[1][0]}
                                    type={'knob'}
                                    curve={octaves[4]}
                                    unit={octaves[2]}
                                    value={getPropertyValue('octaves')}
                                    indicatorId={`instrument${index}:octaves`}
                                    valueUpdateCallback={propertyUpdateCallbacks.octaves}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.resonance}
                                    selectedLock={false}
                                    label={'Resonance'}
                                    max={resonance[1][1]}
                                    midiLearn={() => { }}
                                    min={resonance[1][0]}
                                    type={'knob'}
                                    curve={resonance[4]}
                                    unit={resonance[2]}
                                    value={getPropertyValue('resonance')}
                                    indicatorId={`instrument${index}:resonance`}
                                    valueUpdateCallback={propertyUpdateCallbacks.resonance}
                                    className={styles.resonance}
                                />
                            </div>
                        </div>
                        <div className={styles.voices}>


                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    {/* <div className={styles.title}></div> */}
                    <div className={styles.indicators}>
                        <div className={styles.sliders}>
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
                                indicatorId={`instrument${index}:volume`}
                                valueUpdateCallback={propertyUpdateCallbacks.volume}
                                className={styles.volume}
                            />
                            <ContinuousIndicator
                                ccMouseCalculationCallback={calcCallbacks.harmonicity}
                                selectedLock={false}
                                label={'Harm'}
                                max={harmonicity[1][1]}
                                midiLearn={() => { }}
                                min={harmonicity[1][0]}
                                type={'slider'}
                                curve={harmonicity[4]}
                                unit={harmonicity[2]}
                                value={getPropertyValue('harmonicity')}
                                indicatorId={`instrument${index}:harmonicity`}
                                valueUpdateCallback={propertyUpdateCallbacks.harmonicity}
                                className={styles.harmonicity}
                            />
                            <ContinuousIndicator
                                ccMouseCalculationCallback={calcCallbacks.modulationIndex}
                                selectedLock={false}
                                label={'modIdx'}
                                max={modulationIndex[1][1]}
                                midiLearn={() => { }}
                                min={modulationIndex[1][0]}
                                type={'slider'}
                                curve={modulationIndex[4]}
                                unit={modulationIndex[2]}
                                value={getPropertyValue('modulationIndex')}
                                indicatorId={`instrument${index}:modulationIndex`}
                                valueUpdateCallback={propertyUpdateCallbacks.modulationIndex}
                                className={styles.modulationIndex}
                            />
                        </div>
                        <div className={styles.detunePortamento}>
                            <ContinuousIndicator
                                ccMouseCalculationCallback={calcCallbacks.detune}
                                selectedLock={false}
                                label={'Detune'}
                                max={detune[1][1]}
                                midiLearn={() => { }}
                                min={detune[1][0]}
                                type={'knob'}
                                curve={detune[4]}
                                unit={detune[2]}
                                value={getPropertyValue('detune')}
                                indicatorId={`instrument${index}:detune`}
                                valueUpdateCallback={propertyUpdateCallbacks.detune}
                                detail={'detune'}
                            />
                            <ContinuousIndicator
                                ccMouseCalculationCallback={calcCallbacks.portamento}
                                selectedLock={false}
                                label={'Portamento'}
                                max={portamento[1][1]}
                                midiLearn={() => { }}
                                min={portamento[1][0]}
                                type={'knob'}
                                detail={'port'}
                                unit={portamento[2]}
                                curve={portamento[4]}
                                indicatorId={`instrument${index}:portamento`}
                                value={getPropertyValue('portamento')}
                                valueUpdateCallback={propertyUpdateCallbacks.portamento}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MetalSynth;