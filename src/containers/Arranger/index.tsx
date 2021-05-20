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
import { stop } from '../../store/Transport';
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
	const ref_arrangerStopper: MutableRefObject<number | null> = useRef(null);
	const dispatch = useDispatch();

	const activePatt = useSelector((state: RootState) => state.sequencer.present.activePattern);
	const ref_activePatt = useRef(activePatt);
	const prev_activePatt = usePrevious(activePatt); useEffect(() => { ref_activePatt.current = activePatt }, [activePatt]);

	const ref_activeStepTracker: MutableRefObject<number | null> = useRef(null);

	const activePattLen = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].patternLength);
	const prev_activePattLen = usePrevious(activePattLen)

	const isPlay = useSelector((state: RootState) => state.transport.present.isPlaying);
	const ref_isPlay = useRef(isPlay);
	useEffect(() => { ref_isPlay.current = isPlay }, [isPlay])
	const prev_isPlay = usePrevious(isPlay);

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
	const hashedPatterns = useSelector((state: RootState) => state.arranger.present.songs[currentSong].events.map(e => e.pattern).reduce((prev, next) => prev + next));


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

	const goToPattern = (pattern: number, eventIndex: number,) => {
		console.log('should be going to pattern, pattern is', pattern, 'event index is', eventIndex);


		dispatch(setActivePlayer(pattern, eventIndex))
		if (ref_isFollow.current){
			console.log('is following is real, go to pattern', pattern);
			dispatch(selectPattern(pattern))
		}
	}


	// dispatchers
	const _addRow = (index: number): void => {

		if (ref_toneObjects.current){
			ref_toneObjects.current.arranger
				.splice(
					index + 1, 
					0, 
					newPatternObject(Tone, Track)
					
				)
		}

		triggEmitter.emit(triggEventTypes.NEW_EVENT, {eventIndex: index + 1})

		dispatch(addRow(index));
	}

	const scheduleOrStop = useCallback((option: 'schedule' | 'stop') => {
		let time = 0;

		console.log(`arranger_container: inside stop/schedulling callback, option is ${option === "schedule" ? 'scheduling' : 'stopping'},`)

		ref_songEvents.current.forEach((songEvent, idx, __) => {
			const loopTime = ref_pattsObj.current[songEvent.pattern].patternLength * songEvent.repeat
			const start = {'16n': time}
			const end = {'16n': time + loopTime}
			time = time + loopTime

			if (ref_toneObjects.current){
				for (let i = 0; i < ref_trkCount.current ; i ++) {
					const fxCount = ref_effectLengths.current[i]

					ref_toneObjects.current.arranger[idx][i].instrument.cancel()

					if (option === 'schedule'){
						console.log(`should be scheduling event ${idx}, of instrument ${i}, to start at `, start, 'end at', end, 'instrument is', ref_toneObjects.current.arranger[idx][i].instrument);
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


		// Tone.Transport.stop({'16n': time});
	}, [])


	// reschedule arranger every change in song, eventLength, repeatSum, or 
	// pattern in event 

	useEffect(() => {
		if (arrgMode === arrangerMode.ARRANGER){
			console.log('setting loop to false, arranger mode is on');
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
					dispatch(setActiveStep(now-init, ref_selectedTrkIdx.current, ref_pattTracker.current.patternPlaying >= 0 ? ref_pattTracker.current.patternPlaying : ref_songEvents.current[ref_pattTracker.current.playbackStart].pattern))
				}, '16n')
		}
	}, [arrgMode])

	useEffect(() => {
		if (prev_isPlay && !isPlay && arrgMode === arrangerMode.ARRANGER) {
			Tone.Transport.position = {'16n': eventStartTimes[pattTracker.playbackStart]}
			dispatch(setActivePlayer(-1, -1));
		}

	}, [isPlay, arrgMode, prev_isPlay, pattTracker, eventStartTimes])


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
	};

	const _setRepeat = (repeat: number, eventIndex: number): void => {
		dispatch(setRepeat(repeat, eventIndex));
	};

	const _incDecRepeat = (amount: number, song: number, eventIndex: number): void => {
		dispatch(increaseDecreaseRepeat(song, eventIndex, amount))

	}

	const _removeRow = (index: number): void => {

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

	};


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
					<div className={styles.increase}>{ arrgMode === 'pattern' || (arrgMode === arrangerMode.ARRANGER && !isPlay) ? <Plus onClick={_addSong} /> : null }</div>
					<div className={styles.decrease}>{Object.keys(songs).length > 1 && (arrgMode === arrangerMode.PATTERN || arrgMode === arrangerMode.ARRANGER && !isPlay) ? <Minus onClick={_removeSong} /> : null}</div>
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
												isPlay={isPlay}
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