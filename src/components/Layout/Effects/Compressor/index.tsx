import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';

const Compressor: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>Compressor</div>
            { getContinuousIndicator?.('attack', 'Attack')}
            { getContinuousIndicator?.('ratio', 'Ratio')}
            { getContinuousIndicator?.('threshold', 'Threshold', undefined, 'volume')}
            { getContinuousIndicator?.('release', 'Release')}
            { getContinuousIndicator?.('knee', 'Knee')}
        </div>
    )
}

export default Compressor;