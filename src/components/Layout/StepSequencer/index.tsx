import React, { MouseEvent } from 'react';
import { event } from '../../../store/Sequencer'
import { range, startEndRange, bisect } from '../../../lib/utility';
import styles from './style.module.scss';
import PrevNext from '../../UI/PrevNext';
import StepLayout from '../../UI/Step';
import { getFinalStep } from '../../../lib/utility';

interface StepSequencerProps {
    page: number,
    length: number,
    events: event[],
    activePatt: number,
    // activeSongPattern: number,
    selectedTrkIdx: number,
    selected: number[],
    className?: string,
    // arrgMode: arrangerMode,
    isPlay: boolean,
    activeStep: number,
    changePage: (e: MouseEvent, pageIndex: number) => void,
    selectStep: (step: number) => void,
}

const StepSequencer: React.FC<StepSequencerProps> = ({
    activePatt,
    changePage,
    selectStep,
    activeStep,
    // activeSongPattern,
    // arrgMode,
    isPlay,
    className,
    events,
    length,
    selected,
    page,
    selectedTrkIdx,
    children
}) => {

    const finalStep = getFinalStep(page, length)

    const _selectStep = (e: MouseEvent, step: number) => {
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

    const patternPageStyle = (p: number) => (
        { 
            backgroundColor: 
                p === page 
                ? "#ea8686" 
                : Math.floor(activeStep / 16) === p && isPlay
                ? "#ff9f1c" : "white" 
        }
    )

    // const arrangerPageStyle = (p: number) => {
    //     if (activePatt === activeSongPattern)
    //         return patternPageStyle(p)
    //     else return ({
    //         backgroundColor: 
    //             p === page
    //             ? "#ea8686"
    //             : "white"
    //     })
    // }

    const pageStyle = (p: number) =>  patternPageStyle(p) 
    const shouldNext = length > page + 1 * 16
    const isActiveStep = (step: number) => activeStep === step
    const onTime = (step: number) => isPlay && isActiveStep(step)
    const prevPage = (e: React.MouseEvent) => { page !== 0 && changePage(e, page - 1) }
    const nextPage = (e: React.MouseEvent) => { page < 3 && changePage(e, page + 1) }


    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>
                <h1>Sequencer</h1>
            </div>
            <div className={styles.overlay}>
                <div className={styles.prev}>
                    {
                        page > 0 
                        ? <PrevNext 
                            direction="previous" 
                            width='125%' 
                            height='125%' 
                            onClick={prevPage} 
                        /> 
                        : null}
                </div>
                <div className={styles.stepsWrapper}>
                    <div className={styles.pages}>
                        {range(Math.ceil(length / 16)).map(p => {
                            return (
                                <div 
                                    key={`pattern:${activePatt}:page${p}`} 
                                    onClick={(e) => { changePage(e,p) }} 
                                    className={styles.pageSelector}
                                >
                                    <div style={pageStyle(p)} 
                                        className={styles.indicator}
                                    ></div>
                                </div>
                            )
                        })}
                    </div>
                    <div className={styles.steps}>
                        {startEndRange(page * 16, finalStep).map((step, idx, __) => {
                            return (
                                <div 
                                    key={`${activePatt}:${selectedTrkIdx}:${idx}`} 
                                    className={styles.step}
                                >
                                    <StepLayout
                                        onClick={(e) => { _selectStep(e, step)}}
                                        activePattern={activePatt}
                                        event={events[step]}
                                        index={step}
                                        selectedTrack={selectedTrkIdx}
                                        un={`activePatt${activePatt}:track${selectedTrkIdx}:step${step}`}
                                        onTime={onTime(step)}
                                        selected={selected.includes(step)}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className={styles.next}>
                    {
                        shouldNext
                        ? <PrevNext 
                            direction="next" 
                            onClick={nextPage} 
                            width='125%' 
                            height='125%' 
                        /> 
                        : null}
                </div>
            </div>
        </div>
    )
};

export default StepSequencer;
