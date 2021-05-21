import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';


const FreqShifter: React.FC<effectLayoutProps> = ({
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
            <div className={styles.title}>FreqShifter</div>
            { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)}
            { getContinuousIndicator?.('frequency', 'Frequency')}
        </div>
    )
}

export default FreqShifter;