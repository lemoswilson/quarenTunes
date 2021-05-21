import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';
import { getPercentage } from '../../../../containers/Track/utility';


const AutoPan: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
    getWaveformSelector,
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>AutoPan</div>
            { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)} 
            { getContinuousIndicator?.('frequency', 'Frequency')}
            { getContinuousIndicator?.('depth', 'Depth')}
            { getWaveformSelector?.('type', undefined, true )}
        </div>

    )
}

export default AutoPan;