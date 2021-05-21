import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects'
import { getPercentage } from '../../../../containers/Track/utility';


const Distortion: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
    getSteppedKnob,
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>Distortion</div>
                { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)} 
                { getSteppedKnob?.('oversample', 'Oversample')}
                { getContinuousIndicator?.('distortion', 'Distortion')} 
        </div>

    )
}

export default Distortion;