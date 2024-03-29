import { MutableRefObject, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as Tone from 'tone';
import { ToneObjectContextType, triggs } from '../../context/ToneObjectsContext';
import { Pattern, setActiveStep } from '../../store/Sequencer';
import { timeObjFromEvent, sixteenthFromBBSOG, scheduleStartEnd } from '../../lib/utility';

const useSequencerScheduler = (
    ref_toneObjects: ToneObjectContextType,
    trkCount: number,
    ref_trkCount: MutableRefObject<number>,
    ref_selectedTrkIdx: MutableRefObject<number>,
    effectsLength: number[],
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
        part.loop = true;
        part.loopEnd = {'16n': loopEnd};
    }

    function cancelEvents(_: any, part: Tone.Part) {
        part.cancel();
    }

    const scheduleOrStop = (option: 'schedule' | 'stop', start?: boolean) => {

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

    // setting up initial events in first render
    useEffect(() => {
        if (ref_toneObjects.current){
            Object.keys(ref_toneObjects.current.patterns).forEach(patt => {
                const s = Number(patt)

                for (let i = 0; i < trkCount ; i ++)
                    patterns[s].tracks[i].events.forEach((event, eventIdx, arr) => {
                        const time = timeObjFromEvent(eventIdx, event.instrument, true)

                        ref_toneObjects.current?.patterns[s][i].instrument.at(time, event.instrument)

                        for (let j = 0; j < effectsLength[i]; j ++){
                            ref_toneObjects.current?.patterns[s][i].effects[j].at(time, event.fx[j])
                        }
                    })
            })
        }

    }, [])

    // set transport loop size according to active pattern 
    useEffect(() => {

        Tone.Transport.loop = true;
        Tone.Transport.loopEnd = {"16n": activePattLen};

    }, [activePattLen])

    useEffect(() => {
        if (prev_activePatt && prev_activePatt === activePatt) {
            scheduleOrStop('schedule')
        }
    }, [activePattTrkLen])



    useEffect(() => {
        if (Tone.Transport.state !== 'started')
            scheduleOrStop(
                'schedule',
                true
            )

    }, [activePatt])

    const ref_setActiveStepTracker: MutableRefObject<number | null> = useRef(null);

    useEffect(() => {
            ref_setActiveStepTracker.current = Tone.Transport.scheduleRepeat((time) => {
                dispatch(
                    setActiveStep(
                        sixteenthFromBBSOG(Tone.Transport.position.toString()), 
                        ref_selectedTrkIdx.current, 
                        ref_activePatt.current
                    )
                )
            }, "16n")
    }, [])

    return scheduleOrStop
}

export default useSequencerScheduler;