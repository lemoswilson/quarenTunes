import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';


const Filter: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
    getSteppedKnob,
}) => {

    return (
       <React.Fragment>
        <div className={styles.title}>Filter</div>
        <div className={styles.wrapper}>
                { getSteppedKnob?.('type', 'Type', styles.steppedKnob, styles.titleClass)}
                { getContinuousIndicator?.('Q', 'Q')}
                { getContinuousIndicator?.('detune', 'Detune')}
                { getContinuousIndicator?.('frequency', 'Frequency')}
                { getContinuousIndicator?.('gain', 'Gain', undefined, 'detune')}
                { getSteppedKnob?.('rolloff', 'Rolloff', styles.steppedKnob, styles.titleClass)}
        </div>
       </React.Fragment>

    )
}

export default Filter;