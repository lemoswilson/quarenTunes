import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects'
import { getPercentage } from '../../../../containers/Track/utility'

const Chorus: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
    getWaveformSelector,
}) => {

    return (
       <React.Fragment>
        <div className={styles.title}>Chorus</div>
        <div className={styles.wrapper}>
            <div className={`${styles.doubleKnob} ${styles.marginleft}`}>
               <div className={styles.block}>
                { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)}
                { getContinuousIndicator?.('frequency', 'Frequency')}
               </div>
               <div className={styles.block}>
                    { getContinuousIndicator?.('depth', 'Depth')}
                    { getContinuousIndicator?.('feedback', 'Feedback')}
                </div> 
            </div>
            <div className={styles.mid}>
                { getWaveformSelector?.('type', undefined, true)}
            </div>
            <div className={styles.doubleKnob}>
                <div className={styles.block}>
                    { getContinuousIndicator?.('delayTime', 'delayTime')}
                </div>
                <div className={styles.block}>
                    { getContinuousIndicator?.('spread', 'Spread')}
                </div>
            </div>
        </div>
       </React.Fragment>

    )
}

export default Chorus;