import React from 'react';
import styles from './style.module.scss';
import { InstrumentLayoutProps } from '../../../../containers/Track/Instruments/InstrumentLoader'


const MembraneSynth: React.FC<InstrumentLayoutProps> = ({
    getContinuousIndicator,
    getCurveSelector,
    getSteppedKnob,
    getWaveformSelector
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.sideTitle}><h1>MembraneSynth</h1></div>
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
                                { getContinuousIndicator?.('detune', 'Detune', undefined, 'detune')}
                                { getContinuousIndicator?.('portamento', 'Portamento', undefined, 'port')}
                            </div>
                            { getContinuousIndicator?.('volume', 'Volume', undefined, 'volume', true) }
                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    {/* <div className={styles.title}></div> */}
                    <div className={styles.indicators}>
                    { getContinuousIndicator?.('octaves', 'Octaves')}
                    { getContinuousIndicator?.('pitchDecay', 'pitchDecay')}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MembraneSynth;