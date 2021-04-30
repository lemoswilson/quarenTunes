import React, { MouseEvent } from 'react';
import Step from './Step/Step'
import { eventOptions } from '../../containers/Track/Instruments';
import { event } from '../../store/Sequencer'
import { range, startEndRange, bisect } from '../../lib/utility';
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
    // changePage: (pageIndex: number) => void,
    changePage: (e: MouseEvent, pageIndex: number) => void,
    selectStep: (step: number) => void,
    // finalStep: () => number,
}

const StepSequencer: React.FC<StepSequencerProps> = ({
    activePattern,
    changePage,
    selectStep,
    // finalStep,
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
            || (page === 3 && length <= 64)
        ) {
            return length - 1
        } else if (page === 1 && length > 32) {
            return 31
        } else if (page === 2 && length > 48) {
            return 47
        } else {
            return 15
        }
    };

    const selStep = (e: MouseEvent, step: number) => {
        if (e.shiftKey) {
            const i = bisect(selected, step)
            if (!i){
                selectStep(step)
            } else {
                const pre = selected[i-1]
                if (pre >= page * 16)
                    startEndRange(pre+1, step).forEach(selectStep)
            }
        } else {
            selectStep(step)
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>
                <h1>Sequencer</h1>
            </div>
            <div className={styles.overlay}>
                {/* <div className={styles.prev}>{page > 0 ? <PrevNext direction="previous" onClick={() => { page !== 0 && changePage(page - 1) }} width='125%' height='125%' /> : null}</div> */}
                <div className={styles.prev}>{page > 0 ? <PrevNext direction="previous" onClick={(e) => { page !== 0 && changePage(e, page - 1) }} width='125%' height='125%' /> : null}</div>
                <div className={styles.stepsWrapper}>
                    <div className={styles.pages}>
                        {range(Math.ceil(length / 16)).map(p => {
                            return (
                                // <div key={p} onClick={() => { changePage(p) }} className={styles.pageSelector}>
                                <div key={p} onClick={(e) => { changePage(e,p) }} className={styles.pageSelector}>
                                    <div style={{ backgroundColor: p === page ? "#ea8686" : "white" }} className={styles.indicator}></div>
                                </div>
                            )
                        })}
                    </div>
                    <div className={styles.steps}>
                        {startEndRange(page * 16, finalStep()).map((step, idx, __) => {
                            return (
                                <div key={`${activePattern}:${selectedTrack}:${idx}`} className={styles.step}>
                                    <StepLayout
                                        // onClick={() => { selectStep(step) }}
                                        onClick={(e) => { selStep(e, step)}}
                                        activePattern={activePattern}
                                        event={events[step]}
                                        index={step}
                                        selectedTrack={selectedTrack}
                                        un={`${activePattern}:${selectedTrack}:${step}`}
                                        onTime={false}
                                        selected={selected.includes(step)}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
                {/* <div className={styles.next}>{(page === 0 && length > 16) || (page === 1 && length > 32) || (page === 2 && length > 48) ? <PrevNext direction="next" onClick={() => { true && changePage(page + 1) }} width='125%' height='125%' /> : null}</div> */}
                <div className={styles.next}>{(page === 0 && length > 16) || (page === 1 && length > 32) || (page === 2 && length > 48) ? <PrevNext direction="next" onClick={(e) => { true && changePage(e, page + 1) }} width='125%' height='125%' /> : null}</div>
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
