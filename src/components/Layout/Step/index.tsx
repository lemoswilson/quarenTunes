import React, { useContext } from 'react';
import styles from './style.module.scss';
import Lights from './Lights';
import { event } from '../../../store/Sequencer'
import TriggCtx from '../../../context/triggState';
import { useTrigg } from '../../../hooks/useProperty';
import usePrevious from '../../../hooks/usePrevious';

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
    const triggRefs = useContext(TriggCtx)

    useTrigg(
        triggRefs.current[activePattern][selectedTrack].instrument,
        triggRefs.current[activePattern][selectedTrack].effects,
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