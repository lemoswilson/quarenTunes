import { useEffect, useCallback, MutableRefObject, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useQuickRef from './useQuickRef';
import { useIsPlaySelector } from './store/useTransportSelectors';

import * as Tone from 'tone';

import { arrangerMode, songEvent, setActivePlayer } from '../store/Arranger';
import { pattTrackerSelector, eventStartTimesSelector } from '../store/Arranger/selectors';
import { setActiveStep } from '../store/Sequencer';
import { pattsObjSelector } from '../store/Sequencer/selectors';
import { stop } from '../store/Transport';

import { ToneObjectContextType } from '../context/ToneObjectsContext';

import { scheduleStartEnd, sixteenthFromBBSOG } from '../lib/utility';

export const useArrangerScheduler = (
    ref_songEvents: MutableRefObject<songEvent[]>,
    ref_toneObjects: ToneObjectContextType,
    ref_selectedTrkIdx: MutableRefObject<number>,
    trkCount: number,
    hashedPatterns: number,
    currentSong: number,
    arrgMode: arrangerMode,
    prev_arrgMode: arrangerMode,
    songLength: number,
    goToPattern: (pattern: number, eventIndex: number) => void,
) => {
    const dispatch = useDispatch();

    const ref_arrangerStopper: MutableRefObject<number | null> = useRef(null);
    const ref_activeStepTracker: MutableRefObject<number | null> = useRef(null);

    const pattsObj = useSelector(pattsObjSelector);
    const ref_pattsObj = useQuickRef(pattsObj);
    const pattTracker = useSelector(pattTrackerSelector);
    const eventStartTimes = useSelector(eventStartTimesSelector(currentSong, pattsObj))
    const { isPlay, prev_isPlay } = useIsPlaySelector();
    const ref_pattTracker = useQuickRef(pattTracker);
    const ref_eventsStartTimes = useQuickRef(eventStartTimes);

	const scheduleGoToPattern = (
		start: any, 
		_: any, 
		pattern: number, 
		idx: number
	) => {
		Tone.Transport.schedule((time) => {
			goToPattern(pattern, idx);
		}, start)
	}

	const scheduleOrStop = useCallback((option: 'schedule' | 'stop') => {
		let time = 0;

		ref_songEvents.current.forEach((songEvent, idx, __) => {
			const loopTime  = ref_pattsObj.current[songEvent.pattern].patternLength * songEvent.repeat;
			const start = {'16n': time};
			const end = {'16n': time + loopTime};
			time = time + loopTime;

			if (ref_toneObjects.current)
				scheduleStartEnd(
					ref_toneObjects.current.arranger[idx],
					start,
					end,
					scheduleGoToPattern,
					[songEvent.pattern, idx],
					false, 
					undefined, 
					undefined,
					option === 'schedule' ?  true : false
				)
		})	

	}, [])


	// reschedule arranger every change in song, eventLength, repeatSum, or 
	// pattern in event 
	useEffect(() => {
		if (arrgMode === arrangerMode.ARRANGER){
			Tone.Transport.loop = false;

			if (ref_arrangerStopper.current)
				Tone.Transport.clear(ref_arrangerStopper.current)

			scheduleOrStop('schedule')

			ref_arrangerStopper.current = Tone.Transport.schedule((time) => {
				dispatch(stop())
			}, {'16n': songLength})

		} 
	}, [songLength, arrgMode, currentSong, trkCount, hashedPatterns]);
	// }, [songLength, arrgMode, currentSong, trkCount]);

	useEffect(() => {
		if (prev_arrgMode && arrgMode === arrangerMode.PATTERN){
			scheduleOrStop('stop')
			if (ref_arrangerStopper.current) {
				Tone.Transport.clear(ref_arrangerStopper.current)
				ref_arrangerStopper.current = null;
			}

			if (ref_activeStepTracker.current){
				Tone.Transport.clear(ref_activeStepTracker.current);
				ref_activeStepTracker.current = null;
			}

		} else if (arrgMode === arrangerMode.ARRANGER) {
			if (!ref_activeStepTracker.current)

				ref_activeStepTracker.current = Tone.Transport.scheduleRepeat((time) => {
					const now = sixteenthFromBBSOG(Tone.Transport.position.toString())
					const init = ref_eventsStartTimes.current[ref_pattTracker.current.activeEventIndex] 
					dispatch(
						setActiveStep(
							now-init, 
							ref_selectedTrkIdx.current, 
							ref_pattTracker.current.patternPlaying >= 0 
								? ref_pattTracker.current.patternPlaying 
								: ref_songEvents.current[ref_pattTracker.current.playbackStart].pattern
						)
					)

				}, '16n')
		}
	}, [arrgMode])

	useEffect(() => {
		if (prev_isPlay && !isPlay && arrgMode === arrangerMode.ARRANGER) {
			Tone.Transport.position = {'16n': eventStartTimes[pattTracker.playbackStart]}
			dispatch(setActivePlayer(-1, -1));
		}

	}, [isPlay, arrgMode, prev_isPlay, pattTracker.playbackStart, eventStartTimes])

    return { isPlay, pattsObj }

}