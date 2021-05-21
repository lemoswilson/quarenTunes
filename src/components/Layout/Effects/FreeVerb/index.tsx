import React from 'react';
import styles from './style.module.scss';
import { effectLayoutProps } from '../../../../containers/Track/Effects';
import { getPercentage } from '../../../../containers/Track/utility';


const FreeVerb: React.FC<effectLayoutProps> = ({
    getContinuousIndicator,
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>FreeVerb</div>
            { getContinuousIndicator?.('wet', 'Dry/Wet', undefined, undefined, undefined, getPercentage)}
            { getContinuousIndicator?.('dampening', 'Dampening')}
            { getContinuousIndicator?.('roomSize', 'RoomSize')}
        </div>
    )
}

export default FreeVerb;