import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';

const FeedbackDelay: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
}) => {

    const getPercentage = (value: number | '*'): number | '*' => {
        if (value === '*')
            return value
        else
            return Number((100 * value).toFixed(4))
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>FeedDelay</div>
            { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)}
            { getContinuousIndicator?.('maxDelay', 'maxDelay')}
            { getContinuousIndicator?.('delayTime', 'delayTime')}
            { getContinuousIndicator?.('feedback', 'Feedback')}
        </div>
    )
}

export default FeedbackDelay;