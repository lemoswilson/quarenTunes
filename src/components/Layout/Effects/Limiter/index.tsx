import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';


const Limiter: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>Limiter</div>
            { getContinuousIndicator?.('threshold', 'Threshold')}
        </div>
    )

}

export default Limiter;