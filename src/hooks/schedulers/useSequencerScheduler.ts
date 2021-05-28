import { MutableRefObject, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as Tone from 'tone';
import { ToneObjectContextType, triggs } from '../../context/ToneObjectsContext';
import { Pattern, setActiveStep } from '../../store/Sequencer';
import { timeObjFromEvent, sixteenthFromBBSOG, scheduleStartEnd } from '../../lib/utility';
import { arrangerMode } from '../../store/Arranger';

const useSequencerScheduler = (
    ref_toneObjects: ToneObjectContextType,
    trkCount: number,
    ref_trkCount: MutableRefObject<number>,
    ref_selectedTrkIdx: MutableRefObject<number>,
    effectsLength: number[],
    arrangerMode: arrangerMode,
    patterns: {[key: number]: Pattern},
    activePatt: number,
    ref_activePatt: MutableRefObject<number>,
    prev_activePatt: number,
    activePattLen: number,
    activePattTrkLen: number,
    isPlay: boolean,
) => {

    const dispatch = useDispatch();
    
    function setLoopEnd(_: any, part: Tone.Part, loopEnd: any) {
        console.log(`
            [useSequencerScheduler]: setting loopEnd  
        `)
        part.loop = true;
        part.loopEnd = {'16n': loopEnd};
    }

    function cancelEvents(_: any, part: Tone.Part) {
        console.log(`
            [useSequencerScheduler]: canceling event
        `)
        part.cancel();
    }

    // setting up initial events in first render
    useEffect(() => {
        if (ref_toneObjects.current){
            console.log(`
                [useSequencerScheduler]: should be setting events in 
                initial render into patterns
            `)
            Object.keys(ref_toneObjects.current.patterns).forEach(patt => {
                const s = Number(patt)
                console.log(`
                [useSequencerScheduler]: setting events into pattern ${patt}
                `)
                for (let i = 0; i < trkCount ; i ++)
                    patterns[s].tracks[i].events.forEach((event, eventIdx, arr) => {
                        const time = timeObjFromEvent(eventIdx, event.instrument, true)
                        console.log(`
                            [useSequencerScheduler]: setting instrument event at step$ ${eventIdx}
                        `)
                        ref_toneObjects.current?.patterns[s][i].instrument.at(time, event.instrument)

                        for (let j = 0; j < effectsLength[i]; j ++){
                            console.log(`
                                [useSequencerScheduler]: fx event at step ${eventIdx}
                            `)
                            ref_toneObjects.current?.patterns[s][i].effects[j].at(time, event.fx[j])
                        }
                    })
            })
        }

    }, [])

    // set transport loop size according to active pattern 
    useEffect(() => {
        if (arrangerMode === "pattern") {
            console.log(`
                [useSequencerScheduler]: arranger mode is pattern, setting loop, 
                activePatt len has changed
            `)
            Tone.Transport.loop = true;
            Tone.Transport.loopEnd = {"16n": activePattLen};
        }
    }, [arrangerMode, activePattLen])

    useEffect(() => {
        if (prev_activePatt && prev_activePatt === activePatt) {
            console.log(`
                [useSequencerScheduler]: activePattTrkLen has changed, 
                should be scheduling again (loop end will change)
            `)
            scheduleOrStop('schedule')
        }
    }, [activePattTrkLen])

    const scheduleOrStop = (option: 'schedule' | 'stop', start?: boolean) => {
        console.log(`
            [useSequencerScheduler]: scheduleOrStop has been caled, options is ${option}
        `);

        [...Array(ref_trkCount.current).keys()].forEach((__, trk, _) => {
            if (ref_toneObjects.current) {
                
                scheduleStartEnd(
                    ref_toneObjects.current.patterns[ref_activePatt.current],
                    option === 'schedule' ? 0 : undefined,
                    option === 'schedule' ? undefined : 'now',
                    option === 'schedule' ? setLoopEnd : cancelEvents,
                    option === 'schedule' 
                        ? [patterns[ref_activePatt.current].tracks[trk].length]
                        : undefined,
                    option === 'schedule' ? true : undefined,
                )
            }
        })   

    }

    useEffect(() => {

        if (!isPlay) {
            console.log(`
                [useSequencerScheduler]: arranger mode or pattern active patt has just changed, 
                should be either schedulling or stopping
            `);
            scheduleOrStop(
                arrangerMode === 'pattern' 
                ? 'schedule' 
                : 'stop',
                true
            )
        }

    }, [arrangerMode, activePatt])

    const ref_setActiveStepTracker: MutableRefObject<number | null> = useRef(null);

    useEffect(() => {
        if (arrangerMode === 'pattern')
            console.log(`
                [useSequencerScheduler]: arranger mode is pattern, should be setting the 
                activeStepTracker
            `);
            ref_setActiveStepTracker.current = Tone.Transport.scheduleRepeat((time) => {
                dispatch(
                    setActiveStep(
                        sixteenthFromBBSOG(Tone.Transport.position.toString()), 
                        ref_selectedTrkIdx.current, 
                        ref_activePatt.current
                    )
                )
            }, "16n")
        
        if (arrangerMode === 'arranger' && !Number.isNaN(Number(ref_setActiveStepTracker.current))) {
            console.log(`\
                [useSequencerScheduler]: arranger mode is arranger, and there is a activeStepTracker, 
                so should be removing it 
            `);
            const c: any = ref_setActiveStepTracker.current
            Tone.Transport.clear(c)
            ref_setActiveStepTracker.current = null;
        }

    }, [arrangerMode])

    return scheduleOrStop
}

export default useSequencerScheduler;