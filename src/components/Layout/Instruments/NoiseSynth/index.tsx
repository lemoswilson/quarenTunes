import React from 'react';
import styles from './style.module.scss';
import { InstrumentLayoutProps } from '../../../../containers/Track/Instruments/InstrumentLoader'


const NoiseSynth: React.FC<InstrumentLayoutProps> = ({
    getContinuousIndicator,
    getCurveSelector,
    getSteppedKnob
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.sideTitle}><h1>NoiseSynth</h1></div>
            <div className={styles.tweakers}>
                <div className={styles.top}>
                    <div className={styles.title}>Noise</div>
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
                            <div className={styles.fade}>
                            { getContinuousIndicator?.('noise.fadeIn', 'FadeIn', styles.in, 'envelopeZero') }
                            { getContinuousIndicator?.('noise.fadeOut', 'FadeOut', styles.out, 'envelopeZero') }
                            </div>
                        </div>
                        <div className={styles.voices}>
                        { getContinuousIndicator?.('volume', 'Volume', styles.volume, 'volume', true) }
                            <div className={styles.rateType}>
                            { getContinuousIndicator?.('noise.playbackRate', 'Rate', styles.rate)}
                            { getSteppedKnob?.('noise.type', 'Type', styles.type)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NoiseSynth;