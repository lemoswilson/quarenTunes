import React from 'react';
import { xolombrisxInstruments } from '../../../../store/Track';
import styles from './style.module.scss';
import { InstrumentLayoutProps } from '../../../../containers/Track/Instruments/InstrumentLoader'


const ModulationSynth: React.FC<InstrumentLayoutProps> = ({
    getContinuousIndicator,
    getCurveSelector,
    getSteppedKnob,
    getWaveformSelector,
    voice
}) => {

    const modulationIndexIndicator =
        voice === xolombrisxInstruments.FMSYNTH
            ? (
                getContinuousIndicator?.('modulationIndex', 'modIdx', styles.modidx, undefined, true)
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
                                { getContinuousIndicator?.('envelope.attack', 'Attack', styles.envelopeAttack)}
                                { getContinuousIndicator?.('envelope.decay', 'Decay', styles.envelopeDecay)}
                            </div>
                            <div className={styles.box}>
                                { getContinuousIndicator?.('envelope.sustain', 'Sustain', styles.envelopeSustain, 'envelopeZero')}
                                { getContinuousIndicator?.('envelope.release', 'Release', styles.envelopeRelease)}
                            </div>
                        </div>
                        <div className={styles.selectors}>
                            { getCurveSelector?.('envelope', 'horizontal', styles.curve)}
                            { getWaveformSelector?.('oscillator.type') }
                        </div>
                        <div className={styles.voices}>
                            <div className={styles.detunePortamento}>
                            { getContinuousIndicator?.('detune', 'Detune', styles.decay, 'detune')}
                            { getContinuousIndicator?.('portamento', 'Portamento', styles.envelopeRelease, 'port')}
                            </div>
                            { getContinuousIndicator?.('volume', 'Volume', styles.volume, 'volume', true) }
                        </div>
                    </div>
                </div>
                <div className={styles.bottom} style={voice === xolombrisxInstruments.AMSYNTH ? { marginLeft: '1.2rem' } : undefined}>
                    <div className={styles.title}>Modulation</div>
                    <div className={styles.indicators}>
                        <div className={styles.envelope}>
                            <div className={styles.box}>
                            { getContinuousIndicator?.('modulationEnvelope.attack', 'Attack', styles.envelopeAttack)}
                            { getContinuousIndicator?.('modulationEnvelope.decay', 'Decay', styles.envelopeDecay)}
                            </div>
                            <div className={styles.box}>
                            { getContinuousIndicator?.('modulationEnvelope.sustain', 'Sustain', styles.decay, 'envelopeZero')}
                            { getContinuousIndicator?.('modulationEnvelope.release', 'Release', styles.envelopeRelease)}
                            </div>
                        </div>
                        <div className={styles.selectors}>
                            { getCurveSelector?.('modulationEnvelope', 'horizontal', styles.curve, 'modulationEnvelope')}
                            { getWaveformSelector?.('modulation.type', styles.waveform)}
                        </div>
                        <div className={styles.voices}>
                        { getContinuousIndicator?.('harmonicity', 'Harm', styles.harmonicity, undefined, true) }
                            {modulationIndexIndicator}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModulationSynth;