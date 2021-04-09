import React, { useEffect, useState } from 'react';
import { curveTypes, getInitials } from '../../../../containers/Track/defaults';
import { xolombrisxInstruments, envelopeAttack } from '../../../../store/Track';
import { getNested } from '../../../../lib/objectDecompose';
import { initialsArray } from '../../../../containers/Track/Instruments';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import CurveSelector from '../../CurveSelector';
import WaveformSelector from '../../WaveformSelector';
import {
    envelopeTimeRange,
    envelopeUnit,
    normalRange,
    normalUnit,
    detuneRange,
    detuneUnit,
    portamentoRange,
    portamentoUnit,
    volumeRange,
    volumeUnit,
    harmonicityRange,
    harmonicityUnit,
    modulationRange,
    modulationUnit
} from '../../../../containers/Track/defaults';
import { valueFromMouse } from '../../../../lib/curves';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../containers/Xolombrisx';

export interface FMSynthProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    propertyUpdateCallbacks: any,
}

const FMSynth: React.FC<FMSynthProps> = ({
    calcCallbacks,
    options,
    propertyUpdateCallbacks,
}) => {
    const dispatch = useDispatch()
    // const env = useSelector((state: RootState) => state.track.present.tracks[0].env);
    const env = useSelector((state: RootState) => state.track.present.tracks[0].options.envelope.attack[0]);
    const [testState, setTest] = useState(2)
    const calculation = (e: any) => {
        // setTest(state => Number(valueFromMouse(state, e.movementY, 0.001, 10, curveTypes.EXPONENTIAL).toFixed(4)))
        // console.log('dispatchiing ')
        dispatch(envelopeAttack(0, e.movementY))
    }
    const vv = options.envelope.attack[0]

    // useEffect(() => {
    //     console.log(calcCallbacks);
    // })

    return (
        <div className={styles.wrapper}>
            <div className={styles.sideTitle}></div>
            <div className={styles.tweakers}>
                <div className={styles.top}>
                    <div className={styles.title}>Oscillator</div>
                    <div className={styles.indicators}>
                        <div className={styles.envelope}>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'envelope.attack')}
                                    // ccMouseCalculationCallback={calculation}
                                    label={'Attack'}
                                    max={envelopeTimeRange[1]}
                                    midiLearn={() => { }}
                                    min={envelopeTimeRange[0]}
                                    type={'knob'}
                                    unit={envelopeUnit}
                                    value={getNested(options, 'envelope.attack')[0]}
                                    // value={Number(env)}
                                    // value={vv}
                                    // value={testState}
                                    curve={getNested(options, 'envelope.attack')[4]}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'envelope.attack')}
                                    className={styles.envelopeAttack}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'envelope.decay')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'Decay'}
                                    max={envelopeTimeRange[1]}
                                    midiLearn={() => { }}
                                    curve={getNested(options, 'envelope.decay')[4]}
                                    min={envelopeTimeRange[0]}
                                    type={'knob'}
                                    unit={envelopeUnit}
                                    value={getNested(options, 'envelope.decay')[0]}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'envelope.decay')}
                                    className={styles.envelopeDecay}
                                />
                            </div>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'envelope.sustain')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'Sustain'}
                                    max={normalRange[1]}
                                    midiLearn={() => { }}
                                    min={normalRange[0]}
                                    type={'knob'}
                                    curve={getNested(options, 'envelope.sustain')[4]}
                                    unit={normalUnit}
                                    value={getNested(options, 'envelope.sustain')[0]}
                                    valueUpdateCallback={() => { getNested(propertyUpdateCallbacks, 'envelope.sustain') }}
                                    className={styles.envelopeSustain}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'envelope.release')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'Release'}
                                    max={envelopeTimeRange[1]}
                                    midiLearn={() => { }}
                                    min={envelopeTimeRange[0]}
                                    curve={getNested(options, 'envelope.release')[4]}
                                    type={'knob'}
                                    unit={envelopeUnit}
                                    value={getNested(options, 'envelope.release')[0]}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'envelope.release')}
                                    className={styles.envelopeRelease}
                                />
                            </div>
                        </div>
                        <div className={styles.selectors}>
                            <CurveSelector
                                display={'horizontal'}
                                selectCurve={() => { }}
                                selected={'exponential'}
                                className={styles.curve}
                            />
                            <WaveformSelector
                                selectWaveform={() => { }}
                                selected={'saw'}
                            />
                        </div>
                        <div className={styles.voices}>
                            <div className={styles.detunePortamento}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'detune')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'Detune'}
                                    max={detuneRange[1]}
                                    midiLearn={() => { }}
                                    min={detuneRange[0]}
                                    type={'knob'}
                                    curve={getNested(options, 'detune')[4]}
                                    unit={detuneUnit}
                                    value={getNested(options, 'detune')[0]}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'detune')}
                                    className={styles.decay}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'portamento')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'Portamento'}
                                    max={portamentoRange[1]}
                                    midiLearn={() => { }}
                                    min={portamentoRange[0]}
                                    type={'knob'}
                                    unit={portamentoUnit}
                                    curve={getNested(options, 'portamento')[4]}
                                    value={getNested(options, 'portamento')[0]}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'portamento')}
                                    className={styles.envelopeRelease}
                                />
                            </div>
                            <ContinuousIndicator
                                ccMouseCalculationCallback={getNested(calcCallbacks, 'volume')}
                                // curveFunction={(number) => number * 0.2}
                                label={'Volume'}
                                max={volumeRange[1]}
                                midiLearn={() => { }}
                                min={volumeRange[0]}
                                type={'slider'}
                                curve={getNested(options, 'volume')[4]}
                                unit={volumeUnit}
                                value={getNested(options, 'volume')[0]}
                                valueUpdateCallback={getNested(propertyUpdateCallbacks, 'volume')}
                                className={styles.volume}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <div className={styles.title}>Modulation</div>
                    <div className={styles.indicators}>
                        <div className={styles.envelope}>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'modulationEnvelope.attack')}
                                    label={'Attack'}
                                    curve={getNested(options, 'modulationEnvelope.attack')[4]}
                                    max={envelopeTimeRange[1]}
                                    midiLearn={() => { }}
                                    min={envelopeTimeRange[0]}
                                    type={'knob'}
                                    unit={envelopeUnit}
                                    value={getNested(options, 'modulationEnvelope.attack')[0]}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'modulationEnvelope.attack')}
                                    className={styles.envelopeAttack}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'modulationEnvelope.decay')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'Decay'}
                                    max={envelopeTimeRange[1]}
                                    midiLearn={() => { }}
                                    curve={getNested(options, 'modulationEnvelope.decay')[4]}
                                    min={envelopeTimeRange[0]}
                                    type={'knob'}
                                    unit={envelopeUnit}
                                    value={getNested(options, 'modulationEnvelope.decay')[0]}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'modulationEnvelope.decay')}
                                    className={styles.envelopeDecay}
                                />
                            </div>
                            <div className={styles.box}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'modulationEnvelope.sustain')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'Sustain'}
                                    max={normalRange[1]}
                                    midiLearn={() => { }}
                                    min={normalRange[0]}
                                    type={'knob'}
                                    unit={normalUnit}
                                    curve={getNested(options, 'modulationEnvelope.sustain')[4]}
                                    value={getNested(options, 'modulationEnvelope.sustain')[0]}
                                    valueUpdateCallback={() => { getNested(propertyUpdateCallbacks, 'modulationEnvelope.sustain') }}
                                    className={styles.decay}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'modulationEnvelope.release')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'Release'}
                                    max={envelopeTimeRange[1]}
                                    midiLearn={() => { }}
                                    min={envelopeTimeRange[0]}
                                    type={'knob'}
                                    unit={envelopeUnit}
                                    curve={getNested(options, 'modulationEnvelope.release')[4]}
                                    value={getNested(options, 'modulationEnvelope.release')[0]}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'modulationEnvelope.release')}
                                    className={styles.envelopeRelease}
                                />
                            </div>
                        </div>
                        <div className={styles.selectors}>
                            <CurveSelector
                                display={'horizontal'}
                                selectCurve={() => { }}
                                selected={'exponential'}
                                className={styles.curve}
                            />
                            <WaveformSelector
                                selectWaveform={() => { }}
                                selected={'saw'}
                                className={styles.waveform}
                            />
                        </div>
                        <div className={styles.voices}>
                            <ContinuousIndicator
                                ccMouseCalculationCallback={getNested(calcCallbacks, 'harmonicity')}
                                // curveFunction={(number) => number * 0.2}
                                label={'Harm'}
                                max={harmonicityRange[1]}
                                midiLearn={() => { }}
                                min={harmonicityRange[0]}
                                type={'slider'}
                                unit={harmonicityUnit}
                                curve={getNested(options, 'harmonicity')[4]}
                                value={getNested(options, 'harmonicity')[0]}
                                valueUpdateCallback={getNested(propertyUpdateCallbacks, 'harmonicity')}
                                className={styles.harm}
                            />
                            <ContinuousIndicator
                                ccMouseCalculationCallback={getNested(calcCallbacks, 'modulationIndex')}
                                // curveFunction={(number) => number * 0.2}
                                label={'ModIdx'}
                                max={modulationRange[1]}
                                midiLearn={() => { }}
                                min={modulationRange[0]}
                                type={'slider'}
                                curve={getNested(options, 'modulationIndex')[4]}
                                unit={modulationUnit}
                                value={getNested(options, 'modulationIndex')[0]}
                                valueUpdateCallback={getNested(propertyUpdateCallbacks, 'modulationIndex')}
                                className={styles.modidx}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FMSynth;