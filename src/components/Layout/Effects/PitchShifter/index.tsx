import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';
import { getPercentage } from '../../../../containers/Track/utility';

const PitchShifter: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
}) => {


    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>PitchShifter</div>
            { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)}
            { getContinuousIndicator?.('pitch', 'Pitch', undefined, 'detune')}
            { getContinuousIndicator?.('feedback', 'Feedback')}
            { getContinuousIndicator?.('delayTime', 'delayTime')}
            { getContinuousIndicator?.('windowSize', 'windowSize')}
        </div>

    )
}

export default PitchShifter;