import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';
import { getPercentage } from '../../../../containers/Track/utility';


const Tremolo: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
    getWaveformSelector,
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>Tremolo</div>
            { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)} 
            { getContinuousIndicator?.('frequency', 'Frequency')}
            { getWaveformSelector?.('type', undefined, true )}
            { getContinuousIndicator?.('depth', 'Depth')}
            { getContinuousIndicator?.('spread', 'Spread')}
        </div>

    )
}

export default Tremolo;