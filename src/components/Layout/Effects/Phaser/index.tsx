import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects'
import { getPercentage } from '../../../../containers/Track/utility';

const Phaser: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
    getSteppedKnob,
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>Phaser</div>
            { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)}
            { getContinuousIndicator?.('octaves', 'Octaves')}
            { getContinuousIndicator?.('frequency', 'Frequency')}
            { getContinuousIndicator?.('baseFrequency', 'baseFreq')}
            { getContinuousIndicator?.('Q', 'Q')}
            { getSteppedKnob?.('stages', 'Stages')}
        </div>

    )
}

export default Phaser;