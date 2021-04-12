import React, { useEffect, useState } from 'react';
import { curveTypes, getInitials } from '../../../../containers/Track/defaults';
import { xolombrisxInstruments, envelopeAttack, updateEnvelopeCurve } from '../../../../store/Track';
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
    noiseTypeOptions,
    harmonicityRange,
    harmonicityUnit,
    modulationRange,
    modulationUnit
} from '../../../../containers/Track/defaults';
import { valueFromMouse } from '../../../../lib/curves';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../containers/Xolombrisx';
import SteppedIndicator from '../../SteppedIndicator';

export interface NoiseSynthProps {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    propertyUpdateCallbacks: any,
    index: number,
}

const FMSynth: React.FC<NoiseSynthProps> = ({
    calcCallbacks,
    options,
    propertyUpdateCallbacks,
    index,
}) => {
    const dispatch = useDispatch()

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
                                    detail={'envelopeZero'}
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
                                selectCurve={(curve) => dispatch(updateEnvelopeCurve(index, 'envelope', curve))}
                                selected={options.envelope.decayCurve[0]}
                                className={styles.curve}
                            />
                            <div className={styles.fade}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'noise.fadeIn')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'FadeIn'}
                                    max={envelopeTimeRange[1]}
                                    midiLearn={() => { }}
                                    min={envelopeTimeRange[0]}
                                    type={'knob'}
                                    curve={getNested(options, 'noise.fadeIn')[4]}
                                    unit={envelopeUnit}
                                    value={getNested(options, 'noise.fadeIn')[0]}
                                    className={styles.in}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'noise.fadeIn')}
                                    detail={'envelopeZero'}
                                />
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'noise.fadeOut')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'FadeOut'}
                                    max={envelopeTimeRange[1]}
                                    midiLearn={() => { }}
                                    min={envelopeTimeRange[0]}
                                    type={'knob'}
                                    curve={getNested(options, 'noise.fadeOut')[4]}
                                    unit={envelopeUnit}
                                    value={getNested(options, 'noise.fadeOut')[0]}
                                    className={styles.out}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'noise.fadeOut')}
                                    detail={'envelopeZero'}
                                />
                            </div>
                            {/* <WaveformSelector
                                selectWaveform={(wave) => { propertyUpdateCallbacks.oscillator.type(wave) }}
                                selected={options.oscillator.type[0]}
                            /> */}
                        </div>
                        <div className={styles.voices}>
                            <ContinuousIndicator
                                ccMouseCalculationCallback={getNested(calcCallbacks, 'volume')}
                                // curveFunction={(number) => number * 0.2}
                                label={'Volume'}
                                max={volumeRange[1]}
                                midiLearn={() => { }}
                                min={volumeRange[0]}
                                type={'slider'}
                                detail={'volume'}
                                curve={getNested(options, 'volume')[4]}
                                unit={volumeUnit}
                                value={getNested(options, 'volume')[0]}
                                valueUpdateCallback={getNested(propertyUpdateCallbacks, 'volume')}
                                className={styles.volume}
                            />
                            <div className={styles.rateType}>
                                <ContinuousIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'noise.playbackRate')}
                                    // curveFunction={(number) => number * 0.2}
                                    label={'Rate'}
                                    max={modulationRange[1]}
                                    midiLearn={() => { }}
                                    min={modulationRange[0]}
                                    type={'knob'}
                                    // detail={'envelopeZero'}
                                    curve={getNested(options, 'noise.playbackRate')[4]}
                                    unit={''}
                                    value={getNested(options, 'noise.playbackRate')[0]}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'noise.playbackRate')}
                                    className={styles.rate}
                                />
                                <SteppedIndicator
                                    ccMouseCalculationCallback={getNested(calcCallbacks, 'noise.type')}
                                    label={'Type'}
                                    midiLearn={() => { }}
                                    options={noiseTypeOptions}
                                    selected={getNested(options, 'noise.type')[0]}
                                    unit={''}
                                    className={styles.type}
                                    valueUpdateCallback={getNested(propertyUpdateCallbacks, 'noise.playbackRate')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FMSynth;