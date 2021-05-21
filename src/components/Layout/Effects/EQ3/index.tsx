import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects'


const EQ3: React.FC<effectLayoutProps> = ({
    getContinuousIndicator
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>EQ3</div>
            { getContinuousIndicator?.('lowFrequency', 'LowFreq', undefined, undefined, undefined, (v) => !Number.isNaN(Number(v)) ? Math.round(Number(v)) : v)}
            { getContinuousIndicator?.('low', 'LowGain', undefined, 'detune' )}
            { getContinuousIndicator?.('mid', 'MidGain', undefined, 'detune')}
            { getContinuousIndicator?.('highFrequency', 'HighFreq', undefined, undefined, undefined, (v) => !Number.isNaN(Number(v)) ? Math.round(Number(v)) : v)}
            { getContinuousIndicator?.('high', 'HighGain', undefined, 'detune')}
        </div>
    )
}

export default EQ3;