import { MutableRefObject, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as Tone from 'tone';
import { ToneObjectContextType } from '../context/ToneObjectsContext';
import { Pattern, setActiveStep } from '../store/Sequencer';
import { timeObjFromEvent } from '../lib/utility';
import { arrangerMode } from '../store/Arranger';
import { sixteenthFromBBSOG } from '../containers/Arranger';

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

    // setting up initial events in first render
    useEffect(() => {

        if (ref_toneObjects.current)
            Object.keys(ref_toneObjects.current.patterns).forEach(patt => {
                const s = Number(patt)

                for (let i = 0; i < trkCount ; i ++)
                    patterns[s].tracks[i].events.forEach((event, eventIdx, arr) => {
                        const time = timeObjFromEvent(eventIdx, event, true)
                        ref_toneObjects.current?.patterns[s][i].instrument.at(time, event.instrument)

                        for (let j = 0; j < effectsLength[i]; j ++)
                            ref_toneObjects.current?.patterns[s][i].effects[j].at(time, event.fx[j])
                    })
            })

    }, [])

    // set transport loop size according to active pattern 
    useEffect(() => {
        if (arrangerMode === "pattern") {
            Tone.Transport.loop = true;
            Tone.Transport.loopEnd = {"16n": activePattLen};
        }
    }, [arrangerMode, activePattLen])

    useEffect(() => {
        if (prev_activePatt && prev_activePatt === activePatt) {
            scheduleOrStop('schedule')
        }
    }, [activePattTrkLen])

    const scheduleOrStop = (option: 'schedule' | 'stop', start?: boolean) => {

        [...Array(ref_trkCount.current).keys()].forEach((__, trk, _) => {
            if (ref_toneObjects.current) {

                if (option === 'schedule'){
                    // ref_toneObjects.current.patterns[ref_activePatt.current][trk].instrument.loopEnd = {'16n': activePatternObj.tracks[trk].length}
                    ref_toneObjects.current.patterns[ref_activePatt.current][trk].instrument.loopEnd = {
                        '16n': patterns[ref_activePatt.current].tracks[trk].length
                    }
                    ref_toneObjects.current.patterns[ref_activePatt.current][trk].instrument.loop = true

                    if (start){
                        ref_toneObjects.current.patterns[activePatt][trk].instrument.start(0)
                    }

                    for (let i = 0; i < effectsLength[trk]; i ++) {
                        // ref_toneObjects.current.patterns[ref_activePatt.current][trk].effects[i].loopEnd = {'16n': activePatternObj.tracks[trk].length}
                        ref_toneObjects.current.patterns[ref_activePatt.current][trk].effects[i].loopEnd = {
                            '16n': patterns[ref_activePatt.current].tracks[trk].length
                    }
                        ref_toneObjects.current.patterns[ref_activePatt.current][trk].effects[i].loop = true;
                        if (start) {
                            ref_toneObjects.current.patterns[ref_activePatt.current][trk].effects[i].start(0)
                        }
                    }

                } else {

                    ref_toneObjects.current.patterns[ref_activePatt.current][trk].instrument.cancel()
                    ref_toneObjects.current.patterns[ref_activePatt.current][trk].instrument.stop()

                    for (let i = 0; i < effectsLength[trk]; i ++) {
                        ref_toneObjects.current?.patterns[ref_activePatt.current][trk].effects[i].cancel() 
                        ref_toneObjects.current?.patterns[ref_activePatt.current][trk].effects[i].stop() 
                    }
                }


            }
        })   

    }

    useEffect(() => {

        if (!isPlay)
            scheduleOrStop(
                arrangerMode === 'pattern' 
                ? 'schedule' 
                : 'stop',
                true
            )

    }, [arrangerMode, activePatt])

    const ref_shouldReset: MutableRefObject<number | null> = useRef(null);

    useEffect(() => {
        if (arrangerMode === 'pattern')

            ref_shouldReset.current = Tone.Transport.scheduleRepeat((time) => {
                dispatch(
                    setActiveStep(
                        sixteenthFromBBSOG(Tone.Transport.position.toString()), 
                        ref_selectedTrkIdx.current, 
                        ref_activePatt.current
                    )
                )
            }, "16n")
        
        if (arrangerMode === 'arranger' && !Number.isNaN(Number(ref_shouldReset.current))) {

            const c: any = ref_shouldReset.current
            Tone.Transport.clear(c)
            ref_shouldReset.current = null;
        }

    }, [arrangerMode])

    return scheduleOrStop
}

export default useSequencerScheduler;