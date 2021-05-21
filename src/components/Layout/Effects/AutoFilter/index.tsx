import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects'
import { getPercentage } from '../../../../containers/Track/utility';


const AutoFilter: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
    getSteppedKnob,
    getWaveformSelector,
}) => {


    return (
       <React.Fragment>
        <div className={styles.title}>AutoFilter</div>
        <div className={styles.wrapper}>
            <div className={`${styles.doubleKnob} ${styles.marginleft}`}>
               <div className={styles.block}>
                    { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)}
                    { getContinuousIndicator?.('frequency', 'Frequency')}
               </div>
               <div className={styles.block}>
               { getContinuousIndicator?.('depth', 'Depth')}
               { getContinuousIndicator?.('octaves', 'Octaves')}
                </div> 
            </div>
            <div className={styles.mid}>
                { getWaveformSelector?.('type', undefined, true)}
            </div>
            <div className={styles.doubleKnob}>
                <div className={styles.block}>
                    { getContinuousIndicator?.('baseFrequency', 'baseFreq')}
                    { getSteppedKnob?.('filter.rolloff', 'Rolloff', styles.steppedKnob, styles.titleClass)}
                </div>
                <div className={styles.block}>
                    { getContinuousIndicator?.('filter.Q', 'Q') }
                    { getSteppedKnob?.('filter.type', 'Type', styles.steppedKnob, styles.titleClass)}
                </div>
            </div>
        </div>
       </React.Fragment>

    )
}

export default AutoFilter;