import React, {
	useEffect,
	useRef,
	FunctionComponent,
	ChangeEvent,
	KeyboardEvent,
	MouseEvent,
	useContext,
	useState,
	useCallback
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
	const triggRef = useContext(triggCtx);
	const dispatch = useDispatch();
	// const Tone = useContext(ToneContext);

	const activePattern = useSelector((state: RootState) => state.sequencer.present.activePattern);
	const activePatternRef = useRef(activePattern);
	useEffect(() => { activePatternRef.current = activePattern }, [activePattern]);

	const isPlaying = useSelector((state: RootState) => state.transport.present.isPlaying);
	const isPlayingRef = useRef(isPlaying);
	useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
	const previousPlaying = usePrevious(isPlaying);

	const selectedTrack = useSelector((state: RootState) => state.track.present.selectedTrack);
	const activePage = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].page);

	const trackCount = useSelector((state: RootState) => state.track.present.trackCount);
	const trackCountRef = useRef(trackCount);
	useEffect(() => { trackCountRef.current = trackCount }, [trackCount])

	const patternsObj = useSelector((state: RootState) => state.sequencer.present.patterns)
	const patternsRef = useRef(patternsObj);
	useEffect(() => { patternsRef.current = patternsObj }, [patternsObj])
	const activePatternObj = patternsObj[activePattern];

	const arrangerObj = useSelector((state: RootState) => state.arranger.present)
	const arrangerRef = useRef(arrangerObj);
	useEffect(() => { arrangerRef.current = arrangerObj }, [arrangerObj])

	const currentSong = useSelector((state: RootState) => state.arranger.present.selectedSong);
	const activeSongObject = useSelector((state: RootState) => state.arranger.present.songs[currentSong]);
	const activeSongObjectRef = useRef(activeSongObject);
	useEffect(() => { activeSongObjectRef.current = activeSongObject }, [activeSongObject])

	const songAmount = useSelector((state: RootState) => Object.keys(state.arranger.present.songs).length)
	const songPatterns = activeSongObject.events.map(v => v.pattern);
	const songRepeats = activeSongObject.events.map(v => v.repeat);
	const songMutes = activeSongObject.events.map(v => v.mute);
	const patternTracker = useSelector((state: RootState) => state.arranger.present.patternTracker);
	const isFollowing = useSelector((state: RootState) => state.arranger.present.following);
	const songs = useSelector((state: RootState) => state.arranger.present.songs);

	const arrangerMode = useSelector((state: RootState) => state.arranger.present.mode);
	const previousMode = usePrevious(arrangerMode);

	const timers = useCallback((pt: number[], repeats: number[]) => {
		const f = pt.map((pat, idx, arr) => {
			if (idx === 0) return 0
			else {
				const repeat = repeats[idx] < 2 ? 1 : repeats[idx]
				console.log('pat', pat, 'patternsRef', patternsRef.current);
				const length = patternsRef.current[pat].patternLength * repeat
				return bbsFromSixteenth(length)
			}
		})
		return f
	}, [patternsRef])

	const scheduleFromIndex = useCallback((...args: any) => {
		const events: songEvent[] = args[1] ? args[1] : activeSongObjectRef.current.events;

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
				const rowEnd = v.pattern >= 0 ? bbsFromSixteenth(patternsRef.current[v.pattern].patternLength * repeat) : 0;

				if (v.pattern >= 0) {

					if (idx === 0) {
						Tone.Transport.schedule((time) => {
							dispatch(setTracker([v.pattern, 0]));
							[...Array(trackCountRef.current).keys()].forEach(track => {
								const trackLength: number | string = patternsRef.current[v.pattern].tracks[track].length;
								const b = bbsFromSixteenth(trackLength)
								const instrumentTrigg = triggRef.current[v.pattern][track].instrument;
								const fxTriggs = triggRef.current[v.pattern][track].effects
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
							[...Array(trackCountRef.current).keys()].forEach(track => {
								const instrumentTrigg = triggRef.current[v.pattern][track].instrument;
								const fxTriggs = triggRef.current[v.pattern][track].effects
								const pastFxTriggs = triggRef.current[arr[idx - 1].pattern][track].effects
								const pastInstrumentTrigg = triggRef.current[arr[idx - 1].pattern][track].instrument;
								const trackLength: number = patternsRef.current[v.pattern].tracks[track].length;
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
							[...Array(trackCount).keys()].forEach(track => {
								const pastInstrumentTriggs = triggRef.current[arr[idx - 1].pattern][track].instrument;
								const pastEffectTriggs = triggRef.current[arr[idx - 1].pattern][track].effects
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
			if (patternsRef.current[events[eventsLength].pattern]) {
				// Stopping patterns
				Tone.Transport.schedule((time) => {
					[...Array(trackCount).keys()].forEach(track => {
						const lastTriggInstrument: Part =
							triggRef.current[events[eventsLength].pattern][track].instrument;
						const lastTriggFx = triggRef.current[events[eventsLength].pattern][track].effects
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
		activeSongObjectRef,
		triggRef,
		patternsRef,
		trackCountRef,
		trackCount
	]
	)


	const setupPatternMode = useCallback(() => {
		if (!Tone.Transport.loop) {
			Tone.Transport.loop = true;
		}

		Tone.Transport.loopStart = 0;
		Tone.Transport.loopEnd = bbsFromSixteenth(activePatternObj.patternLength);
		[...Array(trackCount)]
			.map((_, i) => i)
			.forEach((ix: number) => {
				const b = bbsFromSixteenth(activePatternObj.tracks[ix].length)
				const InstrumentTrigg = triggRef.current[activePattern][ix].instrument
				const fxTriggs = triggRef.current[activePattern][ix].effects
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
		activePattern,
		activePatternObj.patternLength,
		activePatternObj.tracks,
		triggRef,
		trackCount
	])


	const goTo = useCallback(() => {
		let pageToGo: number | undefined = undefined;
		const nowTime: string = String(Tone.Transport.position).split('.')[0];
		const patternToUse: number = patternTracker[0] ? patternTracker[0] : activeSongObjectRef.current.events[0].pattern;
		const timeb: number = patternTracker[1] ? patternTracker[1] : 0;
		const patternToGo: number = patternToUse;
		const timeBBS: string = Tone.Time(timeb, 's').toBarsBeatsSixteenths();
		const step: number = sixteenthFromBBS(nowTime) - sixteenthFromBBS(timeBBS);
		const patternLocation: number = step % patternsRef.current[patternTracker[0]].patternLength;
		const trackStep: number =
			patternsRef.current[patternToUse].tracks[selectedTrack].length
				< patternsRef.current[patternTracker[0]].patternLength
				? patternLocation % patternsRef.current[patternTracker[0]].tracks[selectedTrack].length
				: patternLocation;
		pageToGo = Math.floor(trackStep / 16);

		if (
			activePattern !== pageToGo
			&& activePage !== pageToGo
		) {
			dispatch(
				goToActive(
					pageToGo,
					selectedTrack,
					patternToGo
				)
			);
		} else if (
			activePattern === patternToGo
			&& activePage !== pageToGo
		) {
			dispatch(goToActive(pageToGo, selectedTrack, undefined));
		} else if (
			activePattern !== patternToGo
			&& pageToGo === activePage
		) {
			dispatch(goToActive(undefined, selectedTrack, patternToGo));
		}
	}, [
		activePattern,
		activePage,
		dispatch,
		patternTracker,
		activeSongObjectRef,
		selectedTrack,
		patternsRef,
	])

	// setup pattern or arranger playback
	useEffect(() => {
		if (Tone.Transport.state !== "started") {
			if (arrangerMode === "pattern") {
				Tone.Transport.cancel(0);
				setupPatternMode();
			} else {
				if (previousMode === "pattern") {
					[...Array(trackCountRef.current).keys()].forEach(track => {
						const fxTriggs = triggRef.current[activePatternRef.current][track].effects
						triggRef.current[activePatternRef.current][track].instrument.stop();
						triggRef.current[activePatternRef.current][track].instrument.mute = true;
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
		arrangerMode,
		activePattern,
		trackCount,
		isPlaying,
		currentSong,
		activePatternRef,
		trackCountRef,
		scheduleFromIndex,
		setupPatternMode,
		previousMode,
		triggRef
	]
	);


	useEffect(() => {
		const f = timers(songPatterns, songRepeats)
		// dispatch(setTimer(f, currentSong));
		scheduleFromIndex(0)
	}, [
		songMutes,
		songPatterns,
		songRepeats,
		scheduleFromIndex,
		currentSong,
		timers,
		dispatch
	])

	// set following scheduler
	useEffect(() => {
		let newSchedulerId: number
		let schedulerPart: Part;
		if (
			isFollowing
			&& !schedulerID
			&& arrangerMode === "arranger"
		) {

			schedulerPart = new Tone.Part(() => {
				goTo();
			}, [0]);
			schedulerPart.start(0);
			schedulerPart.loop = true;
			schedulerPart.loopEnd = '16n';
			newSchedulerId = 1;
			setSchedulerID(newSchedulerId);

		} else if (
			(!isFollowing && schedulerID)
			|| (!isPlaying && previousPlaying)
		) {
			setSchedulerID(0)
		}
	}, [
		isFollowing,
		schedulerID,
		isPlaying,
		arrangerMode,
		goTo,
		previousPlaying
	]);



	// dispatchers
	const dispatchSetMode = (newMode: arrangerMode): void => {
		dispatch(setMode(newMode));
	};

	const setPosition = (position: string | number) => {
		Tone.Transport.position = position;
	};

	const dispatchPrependRow = (): void => {
		dispatch(prependRow());
		const edummy: songEvent[] = [...activeSongObjectRef.current.events];
		edummy.unshift({
			pattern: -1,
			repeat: 0,
			mute: [],
			id: -1,
		})
		Tone.Transport.cancel(0);
		// scheduleFromIndex(0, edummy);
	}

	const dispatchAddRow = (index: number): void => {
		dispatch(addRow(index));
		const edummy: songEvent[] = [...activeSongObjectRef.current.events];
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
		if (arrangerMode === "arranger") Tone.Transport.cancel(0);
		dispatch(selectSong(value));
		// Tone.Transport.cancel();
		// scheduleFromIndex(0);
	};


	const dispatchAddSong = (): void => { dispatch(addSong()); };

	const dispatchRemoveSong = (e: MouseEvent<HTMLDivElement>): void => {
		Tone.Transport.cancel();
		dispatch(removeSong(currentSong));
	};

	const dispatchSendPattern = (eventIndex: number, pattern: number): void => {
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
		const dummye: songEvent[] = [...activeSongObjectRef.current.events];
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
	const mutePlaceholder = (eventIndex: number): string => {
		return activeSongObjectRef.current.events[eventIndex].mute.join(',');
	}

	const removeS = songAmount > 2 && !isPlaying ? (
		<div className='removeSong' onClick={dispatchRemoveSong}>
			-
		</div>
	) : null;

	const selectedFollow = (mode: boolean): void => {
		if (mode && !isFollowing) dispatch(setFollow(true));
		else if (!mode && isFollowing) dispatch(setFollow(false));
	};

	const followStyle = (mode: boolean): string => {
		if ((isFollowing && mode) || (!isFollowing && !mode)) return "selected";
		else return "";
	}

	const dispatchRenameSong = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const input = event.currentTarget.getElementsByTagName('input')[0];
		if (input.value.length >= 1) {
			dispatch(renameSong(currentSong, input.value))
		} else {
			input.value = songs[currentSong].name;
		}
		// setCounter(Number(input.value));
	}


	const onDragEnd = (result: DropResult) => {
		if (!result.destination) {
			return;
		}

		const source = result.source.index;
		const destination = result.destination.index;
		dispatch(swapEvents(currentSong, source, destination))
	}

	const increaseDecrase = (value: number): void => {
		console.log(value);
	}


	return (
		<div className={styles.border}>
			<div className={styles.top}>
				<div className={styles.title}><h1>Songs</h1></div>
				<div className={styles.songSelector}>
					<div className={styles.selector}>
						<Dropdown
							// keyValue={[['1', '2'], ['3', '4']]}
							keyValue={Object.keys(songs).map(song => [song, songs[Number(song)].name])}
							onSubmit={dispatchRenameSong}
							select={(value) => { dispatchSelectSong(Number(value)) }}
							renamable={true}
							// selected={String(activePattern)}
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
								// <ul {...provided.droppableProps} ref={provided.innerRef}>
								// 	{['lala', 'lele', 'lolo'].map((v, idx, arr) => {
								// 		return (
								// 			<Draggable draggableId={v} index={idx} key={v}>
								// 				{(xaxa) => (
								// 					<li {...xaxa.draggableProps} {...xaxa.dragHandleProps} ref={xaxa.innerRef}>
								// 						{v}
								// 					</li>
								// 				)}
								// 			</Draggable>
								// 		)
								// 	})}
								// 	{provided.placeholder}
								// </ul>
								<ul {...provided.droppableProps} ref={provided.innerRef}>
									{activeSongObject.events.map((songEvent, idx, arr) => {
										return (
											<Draggable key={`song ${currentSong} event ${songEvent.id}`} draggableId={`song ${currentSong} event ${songEvent.id}`} index={idx}>
												{(xaxa) => (
													// <li {...xaxa.dragHandleProps} {...xaxa.draggableProps} ref={xaxa.innerRef} style={{ zIndex: arr.length - idx }}>
													// 	{activeSongObject.events.length > 1 ? <div className={styles.delete}> <Minus onClick={() => { dispatchRemoveRow(idx) }} small={true} /></div> : <div></div>}
													// 	<div className={styles.selector}><Dropdown keyValue={Object.keys(patternsObj).map(k => [String(k), patternsObj[Number(k)].name])} className={styles.out} select={(key) => { dispatchSendPattern(idx, Number(key)) }} selected={String(songEvent.pattern)} /></div>
													// 	<div className={styles.repeat}> <NumberBox increaseDecrease={(value) => dispatchIncDecRepeat(value, songEvent.id, idx)} updateValue={(value) => dispatchSetRepeat(value, idx)} value={songEvent.repeat} /></div>
													// 	<div className={styles.add}><Plus onClick={() => { dispatchAddRow(idx) }} small={true} /></div>
													// </li>
													<div {...xaxa.dragHandleProps} {...xaxa.draggableProps} ref={xaxa.innerRef} className={styles.div} >
														{activeSongObject.events.length > 1 ? <div className={styles.delete}> <Minus onClick={() => { dispatchRemoveRow(idx) }} small={true} /></div> : <div></div>}
														<div style={{ zIndex: arr.length - idx }} className={styles.selector}><Dropdown dropdownId={`song ${currentSong} event ${songEvent.id}`} keyValue={Object.keys(patternsObj).map(k => [String(k), patternsObj[Number(k)].name])} className={styles.out} select={(key) => { dispatchSendPattern(idx, Number(key)) }} selected={String(songEvent.pattern)} /></div>
														<div className={styles.repeat}> <NumberBox increaseDecrease={(value) => dispatchIncDecRepeat(value, songEvent.id, idx)} updateValue={(value) => dispatchSetRepeat(value, idx)} value={songEvent.repeat} /></div>
														<div className={styles.add}><Plus onClick={() => { dispatchAddRow(idx) }} small={true} /></div>
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