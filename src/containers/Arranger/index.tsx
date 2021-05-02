import React, {
	useEffect,
	useRef,
	FunctionComponent,
	ChangeEvent,
	KeyboardEvent,
	MouseEvent,
	useContext,
	useState,
	useCallback,
	MutableRefObject
} from "react";
import usePrevious from "../../hooks/usePrevious";
import { useDispatch, useSelector } from "react-redux";
import triggCtx from '../../context/triggState';
import {
	addRow,
	setTracker,
	addSong,
	prependRow,
	renameSong,
	removeRow,
	removeSong,
	selectSong,
	setFollow,
	swapEvents,
	setMode,
	setMute,
	setPattern,
	setRepeat,
	setTimer,
	arrangerMode,
	songEvent,
	increaseDecreaseRepeat
} from "../../store/Arranger";
import { goToActive } from '../../store/Sequencer'
import Tone from "../../lib/tone";
// import ToneContext from '../../context/ToneContext';
import { RootState } from "../Xolombrisx";
import styles from './style.module.scss';
import Dropdown from '../../components/Layout/Dropdown';
import Minus from '../../components/Layout/Icons/Minus';
import Plus from '../../components/Layout/Icons/Plus';
import NumberBox from '../../components/Layout/NumberBox';
import { Part } from 'tone';

import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { current } from "immer";
import Div100vh from "react-div-100vh";

export const bbsFromSixteenth = (value: number | string): string => {
	return `0:0:${value}`;
};

export const sixteenthFromBBS = (time: string): number => {
	let result: number = Number();
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
	const [schedulerID, setSchedulerID] = useState<number | undefined>(undefined);
	const ref_toneTriggObjCtx = useContext(triggCtx);
	const dispatch = useDispatch();
	const ref_schedulerPart: MutableRefObject<Part | null> = useRef(null);
	// const Tone = useContext(ToneContext);

	const activePatt = useSelector((state: RootState) => state.sequencer.present.activePattern);
	const ref_activePatt = useRef(activePatt);
	useEffect(() => { ref_activePatt.current = activePatt }, [activePatt]);

	const isPlaying = useSelector((state: RootState) => state.transport.present.isPlaying);
	const isPlayingRef = useRef(isPlaying);
	useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
	const previousPlaying = usePrevious(isPlaying);

	const selectedTrk = useSelector((state: RootState) => state.track.present.selectedTrack);
	const ref_selectedTrk = useRef(selectedTrk)
	useEffect(() => {ref_selectedTrk.current = selectedTrk}, [selectedTrk])

	const activePage = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrk].page);
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

	const songPatts = activeSongObj.events.map(v => v.pattern);
	const songRepeats = activeSongObj.events.map(v => v.repeat);
	const songMutes = activeSongObj.events.map(v => v.mute);
	
	const pattTracker = useSelector((state: RootState) => state.arranger.present.patternTracker);
	const ref_pattTracker = useRef(pattTracker);
	useEffect(() => { ref_pattTracker.current = pattTracker}, [pattTracker])

	const isFollow = useSelector((state: RootState) => state.arranger.present.following);
	const songs = useSelector((state: RootState) => state.arranger.present.songs);

	const arrgMode = useSelector((state: RootState) => state.arranger.present.mode);
	const prev_arrgMode = usePrevious(arrgMode);

	// what does this shit do?
	// ¿¿ reimplement arranger logic ??? 
	const timers = useCallback((pt: number[], repeats: number[]) => {
		const f = pt.map((pat, idx, arr) => {
			if (idx === 0) return 0
			else {
				const repeat = repeats[idx] < 2 ? 1 : repeats[idx]
				console.log('pat', pat, 'patternsRef', ref_pattsObj.current);
				const length = ref_pattsObj.current[pat].patternLength * repeat
				return bbsFromSixteenth(length)
			}
		})
		return f
	}, [ref_pattsObj])

	// should rewrite this disgrace of function
	// can't read this
	// probably will end up writing this again
	const scheduleFromIndex = useCallback((...args: any) => {
		const events: songEvent[] = args[1] ? args[1] : ref_songEvents.current;

		if (Tone.Transport.loop) {
			Tone.Transport.loop = false;
		}

		if (events.length >= 1) {
			Tone.Transport.cancel(0);
			let timeCounter: number = 0;
			const eventsLength: number = events.length - 1;

			events.forEach((v, idx, arr) => {
				const secondaryTime: number = timeCounter;
				const repeat: number = v.repeat + 1;
				const rowEnd = v.pattern >= 0 ? bbsFromSixteenth(ref_pattsObj.current[v.pattern].patternLength * repeat) : 0;

				if (v.pattern >= 0) {

					if (idx === 0) {
						Tone.Transport.schedule((time) => {
							dispatch(setTracker([v.pattern, 0]));
							[...Array(ref_trkCount.current).keys()].forEach(track => {
								const trackLength: number | string = ref_pattsObj.current[v.pattern].tracks[track].length;
								const b = bbsFromSixteenth(trackLength)
								const instrumentTrigg = ref_toneTriggObjCtx.current[v.pattern][track].instrument;
								const fxTriggs = ref_toneTriggObjCtx.current[v.pattern][track].effects
								const l = fxTriggs.length
								if (!v.mute.includes(track)) {
									for (let i = 0; i < l; i++) {
										fxTriggs[i].mute = false;
										fxTriggs[i].loop = true;
										fxTriggs[i].loopEnd = b;
										fxTriggs[i].start("+0");
									}
									instrumentTrigg.mute = false;
									instrumentTrigg.loop = true;
									instrumentTrigg.loopEnd = b;
									instrumentTrigg.start("+0");
								}
							});
						}, 0);
					} else {
						Tone.Transport.schedule((time) => {
							dispatch(setTracker([v.pattern, secondaryTime]));
							[...Array(ref_trkCount.current).keys()].forEach(track => {
								const instrumentTrigg = ref_toneTriggObjCtx.current[v.pattern][track].instrument;
								const fxTriggs = ref_toneTriggObjCtx.current[v.pattern][track].effects
								const pastFxTriggs = ref_toneTriggObjCtx.current[arr[idx - 1].pattern][track].effects
								const pastInstrumentTrigg = ref_toneTriggObjCtx.current[arr[idx - 1].pattern][track].instrument;
								const trackLength: number = ref_pattsObj.current[v.pattern].tracks[track].length;
								if (arr[idx - 1].pattern === v.pattern) {
									if (!v.mute.includes(track)) {
										if (instrumentTrigg.state !== "started") instrumentTrigg.start("+0");
										for (let i = 0; i < fxTriggs.length; i++) {
											if (fxTriggs[i].state !== "started") fxTriggs[i].start("+0")
										}
									}
								} else {
									if (arr[idx - 1].pattern >= 0) {
										pastInstrumentTrigg.stop();
										pastInstrumentTrigg.mute = true;
										pastInstrumentTrigg.loop = false;
										if (!v.mute.includes(track)) {
											instrumentTrigg.loop = true;
											instrumentTrigg.loopEnd = bbsFromSixteenth(trackLength);
											instrumentTrigg.mute = false;
											instrumentTrigg.start("+0");
										}
										for (let i = 0; i < fxTriggs.length; i++) {
											pastFxTriggs[i].mute = true
											pastFxTriggs[i].loop = false
											pastFxTriggs[i].stop();
											if (v.mute.includes(track)) {
												fxTriggs[i].mute = false;
												fxTriggs[i].loop = true;
												fxTriggs[i].loopEnd = bbsFromSixteenth(trackLength);
												fxTriggs[i].start("+0");
											}
										}
									}
								}
							});
						}, timeCounter);
					}

				} else {
					if (idx > 0 && arr[idx - 1].pattern >= 0) {
						Tone.Transport.schedule((time) => {
							[...Array(ref_trkCount.current).keys()].forEach(track => {
								const pastInstrumentTriggs = ref_toneTriggObjCtx.current[arr[idx - 1].pattern][track].instrument;
								const pastEffectTriggs = ref_toneTriggObjCtx.current[arr[idx - 1].pattern][track].effects
								for (let i = 0; i < pastEffectTriggs.length; i++) {
									pastEffectTriggs[i].stop();
									pastEffectTriggs[i].mute = true;
								}
								pastInstrumentTriggs.stop();
								pastInstrumentTriggs.mute = true;
							});
						}, timeCounter);
					}
				}
				timeCounter = timeCounter + Tone.Time(rowEnd).toSeconds();
			});
			if (ref_pattsObj.current[events[eventsLength].pattern]) {
				// Stopping patterns
				Tone.Transport.schedule((time) => {
					[...Array(ref_trkCount.current).keys()].forEach(track => {
						const lastTriggInstrument: Part =
							ref_toneTriggObjCtx.current[events[eventsLength].pattern][track].instrument;
						const lastTriggFx = ref_toneTriggObjCtx.current[events[eventsLength].pattern][track].effects
						for (let i = 0; i < lastTriggFx.length; i++) {
							lastTriggFx[i].stop();
							lastTriggFx[i].mute = true;
						}
						lastTriggInstrument.stop();
						lastTriggInstrument.mute = true;
					});
				}, timeCounter);
			}
		}
	}, [
		dispatch,
		ref_toneTriggObjCtx,
		ref_pattsObj,
		ref_trkCount,
	]
	)


	const setupPatternMode = useCallback(() => {
		if (!Tone.Transport.loop) {
			Tone.Transport.loop = true;
		}

		Tone.Transport.loopStart = 0;
		Tone.Transport.loopEnd = bbsFromSixteenth(pattsObj[activePatt].patternLength);
		[...Array(trkCount)]
			.map((_, i) => i)
			.forEach((trackIndex: number) => {
				const b = bbsFromSixteenth(pattsObj[activePatt].tracks[trackIndex].length)
				const InstrumentTrigg = ref_toneTriggObjCtx.current[activePatt][trackIndex].instrument
				const fxTriggs = ref_toneTriggObjCtx.current[activePatt][trackIndex].effects
				InstrumentTrigg.loop = true;
				InstrumentTrigg.loopStart = 0;
				InstrumentTrigg.loopEnd = b;
				InstrumentTrigg.mute = false;
				InstrumentTrigg.start(0);
				for (let i = 0; i < fxTriggs.length; i++) {
					fxTriggs[i].mute = false;
					fxTriggs[i].loop = true;
					fxTriggs[i].loopEnd = b;
					fxTriggs[i].loopStart = 0;
					fxTriggs[i].start(0);
				}
			});
	}, [
		activePatt,
		ref_toneTriggObjCtx,
		trkCount
	])


	// should rewrite all this stuf, everything should be a ref in this
	const goTo = useCallback(() => {
		let pageToGo: number | undefined = undefined;
		const nowTime: string = String(Tone.Transport.position).split('.')[0];
		const patternToUse: number = ref_pattTracker.current[0] ? ref_pattTracker.current[0] : ref_songEvents.current[0].pattern;
		const timeb: number = ref_pattTracker.current[1] ? ref_pattTracker.current[1] : 0;
		const patternToGo: number = patternToUse;
		const timeBBS: string = Tone.Time(timeb, 's').toBarsBeatsSixteenths();
		const step: number = sixteenthFromBBS(nowTime) - sixteenthFromBBS(timeBBS);
		const patternLocation: number = step % ref_pattsObj.current[ref_pattTracker.current[0]].patternLength;
		const trackStep: number =
			ref_pattsObj.current[patternToUse].tracks[ref_selectedTrk.current].length
				< ref_pattsObj.current[ref_pattTracker.current[0]].patternLength
				? patternLocation % ref_pattsObj.current[ref_pattTracker.current[0]].tracks[ref_selectedTrk.current].length
				: patternLocation;
		pageToGo = Math.floor(trackStep / 16);

		if (
			ref_activePatt.current !== pageToGo
			&& ref_activePage.current !== pageToGo
		) {
			dispatch(
				goToActive(
					pageToGo,
					ref_selectedTrk.current,
					patternToGo
				)
			);
		} else if (
			ref_activePatt.current === patternToGo
			&& ref_activePage.current !== pageToGo
		) {
			dispatch(goToActive(pageToGo, ref_selectedTrk.current, undefined));
		} else if (
			ref_activePatt.current !== patternToGo
			&& pageToGo === ref_activePage.current
		) {
			dispatch(goToActive(undefined, ref_selectedTrk.current, patternToGo));
		}
	}, [
		ref_activePatt,
		ref_activePage,
		dispatch,
		selectedTrk,
		ref_pattsObj,
	])

	// setup pattern or arranger playback
	useEffect(() => {
		if (Tone.Transport.state !== "started") {
			if (arrgMode === "pattern") {
				Tone.Transport.cancel(0);
				setupPatternMode();
			} else {
				if (prev_arrgMode === "pattern") {
					[...Array(trkCount).keys()].forEach(track => {
						const fxTriggs = ref_toneTriggObjCtx.current[activePatt][track].effects
						ref_toneTriggObjCtx.current[activePatt][track].instrument.stop();
						ref_toneTriggObjCtx.current[activePatt][track].instrument.mute = true;
						for (let i = 0; i < fxTriggs.length; i++) {
							fxTriggs[i].mute = true;
							fxTriggs[i].stop();
						}
					})
				}
				Tone.Transport.loop = false;
				Tone.Transport.cancel(0);
				scheduleFromIndex(0);
			}
		}
	}, [
		arrgMode,
		activePatt,
		trkCount,
		scheduleFromIndex,
		setupPatternMode,
		prev_arrgMode,
		ref_toneTriggObjCtx
	]
	);


	useEffect(() => {
		const f = timers(songPatts, songRepeats)
		// dispatch(setTimer(f, currentSong));
		scheduleFromIndex(0)
	}, [
		songMutes,
		songPatts,
		songRepeats,
		scheduleFromIndex,
		currentSong,
		timers,
		dispatch
	])

	// set following scheduler
	useEffect(() => {
		let newSchedulerId: number
		if (
			isFollow
			&& !schedulerID
			&& arrgMode === "arranger"
		) {

			ref_schedulerPart.current = new Tone.Part(() => {
				goTo();
			}, [0]);
			ref_schedulerPart.current.start(0);
			ref_schedulerPart.current.loop = true;
			ref_schedulerPart.current.loopEnd = '16n';
			newSchedulerId = 1;
			setSchedulerID(newSchedulerId);

		} else if (
			(!isFollow && schedulerID)
			|| (!isPlaying && previousPlaying)
		) {
			setSchedulerID(0)
		}
	}, [
		isFollow,
		schedulerID,
		isPlaying,
		arrgMode,
		goTo,
		previousPlaying
	]);



	// dispatchers
	const dispatchAddRow = (index: number): void => {
		dispatch(addRow(index));
		const edummy: songEvent[] = [...ref_songEvents.current];
		edummy.splice(index + 1, 0, {
			pattern: -1,
			repeat: 0,
			mute: [],
			id: -1,
		});
		// Tone.Transport.cancel(0);
		// implementar from scheduling from the index. 
		// scheduleFromIndex(index - 1, edummy);
	}

	const dispatchSelectSong = (value: number): void => {
		if (arrgMode === "arranger") Tone.Transport.cancel(0);
		dispatch(selectSong(value));
		// Tone.Transport.cancel();
		// scheduleFromIndex(0);
	};


	const dispatchAddSong = (): void => { dispatch(addSong()); };

	const dispatchRemoveSong = (e: MouseEvent<HTMLDivElement>): void => {
		Tone.Transport.cancel();
		dispatch(removeSong(currentSong));
	};

	const dispatchSetEventPattern = (eventIndex: number, pattern: number): void => {
		// const dummye: event[] = [...activeSongObject.current.events]
		// dummye[eventIndex] = { ...dummye[eventIndex] };
		// dummye[eventIndex].pattern = pIdx;
		dispatch(setPattern(pattern, eventIndex));
		// Tone.Transport.cancel(0);
		// scheduleFromIndex(0, dummye);
	};

	const dispatchSetRepeat = (repeat: number, eventIndex: number): void => {
		// const dummye: event[] = [...activeSongObject.current.events];
		// dummye[eventIndex] = { ...dummye[eventIndex] };
		// dummye[eventIndex].repeat = repeat;
		dispatch(setRepeat(repeat, eventIndex));
		// Tone.Transport.cancel();
		// scheduleFromIndex(0, dummye);
	};

	const dispatchIncDecRepeat = (amount: number, song: number, eventIndex: number): void => {
		console.log('dispatching set repeat')
		dispatch(increaseDecreaseRepeat(song, eventIndex, amount))
	}

	const dispatchRemoveRow = (index: number): void => {
		const dummye: songEvent[] = [...ref_songEvents.current];
		dummye.splice(index, 1);
		dispatch(removeRow(index));
		// Tone.Transport.cancel()
		// scheduleFromIndex(0, dummye);
	};

	const dispatchSetMute = (e: KeyboardEvent<HTMLInputElement>, eventIndex: number): void => {
		if (e.keyCode === 13) {
			let m: string | number[] = e.currentTarget.value;
			if (m === "") m = []
			else m = m.split(",").map(v => v.trim()).map(v => parseInt(v));
			dispatch(setMute(m, eventIndex));
			// const dummye: event[] = [...activeSongObject.current.events];
			// dummye[eventIndex] = { ...dummye[eventIndex] };
			// dummye[eventIndex].mute = m;
			// Tone.Transport.cancel();
			// scheduleFromIndex(0, dummye);
		}
	};

	// Conditional styles, elements and properties
	const dispatchRenameSong = (event: React.FormEvent<HTMLFormElement>): void => {
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
		dispatch(swapEvents(currentSong, source, destination))
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
							onSubmit={dispatchRenameSong}
							select={(value) => { dispatchSelectSong(Number(value)) }}
							renamable={true}
							selected={String(currentSong)}
							dropdownId={`song ${currentSong} selector`}
							className={styles.dropdown}
						/>
					</div>
					<div className={styles.increase}><Plus onClick={dispatchAddSong} /></div>
					<div className={styles.decrease}>{Object.keys(songs).length > 1 ? <Minus onClick={dispatchRemoveSong} /> : null}</div>
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
											<Draggable 
												key={`song ${currentSong} event ${songEvent.id}`} 
												draggableId={`song ${currentSong} event ${songEvent.id}`} 
												index={idx}
											>
												{(draggable) => (
													<div 
														{...draggable.dragHandleProps} 
														{...draggable.draggableProps} 
														ref={draggable.innerRef} 
														className={styles.div} 
													>
														{
															activeSongObj.events.length > 1 
															? <div className={styles.delete}> 
																	<Minus onClick={() => { dispatchRemoveRow(idx) }} small={true} />
															</div> 
															: <div></div>
														}
														<div style={{ zIndex: arr.length - idx }} className={styles.selector}>
															<Dropdown 
																dropdownId={`song ${currentSong} event ${songEvent.id}`} 
																keyValue={Object.keys(pattsObj).map(k => [String(k), pattsObj[Number(k)].name])} 
																className={styles.out} select={(key) => { dispatchSetEventPattern(idx, Number(key)) }} 
																selected={String(songEvent.pattern)} 
															/>
														</div>
														<div className={styles.repeat}> 
															<NumberBox 
																increaseDecrease={
																	(value) => dispatchIncDecRepeat(value, songEvent.id, idx)
																} 
																updateValue={(
																	value) => dispatchSetRepeat(value, idx)
																} 
																value={songEvent.repeat} 
															/>
														</div>
														<div className={styles.add}>
															<Plus onClick={() => { dispatchAddRow(idx) }} small={true} />
														</div>
													</div>
												)}
											</Draggable>
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