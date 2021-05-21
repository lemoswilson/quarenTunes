import React from 'react';
import styles from './style.module.scss';
import { InstrumentLayoutProps } from '../../../../containers/Track/Instruments/InstrumentLoader'

const MetalSynth: React.FC<InstrumentLayoutProps> = ({
    getContinuousIndicator,
    getCurveSelector,
    getSteppedKnob,
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.sideTitle}><h1>MetalSynth</h1></div>
            <div className={styles.tweakers}>
                <div className={styles.top}>
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
                            <div className={styles.octavesResonance}>
                                { getContinuousIndicator?.('octaves', 'Octaves') }
                                { getContinuousIndicator?.('resonance', 'Resonance', styles.resonance) }
                            </div>
                        </div>
                        <div className={styles.voices}>
                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <div className={styles.indicators}>
                        <div className={styles.sliders}>
                        { getContinuousIndicator?.('volume', 'Volume', styles.volume, 'volume', true) }
                        { getContinuousIndicator?.('harmonicity', 'Harm', styles.harmonicity, undefined, true) }
                        { getContinuousIndicator?.('modulationIndex', 'modIdx', styles.modulationIndex, undefined, true) }
                        </div>
                        <div className={styles.detunePortamento}>
                        { getContinuousIndicator?.('detune', 'Detune', undefined, 'detune') }
                        { getContinuousIndicator?.('portamento', 'Portamento', undefined, 'port') }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MetalSynth;