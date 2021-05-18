import React, {
	useEffect,
	useRef,
	FunctionComponent,
	KeyboardEvent,
	MouseEvent,
	useContext,
	useState,
	useCallback,
	MutableRefObject
} from "react";
import usePrevious from "../../hooks/usePrevious";
import { useDispatch, useSelector } from "react-redux";
import { Part } from 'tone';
import {
	addRow,
	// setTracker,
	addSong,
	setMode,
	renameSong,
	removeRow,
	removeSong,
	selectSong,
	swapEvents,
	setMute,
	setPattern,
	setRepeat,
	songEvent,
	increaseDecreaseRepeat,
	arrangerMode,
	setActivePlayer
} from "../../store/Arranger";
import { goToActive, selectPattern, setActiveStep } from '../../store/Sequencer'
// import ToneContext from '../../context/ToneContext';
import { RootState } from "../Xolombrisx";
import styles from './style.module.scss';

import * as Tone from 'tone';

import Dropdown from '../../components/Layout/Dropdown';
import Minus from '../../components/Layout/Icons/Minus';
import Plus from '../../components/Layout/Icons/Plus';
import NumberBox from '../../components/Layout/NumberBox';

import Event from '../../components/Layout/Arranger/Event';

import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import ToneObjectsContext from "../../context/ToneObjectsContext";
import { newPatternObject } from '../../components/Layout';
import { rootCertificates } from "tls";
import triggEmitter, {ExtractTriggPayload, triggEventTypes} from "../../lib/triggEmitter";

export const bbsFromSixteenth = (value: number | string): string => {
	return `0:0:${value}`;
};

export const sixteenthFromBBSOG = (time: string): number => {
	return sixteenthFromBBS(time.split('.')[0])
}

export const sixteenthFromBBS = (time: string): number => {
	let result: number = Number();
	// const timeArray: number[] = time.split(':').map(v => parseInt(v));
	const timeArray: number[] = time.split(':').map(v => parseInt(v));
	timeArray.forEach((v, idx, arr) => {
		if (idx === 0) {
			result = result + v * 16;
		} else if (idx === 1) {
			result = result + v * 4;
		} else {
			result = result + v
		}
	});
	return result
}


const Arranger: FunctionComponent = () => {

	// const Tone = useContext(ToneContext);
	const [schedulerID, setSchedulerID] = useState<number | undefined>(undefined);

	const ref_toneObjects = useContext(ToneObjectsContext);
	const ref_schedulerPart: MutableRefObject<Part | null> = useRef(null);
	const dispatch = useDispatch();

	const activePatt = useSelector((state: RootState) => state.sequencer.present.activePattern);
	const ref_activePatt = useRef(activePatt);
	const prev_activePatt = usePrevious(activePatt);
	useEffect(() => { ref_activePatt.current = activePatt }, [activePatt]);

	const ref_shouldReset: MutableRefObject<number | null> = useRef(null);

	const activePattLen = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].patternLength);
	const prev_activePattLen = usePrevious(activePattLen)

	const isPlaying = useSelector((state: RootState) => state.transport.present.isPlaying);
	const isPlayingRef = useRef(isPlaying);
	useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
	const previousPlaying = usePrevious(isPlaying);

	const selectedTrkIdx = useSelector((state: RootState) => state.track.present.selectedTrack);
	const ref_selectedTrkIdx = useRef(selectedTrkIdx)
	useEffect(() => {ref_selectedTrkIdx.current = selectedTrkIdx}, [selectedTrkIdx])

	const activePage = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIdx].page);
	const ref_activePage = useRef(activePage);
	useEffect(() => { ref_activePage.current = activePage;}, [activePage])

	const trkCount = useSelector((state: RootState) => state.track.present.trackCount);
	const ref_trkCount = useRef(trkCount);
	useEffect(() => { ref_trkCount.current = trkCount }, [trkCount])

	const pattsObj = useSelector((state: RootState) => state.sequencer.present.patterns)
	const ref_pattsObj = useRef(pattsObj);
	useEffect(() => { ref_pattsObj.current = pattsObj }, [pattsObj])

	const currentSong = useSelector((state: RootState) => state.arranger.present.selectedSong);
	const activeSongObj = useSelector((state: RootState) => state.arranger.present.songs[currentSong]);

	const songEvents = useSelector((state: RootState) => state.arranger.present.songs[currentSong].events)
	const ref_songEvents = useRef(songEvents)
	useEffect(() => { ref_songEvents.current = songEvents }, [songEvents])

	const usedPatterns = songEvents.map(v => v.pattern);

	const repeatsLength = songEvents.map(s => s.repeat).reduce((prev, next) => prev + next);
	const patternsHash = songEvents.map(s => s.pattern).reduce((prev, next) => (prev + next));

	const songLength = songEvents.map(s => pattsObj[s.pattern].patternLength * s.repeat).reduce((prev, next) => prev + next)

	const eventStartTimes = useSelector((state: RootState) => {
		const times: number[] = []
		let acc = 0
		state.arranger.present.songs[currentSong].events.forEach((event, idx, __) => {
			times.push(acc);
			acc = acc + pattsObj[event.pattern].patternLength * event.repeat
		})
		return times
	})

	const ref_eventsStartTimes = useRef(eventStartTimes);
	useEffect(() => {ref_eventsStartTimes.current = eventStartTimes}, [eventStartTimes])

	const songPatts = activeSongObj.events.map(v => v.pattern);
	const songRepeats = activeSongObj.events.map(v => v.repeat);
	const songMutes = activeSongObj.events.map(v => v.mute);
	
	const pattTracker = useSelector((state: RootState) => state.arranger.present.patternTracker);
	const ref_pattTracker = useRef(pattTracker);
	useEffect(() => { ref_pattTracker.current = pattTracker}, [pattTracker])

	const isFollow = useSelector((state: RootState) => state.arranger.present.following);
	const ref_isFollow = useRef(isFollow);
	useEffect(() => {ref_isFollow.current = isFollow;}, [isFollow]);

	const songs = useSelector((state: RootState) => state.arranger.present.songs);

	const arrgMode = useSelector((state: RootState) => state.arranger.present.mode);
	const prev_arrgMode = usePrevious(arrgMode);
	const Track = useSelector((state: RootState) => state.track.present)

	const effectLengths = useSelector((state: RootState) => state.track.present.tracks.map(track => track.fx.length));
	const ref_effectLengths = useRef(effectLengths)
	useEffect(() => {
		ref_effectLengths.current = effectLengths;
	}, [effectLengths])

	// what does this shit do?
	// ¿¿ reimplement arranger logic ??? 

	// const timers = useCallback((pt: number[], repeats: number[]) => {
	// 	const f = pt.map((pat, idx, arr) => {
	// 		if (idx === 0) return 0
	// 		else {
	// 			const repeat = repeats[idx] < 2 ? 1 : repeats[idx]
	// 			console.log('pat', pat, 'patternsRef', ref_pattsObj.current);
	// 			const length = ref_pattsObj.current[pat].patternLength * repeat
	// 			return bbsFromSixteenth(length)
	// 		}
	// 	})
	// 	return f
	// }, [ref_pattsObj])

	// should rewrite this disgrace of function
	// can't read this
	// probably will end up writing this again
	// const scheduleFromIndex = useCallback((...args: any) => {
	// 	const events: songEvent[] = args[1] ? args[1] : ref_songEvents.current;

	// 	if (Tone.Transport.loop) {
	// 		Tone.Transport.loop = false;
	// 	}

	// 	if (events.length >= 1) {
	// 		Tone.Transport.cancel(0);
	// 		let timeCounter: number = 0;
	// 		const eventsLength: number = events.length - 1;

	// 		events.forEach((v, idx, arr) => {
	// 			const secondaryTime: number = timeCounter;
	// 			const repeat: number = v.repeat + 1;
	// 			const rowEnd = v.pattern >= 0 ? bbsFromSixteenth(ref_pattsObj.current[v.pattern].patternLength * repeat) : 0;

	// 			if (v.pattern >= 0) {

	// 				if (idx === 0) {
	// 					Tone.Transport.schedule((time) => {
	// 						dispatch(setTracker([v.pattern, 0]));
	// 						[...Array(ref_trkCount.current).keys()].forEach(track => {
	// 							if (ref_toneObjects.current) {
	// 								const trackLength: number | string = ref_pattsObj.current[v.pattern].tracks[track].length;
	// 								const b = bbsFromSixteenth(trackLength)
	// 								const instrumentTrigg = ref_toneObjects.current?.patterns[v.pattern][track].instrument;
	// 								const fxTriggs = ref_toneObjects.current?.patterns[v.pattern][track].effects
	// 								const l = fxTriggs.length
	// 								if (!v.mute.includes(track)) {
	// 									for (let i = 0; i < l; i++) {
	// 										fxTriggs[i].mute = false;
	// 										fxTriggs[i].loop = true;
	// 										fxTriggs[i].loopEnd = b;
	// 										fxTriggs[i].start("+0");
	// 									}
	// 									instrumentTrigg.mute = false;
	// 									instrumentTrigg.loop = true;
	// 									instrumentTrigg.loopEnd = b;
	// 									instrumentTrigg.start("+0");
	// 								}
	// 							}
	// 						});
	// 					}, 0);
	// 				} else {
	// 					Tone.Transport.schedule((time) => {
	// 						dispatch(setTracker([v.pattern, secondaryTime]));
	// 						[...Array(ref_trkCount.current).keys()].forEach(track => {
	// 							if (ref_toneObjects.current){

	// 								const instrumentTrigg = ref_toneObjects.current.patterns[v.pattern][track].instrument;
	// 								const fxTriggs = ref_toneObjects.current.patterns[v.pattern][track].effects
	// 								const pastFxTriggs = ref_toneObjects.current.patterns[arr[idx - 1].pattern][track].effects
	// 								const pastInstrumentTrigg = ref_toneObjects.current.patterns[arr[idx - 1].pattern][track].instrument;
	// 								const trackLength: number = ref_pattsObj.current[v.pattern].tracks[track].length;
	// 								if (arr[idx - 1].pattern === v.pattern) {
	// 									if (!v.mute.includes(track)) {
	// 										if (instrumentTrigg.state !== "started") instrumentTrigg.start("+0");
	// 										for (let i = 0; i < fxTriggs.length; i++) {
	// 											if (fxTriggs[i].state !== "started") fxTriggs[i].start("+0")
	// 										}
	// 									}
	// 								} else {
	// 									if (arr[idx - 1].pattern >= 0) {
	// 										pastInstrumentTrigg.stop();
	// 										pastInstrumentTrigg.mute = true;
	// 										pastInstrumentTrigg.loop = false;
	// 										if (!v.mute.includes(track)) {
	// 											instrumentTrigg.loop = true;
	// 											instrumentTrigg.loopEnd = bbsFromSixteenth(trackLength);
	// 											instrumentTrigg.mute = false;
	// 											instrumentTrigg.start("+0");
	// 										}
	// 										for (let i = 0; i < fxTriggs.length; i++) {
	// 											pastFxTriggs[i].mute = true
	// 											pastFxTriggs[i].loop = false
	// 											pastFxTriggs[i].stop();
	// 											if (v.mute.includes(track)) {
	// 												fxTriggs[i].mute = false;
	// 												fxTriggs[i].loop = true;
	// 												fxTriggs[i].loopEnd = bbsFromSixteenth(trackLength);
	// 												fxTriggs[i].start("+0");
	// 											}
	// 										}
	// 									}
	// 								}
	// 							}
	// 						});
	// 					}, timeCounter);
	// 				}

	// 			} else {
	// 				if (idx > 0 && arr[idx - 1].pattern >= 0) {
	// 					Tone.Transport.schedule((time) => {
	// 						[...Array(ref_trkCount.current).keys()].forEach(track => {
	// 							if (ref_toneObjects.current){
	// 								const pastInstrumentTriggs = ref_toneObjects.current.patterns[arr[idx - 1].pattern][track].instrument;
	// 								const pastEffectTriggs = ref_toneObjects.current.patterns[arr[idx - 1].pattern][track].effects
	// 								for (let i = 0; i < pastEffectTriggs.length; i++) {
	// 									pastEffectTriggs[i].stop();
	// 									pastEffectTriggs[i].mute = true;
	// 								}
	// 								pastInstrumentTriggs.stop();
	// 								pastInstrumentTriggs.mute = true;
	// 							}
	// 						});
	// 					}, timeCounter);
	// 				}
	// 			}
	// 			timeCounter = timeCounter + Tone.Time(rowEnd).toSeconds();
	// 		});
	// 		if (ref_pattsObj.current[events[eventsLength].pattern]) {
	// 			// Stopping patterns
	// 			Tone.Transport.schedule((time) => {
	// 				[...Array(ref_trkCount.current).keys()].forEach(track => {
	// 					if (ref_toneObjects.current){

	// 						const lastTriggInstrument =
	// 							ref_toneObjects.current.patterns[events[eventsLength].pattern][track].instrument;
	// 						const lastTriggFx = ref_toneObjects.current.patterns[events[eventsLength].pattern][track].effects
	// 						for (let i = 0; i < lastTriggFx.length; i++) {
	// 							lastTriggFx[i].stop();
	// 							lastTriggFx[i].mute = true;
	// 						}
	// 						lastTriggInstrument.stop();
	// 						lastTriggInstrument.mute = true;
	// 					}
	// 				});
	// 			}, timeCounter);
	// 		}
	// 	}
	// }, [
	// 	dispatch,
	// 	ref_toneObjects,
	// 	ref_pattsObj,
	// 	ref_trkCount,
	// ]
	// )


	// const setupPatternMode = useCallback(() => {
	// 	if (!Tone.Transport.loop) {
	// 		Tone.Transport.loop = true;
	// 	}

	// 	Tone.Transport.loopStart = 0;
	// 	Tone.Transport.loopEnd = bbsFromSixteenth(pattsObj[activePatt].patternLength);
	// 	[...Array(trkCount)]
	// 		.map((_, i) => i)
	// 		.forEach((trackIndex: number) => {
	// 			if (ref_toneObjects.current){

	// 				const b = bbsFromSixteenth(pattsObj[activePatt].tracks[trackIndex].length)
	// 				const InstrumentTrigg = ref_toneObjects.current.patterns[activePatt][trackIndex].instrument
	// 				const fxTriggs = ref_toneObjects.current.patterns[activePatt][trackIndex].effects
	// 				InstrumentTrigg.loop = true;
	// 				InstrumentTrigg.loopStart = 0;
	// 				InstrumentTrigg.loopEnd = b;
	// 				InstrumentTrigg.mute = false;
	// 				InstrumentTrigg.start(0);
	// 				for (let i = 0; i < fxTriggs.length; i++) {
	// 					fxTriggs[i].mute = false;
	// 					fxTriggs[i].loop = true;
	// 					fxTriggs[i].loopEnd = b;
	// 					fxTriggs[i].loopStart = 0;
	// 					fxTriggs[i].start(0);
	// 				}

	// 			}
	// 		});
	// }, [
	// 	activePatt,
	// 	ref_toneObjects,
	// 	trkCount
	// ])


	// const goTo = useCallback(() => {
	// 	let pageToGo: number | undefined = undefined;
	// 	const nowTime: string = String(Tone.Transport.position).split('.')[0];
	// 	const patternToUse: number = ref_pattTracker.current[0] ? ref_pattTracker.current[0] : ref_songEvents.current[0].pattern;
	// 	const timeb: number = ref_pattTracker.current[1] ? ref_pattTracker.current[1] : 0;
	// 	const patternToGo: number = patternToUse;
	// 	const timeBBS: string = Tone.Time(timeb, 's').toBarsBeatsSixteenths();
	// 	const step: number = sixteenthFromBBS(nowTime) - sixteenthFromBBS(timeBBS);
	// 	const patternLocation: number = step % ref_pattsObj.current[ref_pattTracker.current[0]].patternLength;
	// 	const trackStep: number =
	// 		ref_pattsObj.current[patternToUse].tracks[ref_selectedTrkIdx.current].length
	// 			< ref_pattsObj.current[ref_pattTracker.current[0]].patternLength
	// 			? patternLocation % ref_pattsObj.current[ref_pattTracker.current[0]].tracks[ref_selectedTrkIdx.current].length
	// 			: patternLocation;
	// 	pageToGo = Math.floor(trackStep / 16);

	// 	if (
	// 		ref_activePatt.current !== pageToGo
	// 		&& ref_activePage.current !== pageToGo
	// 	) {
	// 		dispatch(
	// 			goToActive(
	// 				pageToGo,
	// 				ref_selectedTrkIdx.current,
	// 				patternToGo
	// 			)
	// 		);
	// 	} else if (
	// 		ref_activePatt.current === patternToGo
	// 		&& ref_activePage.current !== pageToGo
	// 	) {
	// 		dispatch(goToActive(pageToGo, ref_selectedTrkIdx.current, undefined));
	// 	} else if (
	// 		ref_activePatt.current !== patternToGo
	// 		&& pageToGo === ref_activePage.current
	// 	) {
	// 		dispatch(goToActive(undefined, ref_selectedTrkIdx.current, patternToGo));
	// 	}
	// }, [
	// 	ref_activePatt,
	// 	ref_activePage,
	// 	dispatch,
	// 	selectedTrkIdx,
	// 	ref_pattsObj,
	// ])

	// setup pattern or arranger playback
	// useEffect(() => {
	// 	if (Tone.Transport.state !== "started") {
	// 		if (arrgMode === "pattern") {
	// 			Tone.Transport.cancel(0);
	// 			// setupPatternMode();
	// 		} else {
	// 			if (prev_arrgMode === "pattern") {
	// 				[...Array(trkCount).keys()].forEach(track => {
	// 					if (ref_toneObjects.current){
	// 						const fxTriggs = ref_toneObjects.current.patterns[activePatt][track].effects
	// 						ref_toneObjects.current.patterns[activePatt][track].instrument.stop();
	// 						ref_toneObjects.current.patterns[activePatt][track].instrument.mute = true;
	// 						for (let i = 0; i < fxTriggs.length; i++) {
	// 							fxTriggs[i].mute = true;
	// 							fxTriggs[i].stop();
	// 						}
	// 					}
	// 				})
	// 			}
	// 			Tone.Transport.loop = false;
	// 			Tone.Transport.cancel(0);
	// 			scheduleFromIndex(0);
	// 		}
	// 	}
	// }, [
	// 	arrgMode,
	// 	activePatt,
	// 	trkCount,
	// 	scheduleFromIndex,
	// 	// setupPatternMode,
	// 	prev_arrgMode,
	// 	ref_toneObjects
	// ]
	// );


	// useEffect(() => {
	// 	const f = timers(songPatts, songRepeats)
	// 	// dispatch(setTimer(f, currentSong));
	// 	scheduleFromIndex(0)
	// }, [
	// 	songMutes,
	// 	songPatts,
	// 	songRepeats,
	// 	scheduleFromIndex,
	// 	currentSong,
	// 	timers,
	// 	dispatch
	// ])

	// set following scheduler
	// useEffect(() => {
	// 	let newSchedulerId: number
	// 	if (
	// 		isFollow
	// 		&& !schedulerID
	// 		&& arrgMode === "arranger"
	// 	) {

	// 		ref_schedulerPart.current = new Tone.Part(() => {
	// 			goTo();
	// 		}, [0]);
	// 		ref_schedulerPart.current.start(0);
	// 		ref_schedulerPart.current.loop = true;
	// 		ref_schedulerPart.current.loopEnd = '16n';
	// 		newSchedulerId = 1;
	// 		setSchedulerID(newSchedulerId);

	// 	} else if (
	// 		(!isFollow && schedulerID)
	// 		|| (!isPlaying && previousPlaying)
	// 	) {
	// 		setSchedulerID(0)
	// 	}
	// }, [
	// 	isFollow,
	// 	schedulerID,
	// 	isPlaying,
	// 	arrgMode,
	// 	goTo,
	// 	previousPlaying
	// ]);

	const goToPattern = (pattern: number, eventIndex: number,) => {
		dispatch(setActivePlayer(pattern, eventIndex))
		if (ref_isFollow.current){
			dispatch(selectPattern(pattern))
		}
	}


	// dispatchers
	const _addRow = (index: number): void => {

		if (ref_toneObjects.current){
			ref_toneObjects.current.arranger
				.splice(
					index, 
					0, 
					newPatternObject(Tone, Track)
					
				)
		}

		triggEmitter.emit(triggEventTypes.NEW_EVENT, {eventIndex: index})

		dispatch(addRow(index));
	}

	const scheduleOrStop = useCallback((option: 'schedule' | 'stop') => {
		let time = 0;
		ref_songEvents.current.forEach((songEvent, idx, __) => {
		Tone.Transport.cancel()

			if (ref_toneObjects.current){
				for (let i = 0; i < trkCount ; i ++) {
					const loopTime = ref_pattsObj.current[songEvent.pattern].patternLength * songEvent.repeat
					const fxCount = ref_effectLengths.current[i]
					const start = {'16n': time}
					const end = {'16n': time + loopTime}

					ref_toneObjects.current.arranger[idx][i].instrument.cancel()

					if (option === 'schedule'){
						ref_toneObjects.current.arranger[idx][i].instrument.start(start)
						ref_toneObjects.current.arranger[idx][i].instrument.stop(end)
						Tone.Transport.schedule((time) => {
							goToPattern(songEvent.pattern, idx)
						}, start)
					} else {
						ref_toneObjects.current.arranger[idx][i].instrument.stop()
					}

					for (let j = 0; j < fxCount; j ++) {
						ref_toneObjects.current.arranger[idx][i].effects[j].cancel()

						if (option === "schedule") {
							ref_toneObjects.current.arranger[idx][i].effects[j].start(start)
							ref_toneObjects.current.arranger[idx][i].effects[j].stop(end)
						} else {
							ref_toneObjects.current.arranger[idx][i].effects[j].stop()
						}
					}

				}
			}
		})	
	}, [])


	// reschedule arranger every change in song, eventLength, repeatSum, or 
	// pattern in event 

	useEffect(() => {
		if (arrgMode === arrangerMode.ARRANGER){
			// console.log('seting loop to false')
			Tone.Transport.loop = false;
			scheduleOrStop('schedule')
		} 
	}, [songLength, arrgMode, currentSong, trkCount])

	useEffect(() => {
		if (prev_arrgMode && arrgMode === arrangerMode.PATTERN){
			scheduleOrStop('stop')

			if (ref_shouldReset.current){
				Tone.Transport.clear(ref_shouldReset.current);
			}

		} else if (arrgMode === arrangerMode.ARRANGER) {
			ref_shouldReset.current = Tone.Transport.scheduleRepeat((time) => {
				const now = sixteenthFromBBSOG(Tone.Transport.position.toString())
				const init = ref_eventsStartTimes.current[ref_pattTracker.current.activeEventIndex] 
				dispatch(setActiveStep(now-init, ref_selectedTrkIdx.current, ref_pattTracker.current.patternPlaying))
			}, '16n')
		}
	}, [arrgMode])


	const updateToneObjs = (nextEv: number) => {
		let currEv = songEvents.length

		if (currEv < nextEv && ref_toneObjects.current){

			while (currEv !== nextEv){
				ref_toneObjects.current.arranger
					.push(newPatternObject(Tone, Track))
				currEv ++ 
			}

		} else if (currEv > nextEv && ref_toneObjects.current) {

			while (currEv !== nextEv){
				for (let i = 0; i < trkCount ; i ++){
					ref_toneObjects.current.arranger[currEv-1][i].instrument.dispose()
					const fxCount = ref_toneObjects.current.arranger[currEv-1][i].effects.length	

					for (let j = 0; j < fxCount; j ++)
						ref_toneObjects.current.arranger[currEv-1][i].effects[j].dispose()
				}

				ref_toneObjects.current.arranger.pop()
				currEv -- 
			}

		}
	}

	const _selectSong = (nextSong: number): void => {

		updateToneObjs(songs[nextSong].events.length)
		dispatch(selectSong(nextSong));
	};


	const _addSong = (): void => { 
		updateToneObjs(1)
		dispatch(addSong(activePatt)); 
	};

	const _removeSong = (): void => {
		if (arrgMode === arrangerMode.ARRANGER)
			Tone.Transport.cancel();

		const nextSong = Number(Object.keys(songs).find(song => Number(song) !== currentSong))
		updateToneObjs(songs[nextSong].events.length)
		dispatch(removeSong(currentSong, nextSong));
	};

	const _setEventPattern = (eventIndex: number, pattern: number): void => {
		dispatch(setPattern(pattern, eventIndex));
		// Tone.Transport.cancel(0);
		// scheduleFromIndex(0, dummye);
	};

	const _setRepeat = (repeat: number, eventIndex: number): void => {
		dispatch(setRepeat(repeat, eventIndex));
	};

	const _incDecRepeat = (amount: number, song: number, eventIndex: number): void => {
		dispatch(increaseDecreaseRepeat(song, eventIndex, amount))

	}

	const _removeRow = (index: number): void => {
		// const dummye: songEvent[] = [...ref_songEvents.current];
		// dummye.splice(index, 1);

		if (ref_toneObjects.current){
			for (let i = 0; i < trkCount; i ++)	{

				ref_toneObjects.current.arranger[index][i].instrument.dispose()
				const fx = ref_toneObjects.current.arranger[index][i].effects.length;
				for (let j = 0; j < fx ; j ++)
					ref_toneObjects.current.arranger[index][i].effects[j].dispose()

			}

			ref_toneObjects.current.arranger.splice(index, 1)
		}

		dispatch(removeRow(index));

		// Tone.Transport.cancel()
		// scheduleFromIndex(0, dummye);
	};

	// const _setMute = (e: KeyboardEvent<HTMLInputElement>, eventIndex: number): void => {
	// 	if (e.keyCode === 13) {
	// 		let m: string | number[] = e.currentTarget.value;
	// 		if (m === "") m = []
	// 		else m = m.split(",").map(v => v.trim()).map(v => parseInt(v));
	// 		dispatch(setMute(m, eventIndex));
	// 	}
	// };

	// Conditional styles, elements and properties
	const _renameSong = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const input = event.currentTarget.getElementsByTagName('input')[0];
		if (input.value.length >= 1) {
			dispatch(renameSong(currentSong, input.value))
		} else {
			input.value = songs[currentSong].name;
		}
	}


	const onDragEnd = (result: DropResult) => {
		if (!result.destination) {
			return;
		}

		const source = result.source.index;
		const destination = result.destination.index;
		if (ref_toneObjects.current && source !== destination){
			[ref_toneObjects.current.arranger[source], ref_toneObjects.current.arranger[destination]] =
			[ref_toneObjects.current.arranger[destination], ref_toneObjects.current.arranger[source]]
			dispatch(swapEvents(currentSong, source, destination))
		}

	}


	return (
		// should abstract this into an arranger component
		<div className={styles.border}>
			<div className={styles.top}>
				<div className={styles.title}><h1>Songs</h1></div>
				<div className={styles.songSelector}>
					<div className={styles.selector}>
						<Dropdown
							keyValue={Object.keys(songs).map(song => [song, songs[Number(song)].name])}
							onSubmit={_renameSong}
							select={(value) => { _selectSong(Number(value)) }}
							renamable={true}
							selected={String(currentSong)}
							dropdownId={`song ${currentSong} selector`}
							className={styles.dropdown}
						/>
					</div>
					<div className={styles.increase}>{ arrgMode === 'pattern' || (arrgMode === arrangerMode.ARRANGER && !isPlaying) ? <Plus onClick={_addSong} /> : null }</div>
					<div className={styles.decrease}>{Object.keys(songs).length > 1 && (arrgMode === arrangerMode.PATTERN || arrgMode === arrangerMode.ARRANGER && !isPlaying) ? <Minus onClick={_removeSong} /> : null}</div>
				</div>
			</div>
			<div className={styles.bottom}>
				<div className={styles.tableTitle}>
					<div className={styles.title}><h3>Patterns  |  Repeat </h3></div>
				</div>
				<div className={styles.dnd}>
					<DragDropContext onDragEnd={onDragEnd}>
						<Droppable droppableId={'arranger'}>
							{(provided) => (
								<ul {...provided.droppableProps} ref={provided.innerRef}>
									{activeSongObj.events.map((songEvent, idx, arr) => {
										return (
											<Event 
												key={`song ${currentSong} event ${songEvent.id}`} 
												arrgMode={arrgMode}
												isPlay={isPlaying}
												_addRow={_addRow}
												_incDecRepeat={_incDecRepeat}
												_removeRow={_removeRow}
												_setEventPattern={_setEventPattern}
												_setRepeat={_setRepeat}
												arr={arr}
												currentSong={currentSong}
												eventsLength={activeSongObj.events.length}
												idx={idx}
												pattsObj={pattsObj}
												songEvent={songEvent}
											/>
										)
									})}
									{provided.placeholder}
								</ul>
							)}
						</Droppable>

					</DragDropContext>
				</div>
			</div>
			{/* {trackCount} */}
		</div>
	);
};

export default Arranger;