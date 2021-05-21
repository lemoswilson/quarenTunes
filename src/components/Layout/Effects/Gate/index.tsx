import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';


const Gate: React.FC<effectLayoutProps> = ({
    getContinuousIndicator
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>Gate</div>
            { getContinuousIndicator?.('smoothing', 'Smoothing')}
            { getContinuousIndicator?.('threshold', 'Threshold', undefined, 'volume')}
        </div>
    )
}

export default Gate;