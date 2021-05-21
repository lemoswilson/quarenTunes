import React from 'react';
import styles from './style.module.scss';
import { getPercentage } from '../../../../containers/Track/utility';
import { effectLayoutProps } from '../../../../containers/Track/Effects';


const JCVerb: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
}) => {


    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>JCVerb</div>
            { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)}
            { getContinuousIndicator?.('roomSize', 'RoomSize')}
        </div>
    )
}

export default JCVerb;