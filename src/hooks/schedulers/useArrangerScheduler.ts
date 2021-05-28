import { useEffect, MutableRefObject, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useQuickRef from '../lifecycle/useQuickRef';
import { useIsPlaySelector } from '../store/Transport/useTransportSelectors';

import * as Tone from 'tone';

import { arrangerMode, songEvent, setActivePlayer } from '../../store/Arranger';
import { pattTrackerSelector, eventStartTimesSelector, hashPatternsSelector } from '../../store/Arranger/selectors';
import { setActiveStep } from '../../store/Sequencer';
import { pattsObjSelector } from '../../store/Sequencer/selectors';
import { stop } from '../../store/Transport';

import { ToneObjectContextType, triggs } from '../../context/ToneObjectsContext';

import { scheduleStartEnd, sixteenthFromBBSOG } from '../../lib/utility';

export const useArrangerScheduler = (
    ref_songEvents: MutableRefObject<songEvent[]>,
    ref_toneObjects: ToneObjectContextType,
    ref_selectedTrkIdx: MutableRefObject<number>,
    trkCount: number,
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
	const hashedPatterns = useSelector(hashPatternsSelector(currentSong));
    const { isPlay, prev_isPlay } = useIsPlaySelector();
    const ref_pattTracker = useQuickRef(pattTracker);
    const ref_eventsStartTimes = useQuickRef(eventStartTimes);
	const ref_goToPatternsIds: MutableRefObject<number[]> = useRef([]);


	//  ** flag ** old code

	const scheduleGoToPattern = (
		start: any, 
		_: any, 
		pattern: number, 
		idx: number
	) => {
		console.log(
			`[useArrangerScheduler]: should be schedulling go to pattern, ${pattern} \
			and arrangerEventIdx: ${idx}`
		)
		
		ref_goToPatternsIds.current.push(Tone.Transport.schedule((time) => {
				console.log('state of scheduled arranger event is ', ref_toneObjects.current?.arranger[idx][0].instrument.state);
				console.log('playback of scheduled arranger event is ', ref_toneObjects.current?.arranger[idx][0].instrument.callback);
				goToPattern(pattern, idx);
			}, start))
	}

	const scheduleOrStop = useCallback((option: 'schedule' | 'stop') => {
		let time = 0;
		console.log(`[useArrangerScheduler]: scheduleOrStop has been called, options is ${option}`)
		console.log(`[useArrangerScheduler]: arranger triggs are`, ref_toneObjects.current?.arranger)

		ref_goToPatternsIds.current.forEach(id => {Tone.Transport.clear(id)});
		ref_goToPatternsIds.current = [];

		ref_songEvents.current.forEach((songEvent, idx, __) => {
			const loopTime  = ref_pattsObj.current[songEvent.pattern].patternLength * songEvent.repeat; // duração do evento total 
			const start = {'16n': time}; // tempo do start do evento
			const end = {'16n': time + loopTime}; 
			time = time + loopTime; 
			if (ref_toneObjects.current){

					scheduleStartEnd(
						ref_toneObjects.current.arranger[idx],
						option === 'schedule' ? start : undefined,
						option === 'schedule' ? end : 'now',
						option === 'schedule' ? scheduleGoToPattern : undefined,
						[songEvent.pattern, idx],
						false, 
						undefined, 
						undefined,
						option === 'schedule' ?  true : false
					)

			} 
		})	

	}, [])

	useEffect(() => {
		if (prev_arrgMode === arrangerMode.ARRANGER && arrgMode === arrangerMode.PATTERN){

			if (ref_arrangerStopper.current) {
				Tone.Transport.clear(ref_arrangerStopper.current)
				ref_arrangerStopper.current = null;
			}

			if (ref_activeStepTracker.current){
				Tone.Transport.clear(ref_activeStepTracker.current);
				ref_activeStepTracker.current = null;
			}

			Tone.Transport.cancel();
			scheduleOrStop('stop');
		}
	}, [arrgMode])

	useEffect(() => {
		if (arrgMode === arrangerMode.ARRANGER){


			if (ref_arrangerStopper.current)
			Tone.Transport.clear(ref_arrangerStopper.current)

			scheduleOrStop('schedule')

			ref_arrangerStopper.current = Tone.Transport.schedule((time) => {
				console.log(`[useArrangerScheduler] should be stopping playback`)
				dispatch(stop())
			}, {'16n': songLength})

		}
	}, [arrgMode, songLength, hashedPatterns, currentSong, trkCount])

	useEffect(() => {
		if (!ref_activeStepTracker.current && arrgMode === arrangerMode.ARRANGER)

			ref_activeStepTracker.current = Tone.Transport.scheduleRepeat((time) => {
				const now = sixteenthFromBBSOG(Tone.Transport.position.toString())
				const init = ref_eventsStartTimes.current[ref_pattTracker.current.activeEventIndex >= 0 ? ref_pattTracker.current.activeEventIndex : ref_pattTracker.current.playbackStart] 
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
			
	}, [arrgMode])


	// reschedule arranger every change in song, eventLength, repeatSum, or 
	// pattern in event 
	// useEffect(() => {
	// 	if (arrgMode === arrangerMode.ARRANGER){
	// 		console.log(`
	// 			[useArrangerScheduler]: either songLength,
	// 			arrgMode, currentSong, trkCount, or hashedPattern has changed
	// 			it's value;
	// 			Setting transport.loop to false and resetting arranger_stopper,
	// 			and then calling schedule or stop	
	// 		`)
	// 		Tone.Transport.loop = false;

	// 		if (ref_arrangerStopper.current)
	// 			Tone.Transport.clear(ref_arrangerStopper.current)

	// 		scheduleOrStop('schedule')

	// 		ref_arrangerStopper.current = Tone.Transport.schedule((time) => {
	// 			console.log(`[useArrangerScheduler] should be stopping playback`)
	// 			dispatch(stop())
	// 		}, {'16n': songLength})

			

	// 	} 
	// }, [songLength, arrgMode, currentSong, trkCount, hashedPatterns]);
	// // }, [songLength, arrgMode, currentSong, trkCount]);

	// useEffect(() => {
	// 	if (prev_arrgMode && arrgMode === arrangerMode.PATTERN){
	// 		console.log(`
	// 			[useArrangerScheduler]: past mode was arranger, now its pattern
	// 			whould be calling schedule or stop to stop, and then 
	// 			clearing arranger stop and activeStepTracker events	
	// 		`)
	// 		scheduleOrStop('stop')
	// 		if (ref_arrangerStopper.current) {
	// 			Tone.Transport.clear(ref_arrangerStopper.current)
	// 			ref_arrangerStopper.current = null;
	// 		}

	// 		if (ref_activeStepTracker.current){
	// 			Tone.Transport.clear(ref_activeStepTracker.current);
	// 			ref_activeStepTracker.current = null;
	// 		}

	// 	} else if (arrgMode === arrangerMode.ARRANGER) {
	// 		console.log(`
	// 		[useArrangerScheduler]: mode is now arranger, 
	// 		should be setting activeStepTracker if there's none
	// 	`)		
	// 		if (!ref_activeStepTracker.current)

	// 			ref_activeStepTracker.current = Tone.Transport.scheduleRepeat((time) => {
	// 				const now = sixteenthFromBBSOG(Tone.Transport.position.toString())
	// 				const init = ref_eventsStartTimes.current[ref_pattTracker.current.activeEventIndex >= 0 ? ref_pattTracker.current.activeEventIndex : ref_pattTracker.current.playbackStart] 
	// 				dispatch(
	// 					setActiveStep(
	// 						now-init, 
	// 						ref_selectedTrkIdx.current, 
	// 						ref_pattTracker.current.patternPlaying >= 0 
	// 							? ref_pattTracker.current.patternPlaying 
	// 							: ref_songEvents.current[ref_pattTracker.current.playbackStart].pattern
	// 					)
	// 				)

	// 			}, '16n')
	// 	}
	// }, [arrgMode])

	useEffect(() => {
		if (prev_isPlay && !isPlay && arrgMode === arrangerMode.ARRANGER) {
			console.log(`
				[useArrangerScheduler]: transport just stopped, should be setting resetting
				active player, as well as sending position back to playbackstart
			`)
			Tone.Transport.position = {'16n': eventStartTimes[pattTracker.playbackStart]}
			dispatch(setActivePlayer(-1, -1));
		}

	}, [isPlay, arrgMode, prev_isPlay, pattTracker.playbackStart, eventStartTimes])


    return { isPlay, pattsObj }

}