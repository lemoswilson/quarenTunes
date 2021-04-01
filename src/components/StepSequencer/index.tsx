import React from 'react';
import Step from './Step/Step'
import { eventOptions } from '../../containers/Track/Instruments';
import { event } from '../../store/Sequencer'
import { range, startEndRange } from '../../lib/utility';
import styles from './style.module.scss';
import PrevNext from '../Layout/PrevNext';
import StepLayout from '../Layout/Step';

interface StepSequencerProps {
    page: number,
    length: number,
    events: event[],
    activePattern: number,
    selectedTrack: number,
    selected: number[],
    className?: string,
    changePage: (pageIndex: number) => void,
    selectStep: (step: number) => void,
}

const StepSequencer: React.FC<StepSequencerProps> = ({
    activePattern,
    changePage,
    selectStep,
    className,
    events,
    length,
    selected,
    page,
    selectedTrack,
    children
}) => {

    const finalStep = () => {
        if ((page === 0 && length <= 16)
            || (page === 1 && length <= 32)
            || (page === 2 && length <= 48)
        ) {
            return length - 1
        } else if (page === 1 && length > 32) {
            return 31
        } else if (page === 2 && length > 48) {
            return 47
        } else {
            return 15
        }
        // } else if (page === 2 && length > 16) {
        //     return 15
        // }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>
                <h1>Sequencer</h1>
            </div>
            <div className={styles.overlay}>
                <div className={styles.prev}><PrevNext direction="previous" onClick={() => { page !== 0 && changePage(page - 1) }} width='125%' height='125%' /></div>
                <div className={styles.stepsWrapper}>
                    <div className={styles.pages}>
                        {range(Math.ceil(length / 16)).map(p => {
                            return (
                                <div key={p} onClick={() => { changePage(p) }} className={styles.pageSelector}>
                                    <div style={{ backgroundColor: p === page ? "#ea8686" : "white" }} className={styles.indicator}></div>
                                </div>
                            )
                        })}
                    </div>
                    <div className={styles.steps}>
                        {startEndRange(page * 16, finalStep()).map((step, idx, __) => {
                            return (
                                <div key={step} className={styles.step}>
                                    <StepLayout onClick={() => { selectStep(step) }} onTime={false} selected={selected.includes(step)}></StepLayout>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className={styles.next}><PrevNext direction="next" onClick={() => { page !== 3 && changePage(page + 1) }} width='125%' height='125%' /></div>
            </div>
            {/* insert step component here
             will also send events.offset pra cada um deles como offset props */}
            {/* {range(page * 16, finalStep()).map(idx => {
                return <Step
                    activePattern={activePattern}
                    event={events[idx]}
                    index={idx}
                    selected={selected}
                    selectedTrack={selectedTrack}
                    tempo={idx + 1}
                    un={`${activePattern}:${selectedTrack}:${idx}`}
                    key={`${activePattern}:${selectedTrack}:${idx}`}
                ></Step>
            })} */}
        </div>
    )
};

export default StepSequencer;