import React, { useEffect, useMemo } from 'react';
import { updateEnvelopeCurve } from '../../../../store/Track';
import { getNested } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import CurveSelector from '../../CurveSelector';
import WaveformSelector from '../../WaveformSelector';
import { setNestedValue } from '../../../../lib/objectDecompose';
import { useDispatch } from 'react-redux';
import { event } from '../../../../store/Sequencer'
import { widgetTabIndexTrkStart } from '../../../../containers/Track/defaults';

export interface MembraneSynthProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    removePropertyLocks: any,
    ccMaps: any,
    propertyUpdateCallbacks: any,
    midiLearn: (property: string) => void,
    index: number,
    trackId: number,
    events: event[],
    selected?: number[],
    properties: any[],
}

const MembraneSynth: React.FC<MembraneSynthProps> = ({
    calcCallbacks,
    options,
    events,
    trackId,
    ccMaps,
    midiLearn,
    properties,
    removePropertyLocks,
    selected,
    propertyUpdateCallbacks,
    index,
}) => {
    const envelopeAttack = options.envelope.attack;
    const envelopeDecay = options.envelope.decay;
    const envelopeSustain = options.envelope.sustain;
    const envelopeRelease = options.envelope.release;
    const octaves = options.octaves;
    const detune = options.detune;
    const portamento = options.portamento;
    const volume = options.volume;
    const pitchDecay = options.pitchDecay;

    const dispatch = useDispatch()
    const parameterLockValues = useMemo(() => {

        const o: any = {}
        properties.forEach(property => {
            const selectedPropertyArray =  selected?.map(s => getNested(events[s].instrument, property))

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
        const pmValues: (number | boolean | string)[] = getNested(parameterLockValues, property)
        return selected && selected.length > 1 && !pmValues[0] && !pmValues[2]
            ? '*'
            : pmValues[0]
                ? pmValues[1]
                : getNested(options, property)[0]
    };

    useEffect(() => {
        console.log(options);
    }, [])



    return (
        <div className={styles.wrapper}>
            <div className={styles.sideTitle}><h1>MembraneSynth</h1></div>
            <div className={styles.tweakers}>
                <div className={styles.top}>
                    <div className={styles.title}>Oscillator</div>
                    <div className={styles.indicators}>
                        <div className={styles.envelope}>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    selectedLock={false}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    ccMouseCalculationCallback={calcCallbacks.envelope.attack}
                                    removePropertyLock={removePropertyLocks.envelope.attack}
                                    label={'Attack'}
                                    max={envelopeAttack[1][1]}
                                    midiLearn={() => { midiLearn('envelope.attack') }}
                                    ccMap={getNested(ccMaps.current, 'envelope.attack')}
                                    min={envelopeAttack[1][0]}
                                    type={'knob'}
                                    unit={envelopeAttack[2]}
                                    value={getPropertyValue('envelope.attack')}
                                    curve={envelopeAttack[4]}
                                    indicatorId={`instrument${trackId}:envelope.attack`}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.attack}
                                    className={styles.envelopeAttack}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.envelope.decay}
                                    selectedLock={false}
                                    label={'Decay'}
                                    removePropertyLock={removePropertyLocks.envelope.decay}
                                    max={envelopeDecay[1][1]}
                                    midiLearn={() => { midiLearn('envelope.decay') }}
                                    ccMap={getNested(ccMaps.current, 'envelope.decay')}
                                    curve={envelopeDecay[4]}
                                    min={envelopeDecay[1][0]}
                                    type={'knob'}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    unit={envelopeDecay[2]}
                                    value={getPropertyValue('envelope.decay')}
                                    indicatorId={`instrument${trackId}:envelope.decay`}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.decay}
                                    className={styles.envelopeDecay}
                                />
                            </div>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.envelope.sustain}
                                    removePropertyLock={removePropertyLocks.envelope.sustain}
                                    selectedLock={false}
                                    label={'Sustain'}
                                    max={envelopeSustain[1][1]}
                                    midiLearn={() => { midiLearn('envelope.sustain') }}
                                    min={envelopeSustain[1][0]}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    detail={'envelopeZero'}
                                    type={'knob'}
                                    curve={envelopeSustain[4]}
                                    ccMap={getNested(ccMaps.current, 'envelope.sustain')}
                                    unit={envelopeSustain[2]}
                                    value={getPropertyValue('envelope.sustain')}
                                    indicatorId={`instrument${trackId}:envelope.sustain`}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.sustain}
                                    className={styles.envelopeSustain}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.envelope.release}
                                    selectedLock={false}
                                    label={'Release'}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    removePropertyLock={removePropertyLocks.envelope.release}
                                    max={envelopeRelease[1][1]}
                                    midiLearn={() => { midiLearn('envelope.release') }}
                                    min={envelopeRelease[1][0]}
                                    ccMap={getNested(ccMaps.current, 'envelope.release')}
                                    curve={envelopeRelease[4]}
                                    type={'knob'}
                                    unit={envelopeRelease[2]}
                                    value={getPropertyValue('envelope.release')}
                                    indicatorId={`instrument${trackId}:envelope.release`}
                                    valueUpdateCallback={propertyUpdateCallbacks.envelope.release}
                                    className={styles.envelopeRelease}
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
                                selected={options.oscillator.type[0]}
                                tabIndex={widgetTabIndexTrkStart + index}
                            />
                        </div>
                        <div className={styles.voices}>
                            <div className={styles.detunePortamento}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.detune}
                                    selectedLock={false}
                                    label={'Detune'}
                                    ccMap={getNested(ccMaps.current, 'detune')}
                                    removePropertyLock={removePropertyLocks.detune}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    max={detune[1][1]}
                                    midiLearn={() => { midiLearn('detune') }}
                                    min={detune[1][0]}
                                    type={'knob'}
                                    curve={detune[4]}
                                    unit={detune[2]}
                                    value={getPropertyValue('detune')}
                                    indicatorId={`instrument${trackId}:detune`}
                                    valueUpdateCallback={propertyUpdateCallbacks.detune}
                                    detail={'detune'}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={calcCallbacks.portamento}
                                    tabIndex={widgetTabIndexTrkStart + index}
                                    selectedLock={false}
                                    label={'Portamento'}
                                    max={portamento[1][1]}
                                    removePropertyLock={removePropertyLocks.portamento}
                                    midiLearn={() => { midiLearn('portamento') }}
                                    min={portamento[1][0]}
                                    ccMap={getNested(ccMaps.current, 'portamento')}
                                    type={'knob'}
                                    detail={'port'}
                                    unit={portamento[2]}
                                    curve={portamento[4]}
                                    value={getPropertyValue('portamento')}
                                    indicatorId={`instrument${trackId}:portamento`}
                                    valueUpdateCallback={propertyUpdateCallbacks.portamento}
                                // className={styles.envelopeRelease}
                                />
                            </div>
                            <ContinuousIndicator
                                ccMouseCalculationCallback={calcCallbacks.volume}
                                selectedLock={false}
                                tabIndex={widgetTabIndexTrkStart + index}
                                removePropertyLock={removePropertyLocks.volume}
                                label={'Volume'}
                                max={volume[1][1]}
                                ccMap={getNested(ccMaps.current, 'volume')}
                                midiLearn={() => { midiLearn('volume') }}
                                min={volume[1][0]}
                                type={'slider'}
                                detail={'volume'}
                                curve={volume[4]}
                                unit={volume[2]}
                                value={getPropertyValue('volume')}
                                indicatorId={`instrument${trackId}:volume`}
                                valueUpdateCallback={propertyUpdateCallbacks.volume}
                            // className={styles.volume}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    {/* <div className={styles.title}></div> */}
                    <div className={styles.indicators}>
                        <ContinuousIndicator
                            ccMouseCalculationCallback={calcCallbacks.octaves}
                            selectedLock={false}
                            label={'Octaves'}
                            tabIndex={widgetTabIndexTrkStart + index}
                            max={octaves[1][1]}
                            midiLearn={() => { midiLearn('octaves') }}
                            ccMap={getNested(ccMaps.current, 'octaves')}
                            min={octaves[1][0]}
                            type={'knob'}
                            removePropertyLock={removePropertyLocks.octaves}
                            curve={octaves[4]}
                            unit={octaves[2]}
                            value={getPropertyValue('octaves')}
                            indicatorId={`instrument${trackId}:octaves`}
                            valueUpdateCallback={propertyUpdateCallbacks.octaves}
                        />
                        <ContinuousIndicator
                            ccMouseCalculationCallback={calcCallbacks.pitchDecay}
                            selectedLock={false}
                            label={'pitchDecay'}
                            max={pitchDecay[1][1]}
                            midiLearn={() => { midiLearn('pitchDecay') }}
                            ccMap={getNested(ccMaps.current, 'pitchDecay')}
                            min={pitchDecay[1][0]}
                            tabIndex={widgetTabIndexTrkStart + index}
                            type={'knob'}
                            removePropertyLock={removePropertyLocks.pitchDecay}
                            curve={pitchDecay[4]}
                            unit={pitchDecay[2]}
                            value={getPropertyValue('pitchDecay')}
                            indicatorId={`instrument${trackId}:pitchDecay`}
                            valueUpdateCallback={propertyUpdateCallbacks.pitchDecay}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MembraneSynth;