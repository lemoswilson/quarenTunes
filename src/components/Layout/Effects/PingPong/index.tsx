import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';
import { getPercentage } from '../../../../containers/Track/utility';


const PingPong: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>PingPong</div>
            { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)}
            { getContinuousIndicator?.('maxDelay', 'maxDelay')}
            { getContinuousIndicator?.('delayTime', 'delayTime')}
            { getContinuousIndicator?.('feedback', 'Feedback')}
        </div>
    )
}

export default PingPong;