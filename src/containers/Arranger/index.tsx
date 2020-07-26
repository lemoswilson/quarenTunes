import React, { useEffect, FunctionComponent, ChangeEvent, KeyboardEvent, MouseEvent, useRef, useContext } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import triggCtx from '../../context/triggState';
import {
	addRow,
	setTracker,
	addSong,
	prependRow,
	removeRow,
	removeSong,
	selectSong,
	setFollow,
	setMode,
	setMute,
	setPattern,
	setRepeat,
	arrangerMode,
	Song,
	event,
	Arranger,
} from "../../store/Arranger";
import Tone from "../../lib/tone";
import { RootState } from "../../App";
import usePrevious from "../../hooks/usePrevious";
import { Pattern, Sequencer } from "../../store/Sequencer";

const to16n = (value: number | string): string => {
	return `0:0:${value}`;
};

type patternObjs = {
	[key: number]: Pattern;
};

const ArrangerComponent: FunctionComponent = () => {
	const triggContext = useContext(triggCtx);

	const dispatch = useDispatch();

	const activePattern: number = useSelector(
		(state: RootState) => state.sequencer.activePattern
	);

	const isPlaying: boolean = useSelector(
		(state: RootState) => state.transport.isPlaying
	);

	const Track = useSelector(
		(state: RootState) => state.track
	)

	let trackCount: number = useSelector(
		(state: RootState) => state.track.trackCount
	);

	const songAmount: number = useSelector(
		(state: RootState) => Object.keys(state.arranger.songs).length
	)

	const currentSong: number = useSelector(
		(state: RootState) => state.arranger.selectedSong
	);

	const arrangerMode: arrangerMode = useSelector(
		(state: RootState) => state.arranger.mode
	);

	let patternTrackerRef: number[] = useStore<RootState>().getState().arranger.patternTracker;

	let sequencer: Sequencer = useSelector(
		(state: RootState) => state.sequencer
	);

	let sequencerRef = useRef<Sequencer>(sequencer);

	let arrangerRef: Arranger = useStore<RootState>().getState().arranger;

	const activeSongObject: Song = useSelector(
		(state: RootState) => state.arranger.songs[currentSong]
	);

	const isFollowing: boolean = useSelector(
		(state: RootState) => state.arranger.following
	);

	const previousMode: arrangerMode = usePrevious<arrangerMode>(arrangerMode);

	const patternsObj: patternObjs = useSelector(
		(state: RootState) => state.sequencer.patterns
	);


	const activePatternObj: Pattern = patternsObj[activePattern];


	const setupPatternMode = (): void => {
		if (!Tone.Transport.loop) {
			Tone.Transport.loop = true;
		}
		Tone.Transport.loopStart = 0;
		Tone.Transport.loopEnd = to16n(activePatternObj.patternLength);
		[...Array(trackCount)]
			.map((_, i) => i)
			.forEach((ix: number) => {
				if (activePatternObj.tracks[ix]) {
					// activePatternObj.tracks[ix].triggState.loop = true;
					// activePatternObj.tracks[ix].triggState.loopStart = 0;
					// activePatternObj.tracks[ix].triggState.loopEnd = to16n(
					// 	activePatternObj.tracks[ix].length
					// );
					// activePatternObj.tracks[ix].triggState.mute = false;
					// activePatternObj.tracks[ix].triggState.start(0);
				}
				triggContext.current[activePattern][ix].loop = true;
				triggContext.current[activePattern][ix].loopStart = 0;
				triggContext.current[activePattern][ix].loopEnd = to16n(
					activePatternObj.tracks[ix].length
				);
				triggContext.current[activePattern][ix].mute = false;
				triggContext.current[activePattern][ix].start(0);
			});
	};

	// setup pattern or arranger playback
	useEffect(() => { }, [arrangerMode, activePattern, trackCount, isPlaying, currentSong]);

	useEffect(() => {

	}, [sequencer]);


	// dispatchers
	const setModeDisp = (newMode: arrangerMode): void => {
		dispatch(setMode(newMode));
	};

	const scheduleFromIndex = (...args: any): void => {
		let events: event[] = args[1] ? args[1] : activeSongObject.events;
		if (Tone.Transport.loop) {
			Tone.Transport.loop = false;
		}
		if (events.length >= 1) {
			let timeCounter: number = 0;
			let eventsLength: number = events.length - 1;
			events.forEach((v, idx, arr) => {
				let repeat: number = v.repeat + 1;
				let secondaryTime: number = timeCounter;
				let rowEnd = to16n(patternsObj[v.pattern].patternLength * repeat);
				if (v.pattern >= 0) {
					if (idx === 0) {
						Tone.Transport.schedule((time) => {
							dispatch(setTracker([v.pattern, 0]));
							[...Array(trackCount).keys()].forEach(track => {
								let trackLength: number | string = sequencerRef.current.patterns[v.pattern].tracks[track].length;
								let trigg: Tone.Part = triggContext[v.pattern][track];
								trigg.mute = false;
								trigg.loop = true;
								trigg.loopEnd = to16n(trackLength);
								trigg.start("+0");
							});
						}, 0);
					} else {
						Tone.Transport.schedule((time) => {
							dispatch(setTracker([v.pattern, secondaryTime]));
							[...Array(trackCount).keys()].forEach(track => {
								let trigg: Tone.Part = triggContext[v.pattern][track];
								let pastTrigg: Tone.Part = triggContext[arr[idx - 1].pattern][track];
								let trackLength: number = sequencerRef.current.patterns[v.pattern].tracks[track].length;
								if (arr[idx - 1].pattern === v.pattern) {
									if (trigg.state !== "started") trigg.start("+0");
								} else {
									if (arr[idx - 1].pattern >= 0) {
										pastTrigg.stop();
										pastTrigg.mute = true;
										pastTrigg.loop = false;
										trigg.loop = true;
										trigg.loopEnd = to16n(trackLength);
										trigg.mute = false;
										trigg.start("+0");
									}
								}
							});
						}, timeCounter);
					}
				} else {
					if (idx > 0 && arr[idx - 1].pattern >= 0) {
						Tone.Transport.schedule((time) => {
							[...Array(trackCount).keys()].forEach(track => {
								let pastTrigg: Tone.Part = triggContext[arr[idx - 1].pattern][track];
								pastTrigg.stop();
								pastTrigg.mute = true;
							});
						}, timeCounter);
					}
				}
				timeCounter = timeCounter + Tone.Time(rowEnd).toSeconds();
			});
			if (sequencerRef.current.patterns[events[eventsLength].pattern]) {
				// Stopping patterns
				Tone.Transport.schedule((time) => {
					[...Array(trackCount).keys()].forEach(track => {
						let lastTrigg: Tone.Part =
							triggContext[events[eventsLength].pattern][track];
						lastTrigg.stop();
						lastTrigg.mute = true;
					})
				}, timeCounter);
			}
		}
	};

	const ppRow = (): void => {
		dispatch(prependRow());
		let edummy: event[] = [...activeSongObject.events];
		edummy.unshift({
			pattern: -1,
			repeat: 0,
			mute: [],
			id: -1,
		})
		Tone.Transport.cancel(0);
		scheduleFromIndex(0, edummy);
	}

	const aRow = (index: number): void => {
		dispatch(addRow(index));
		let edummy: event[] = [...activeSongObject.events];
		edummy.splice(index + 1, 0, {
			pattern: -1,
			repeat: 0,
			mute: [],
			id: -1,
		});
		Tone.Transport.cancel(0);
		scheduleFromIndex(0, edummy);
	}

	const selSong = (e: ChangeEvent<HTMLSelectElement>): void => {
		let songIndex: number = parseInt(e.currentTarget.value);
		if (arrangerMode === "arranger") Tone.Transport.cancel(0);
		dispatch(selectSong(songIndex));
		Tone.Transport.cancel();
		scheduleFromIndex(0, arrangerRef.songs[songIndex]);
	};

	const aSong = (): void => {
		dispatch(addSong());
	};

	const rSong = (e: MouseEvent<HTMLDivElement>): void => {
		Tone.Transport.cancel();
		dispatch(removeSong(currentSong));
	};

	const sPattern = (e: ChangeEvent<HTMLInputElement>, eventIndex: number): void => {
		let pIdx: number = e.currentTarget.valueAsNumber;
		let dummye: event[] = [...activeSongObject.events]
		dummye[eventIndex] = { ...dummye[eventIndex] };
		dummye[eventIndex].pattern = pIdx;
		dispatch(setPattern(pIdx, eventIndex));
		Tone.Transport.cancel(0);
		scheduleFromIndex(0, dummye);
	};

	const sRepeat = (e: ChangeEvent<HTMLInputElement>, eventIndex: number): void => {
		let repeat: number = e.currentTarget.valueAsNumber;
		let dummye: event[] = [...activeSongObject.events];
		dummye[eventIndex] = { ...dummye[eventIndex] };
		dummye[eventIndex].repeat = repeat;
		dispatch(setRepeat(repeat, eventIndex));
		Tone.Transport.cancel();
		scheduleFromIndex(0, dummye);
	};

	const rRow = (index: number): void => {
		let dummye: event[] = [...activeSongObject.events];
		dummye.splice(index, 1);
		dispatch(removeRow(index));
		Tone.Transport.cancel()
		scheduleFromIndex(0, dummye);
	};

	const sMute = (e: KeyboardEvent<HTMLInputElement>, eventIndex: number): void => {
		if (e.keyCode === 13) {
			let m: string | number[] = e.currentTarget.value;
			if (m === "") m = []
			else m = m.split(",").map(v => v.trim()).map(v => parseInt(v));
			dispatch(setMute(m, eventIndex));
			let dummye: event[] = [...activeSongObject.events];
			dummye[eventIndex] = { ...dummye[eventIndex] };
			dummye[eventIndex].mute = m;
			Tone.Transport.cancel();
			scheduleFromIndex(0, dummye);
		}
	};

	// Conditional styles, elements and properties
	const mutePlaceholder = (eventIndex: number): string => {
		return activeSongObject.events[eventIndex].mute.join(',');
	}

	const removeS = songAmount > 2 && !isPlaying ? (
		<div className='removeSong' onClick={rSong}>
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



	return (
		<div>
			{trackCount}
			<div></div>
		</div>
	);
};

export default ArrangerComponent;