import React, { useContext } from 'react';
import styles from './style.module.scss';
import Lights from './Lights';
import { event } from '../../../store/Sequencer'
import ToneObjectsContext from '../../../context/ToneObjectsContext';
import { useTrigg } from '../../../hooks/store/Track/useProperty';
import usePrevious from '../../../hooks/lifecycle/usePrevious';

interface StepLayout {
    onTime: boolean;
    selected: boolean;
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    className?: string;
    activePattern: number,
    selectedTrack: number,
    index: number,
    event: event,
    un: string,
}

const StepLayout: React.FC<StepLayout> = ({
    onTime,
    selected,
    onClick,
    className,
    activePattern,
    event,
    index,
    selectedTrack,
    un
}) => {
    const previousOffset = usePrevious(event.offset);
    const selectedStyle = selected ? styles.selected : null;
    const toneObjects = useContext(ToneObjectsContext)

    // useEffect(() => {
    //     console.log('index', index, 'previousOffset', previousOffset)
    // })

    useTrigg(
        toneObjects.current?.patterns[activePattern][selectedTrack],
        event.fx,
        event.instrument,
        index,
        previousOffset,
        un
    )

    return (
        <div className={`${styles.box} ${className}`}>
            <div className={styles.buttonWrapper}>
                <div className={styles.outer}>
                    <div onClick={onClick} className={`${styles.inner} ${selectedStyle}`}></div>
                </div>
            </div>
            <div className={styles.wrapper}>
                <Lights className={styles.light} active={onTime}></Lights>
            </div>
        </div>
    )
}

export default StepLayout;