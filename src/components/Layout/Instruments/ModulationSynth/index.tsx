import React, { useMemo } from 'react';
import { xolombrisxInstruments, updateEnvelopeCurve } from '../../../../store/Track';
import { getNested } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import CurveSelector from '../../CurveSelector';
import WaveformSelector from '../../WaveformSelector';
import { setNestedValue } from '../../../../lib/objectDecompose';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer'
import { widgetTabIndexTrkStart } from '../../../../containers/Track/defaults';

export interface ModulationSynthProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    propertyUpdateCallbacks: any,
    removePropertyLocks: any,
    index: number,
    events: event[],
    selected: number[],
    properties: any[],
    voice: xolombrisxInstruments.AMSYNTH | xolombrisxInstruments.FMSYNTH
}

const ModulationSynth: React.FC<ModulationSynthProps> = ({
    calcCallbacks,
    options,
    removePropertyLocks,
    events,
    properties,
    selected,
    voice,
    propertyUpdateCallbacks,
    index,
}) => {
    const dispatch = useDispatch()
    const envelopeAttack = options.envelope.attack;
    const envelopeDecay = options.envelope.decay;
    const envelopeSustain = options.envelope.sustain;
    const envelopeRelease = options.envelope.release;
    const modulationEnvelopeAttack = options.modulationEnvelope.attack;
    const modulationEnvelopeDecay = options.modulationEnvelope.decay;
    const modulationEnvelopeSustain = options.modulationEnvelope.sustain;
    const modulationEnvelopeRelease = options.modulationEnvelope.release;
    const modulationIndex = options.modulationIndex;
    const detune = options.detune;
    const portamento = options.portamento;
    const harmonicity = options.harmonicity;
    const volume = options.volume;

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

    const modulationIndexIndicator =
        voice === xolombrisxInstruments.FMSYNTH
            ? (
                <ContinuousIndicator
                    ccMouseCalculationCallback={calcCallbacks.modulationIndex}
                    tabIndex={widgetTabIndexTrkStart + index}
                    selectedLock={false}
                    label={'ModIdx'}
                    max={modulationIndex[1][1]}
                    midiLearn={() => { }}
                    min={modulationIndex[1][0]}
                    removePropertyLock={removePropertyLocks.modulationIndex}
                    type={'slider'}
                    curve={modulationIndex[4]}
                    unit={modulationIndex[2]}
                    value={getPropertyValue('modulationIndex')}
                    valueUpdateCallback={propertyUpdateCallbacks.modulationIndex}
                    className={styles.modidx}
                    indicatorId={`instrument${index}:modulationIndex`}
                />
            ) : null

    return (
        <div className={styles.wrapper}>
            <div className={styles.sideTitle}><h1>{voice === xolombrisxInstruments.AMSYNTH ? 'AMSynth' : 'FMSynth'}</h1></div>
            <div className={styles.tweakers}>
                <div className={styles.top}>
                    <div className={styles.title}>Oscillator</div>
                    <div className={styles.indicators}>
                        <div className={styles.envelope}>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    selectedLock={false}
                                    ccMouseCalculationCallback={calcCallbacks.envelope.attack}
                                    label={'Attack'}
                                    max={envelopeAttack[1][1]}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    removePropertyLock={removePropertyLocks.envelope.attack}
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
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    removePropertyLock={removePropertyLocks.envelope.decay}
                                    midiLearn={() => { }}
                                    curve={envelopeDecay[4]}
                                    min={envelopeDecay[1][0]}
                                    type={'knob'}
                                    unit={envelopeDecay[2]}
                                    value={getPropertyValue('envelope.decay')}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.decay}
                                    className={styles.envelopeDecay}
                                    indicatorId={`instrument${index}:envelope.decay`}
                                />
                            </div>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.envelope.sustain}
                                    selectedLock={false}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    label={'Sustain'}
                                    max={envelopeSustain[1][1]}
                                    midiLearn={() => { }}
                                    min={envelopeSustain[1][0]}
                                    detail={'envelopeZero'}
                                    type={'knob'}
                                    curve={envelopeSustain[4]}
                                    unit={envelopeSustain[2]}
                                    removePropertyLock={removePropertyLocks.envelope.sustain}
                                    value={getPropertyValue('envelope.sustain')}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.sustain}
                                    className={styles.envelopeSustain}
                                    indicatorId={`instrument${index}:envelope.sustain`}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.envelope.release}
                                    selectedLock={false}
                                    label={'Release'}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    max={envelopeRelease[1][1]}
                                    midiLearn={() => { }}
                                    removePropertyLock={removePropertyLocks.envelope.release}
                                    min={envelopeRelease[1][0]}
                                    curve={envelopeRelease[4]}
                                    type={'knob'}
                                    unit={envelopeRelease[2]}
                                    value={getPropertyValue('envelope.release')}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.release}
                                    className={styles.envelopeRelease}
                                    indicatorId={`instrument${index}:envelope.release`}
                                />
                            </div>
                        </div>
                        <div className={styles.selectors}>
                            <CurveSelector
                                display={'horizontal'}
                                selectCurve={(curve) => dispatch(updateEnvelopeCurve(index, 'envelope', curve))}
                                tabIndex={widgetTabIndexTrkStart + index}
                                selected={options.envelope.decayCurve[0]}
                                className={styles.curve}
                            />
                            <WaveformSelector
                                selectWaveform={(wave) => { propertyUpdateCallbacks.oscillator.type(wave) }}
                                tabIndex={widgetTabIndexTrkStart + index}
                                selected={options.oscillator.type[0]}
                            />
                        </div>
                        <div className={styles.voices}>
                            <div className={styles.detunePortamento}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.detune}
                                    selectedLock={false}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    label={'Detune'}
                                    max={detune[1][1]}
                                    midiLearn={() => { }}
                                    min={detune[1][0]}
                                    type={'knob'}
                                    curve={detune[4]}
                                    unit={detune[2]}
                                    value={getPropertyValue('detune')}
                                    valueUpdateCallback={propertyUpdateCallbacks.detune}
                                    removePropertyLock={removePropertyLocks.detune}
                                    detail={'detune'}
                                    className={styles.decay}
                                    indicatorId={`instrument${index}:detune`}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.portamento}
                                    selectedLock={false}
                                    label={'Portamento'}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    max={portamento[1][1]}
                                    midiLearn={() => { }}
                                    min={portamento[1][0]}
                                    type={'knob'}
                                    detail={'port'}
                                    unit={portamento[2]}
                                    removePropertyLock={removePropertyLocks.portamento}
                                    curve={portamento[4]}
                                    value={getPropertyValue('portamento')}
                                    valueUpdateCallback={propertyUpdateCallbacks.portamento}
                                    className={styles.envelopeRelease}
                                    indicatorId={`instrument${index}:portamento`}
                                />
                            </div>
                            <ContinuousIndicator
                                ccMouseCalculationCallback={calcCallbacks.volume}
                                selectedLock={false}
                                tabIndex={widgetTabIndexTrkStart + index}
                                label={'Volume'}
                                max={volume[1][1]}
                                midiLearn={() => { }}
                                min={volume[1][0]}
                                removePropertyLock={removePropertyLocks.volume}
                                type={'slider'}
                                detail={'volume'}
                                curve={volume[4]}
                                unit={volume[2]}
                                value={getPropertyValue('volume')}
                                valueUpdateCallback={propertyUpdateCallbacks.volume}
                                className={styles.volume}
                                indicatorId={`instrument${index}:volume`}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.bottom} style={voice === xolombrisxInstruments.AMSYNTH ? { marginLeft: '1.2rem' } : undefined}>
                    <div className={styles.title}>Modulation</div>
                    <div className={styles.indicators}>
                        <div className={styles.envelope}>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    selectedLock={false}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    ccMouseCalculationCallback={calcCallbacks.modulationEnvelope.attack}
                                    label={'Attack'}
                                    max={modulationEnvelopeAttack[1][1]}
                                    midiLearn={() => { }}
                                    min={modulationEnvelopeAttack[1][0]}
                                    type={'knob'}
                                    unit={modulationEnvelopeAttack[2]}
                                    value={getPropertyValue('modulationEnvelope.attack')}
                                    removePropertyLock={removePropertyLocks.modulationEnvelope.attack}
                                    curve={modulationEnvelopeAttack[4]}
                                    valueUpdateCallback={propertyUpdateCallbacks.modulationEnvelope.attack}
                                    className={styles.envelopeAttack}
                                    indicatorId={`instrument${index}:modulationEnvelope.attack`}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.modulationEnvelope.decay}
                                    selectedLock={false}
                                    label={'Decay'}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    max={modulationEnvelopeDecay[1][1]}
                                    midiLearn={() => { }}
                                    curve={modulationEnvelopeDecay[4]}
                                    removePropertyLock={removePropertyLocks.modulationEnvelope.decay}
                                    min={modulationEnvelopeDecay[1][0]}
                                    type={'knob'}
                                    unit={modulationEnvelopeDecay[2]}
                                    value={getPropertyValue('modulationEnvelope.decay')}
                                    valueUpdateCallback={propertyUpdateCallbacks.modulationEnvelope.decay}
                                    className={styles.envelopeDecay}
                                    indicatorId={`instrument${index}:modulationEnvelope.decay`}
                                />
                            </div>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.modulationEnvelope.sustain}
                                    selectedLock={false}
                                    label={'Sustain'}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    removePropertyLock={removePropertyLocks.modulationEnvelope.sustain}
                                    max={modulationEnvelopeSustain[1][1]}
                                    midiLearn={() => { }}
                                    curve={modulationEnvelopeSustain[4]}
                                    min={modulationEnvelopeSustain[1][0]}
                                    type={'knob'}
                                    unit={modulationEnvelopeSustain[2]}
                                    value={getPropertyValue('modulationEnvelope.sustain')}
                                    valueUpdateCallback={propertyUpdateCallbacks.modulationEnvelope.sustain}
                                    className={styles.decay}
                                    indicatorId={`instrument${index}:modulationEnvelope.sustain`}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.modulationEnvelope.release}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    selectedLock={false}
                                    label={'Release'}
                                    removePropertyLock={removePropertyLocks.modulationEnvelope.release}
                                    max={modulationEnvelopeRelease[1][1]}
                                    midiLearn={() => { }}
                                    curve={modulationEnvelopeRelease[4]}
                                    min={modulationEnvelopeRelease[1][0]}
                                    type={'knob'}
                                    unit={modulationEnvelopeRelease[2]}
                                    value={getPropertyValue('modulationEnvelope.release')}
                                    valueUpdateCallback={propertyUpdateCallbacks.modulationEnvelope.release}
                                    className={styles.envelopeRelease}
                                    indicatorId={`instrument${index}:modulationEnvelope.release`}
                                />
                            </div>
                        </div>
                        <div className={styles.selectors}>
                            <CurveSelector
                                display={'horizontal'}
                                tabIndex={widgetTabIndexTrkStart + index}
                                selectCurve={(curve) => dispatch(updateEnvelopeCurve(index, 'modulationEnvelope', curve))}
                                selected={options.modulationEnvelope.decayCurve[0]}
                                className={styles.curve}
                            />
                            <WaveformSelector
                                selectWaveform={(wave) => { propertyUpdateCallbacks.modulation.type(wave) }}
                                tabIndex={widgetTabIndexTrkStart + index}
                                selected={options.modulation.type[0]}
                                className={styles.waveform}
                            />
                        </div>
                        <div className={styles.voices}>
                            <ContinuousIndicator
                                ccMouseCalculationCallback={calcCallbacks.harmonicity}
                                selectedLock={false}
                                tabIndex={widgetTabIndexTrkStart + index}
                                label={'Harm'}
                                max={harmonicity[1][1]}
                                midiLearn={() => { }}
                                min={harmonicity[1][0]}
                                removePropertyLock={removePropertyLocks.harmonicity}
                                type={'slider'}
                                unit={harmonicity[2]}
                                curve={harmonicity[4]}
                                // value={getNested(options, 'harmonicity')[0]}
                                value={getPropertyValue('harmonicity')}
                                valueUpdateCallback={propertyUpdateCallbacks.harmonicity}
                                indicatorId={`instrument${index}:modulationEnvelope.harmonicity`}
                                className={styles.harm}
                            />
                            {modulationIndexIndicator}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModulationSynth;