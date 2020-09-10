import React, { useEffect, FunctionComponent, ChangeEvent, KeyboardEvent, MouseEvent, useRef, useContext, useState } from "react";
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
import { goToActive } from '../../store/Sequencer'
import Tone from "../../lib/tone";
import { RootState } from "../../App";
import usePrevious from "../../hooks/usePrevious";
import { Pattern, Sequencer, addPattern } from "../../store/Sequencer";

export const to16string = (value: number | string): string => {
	return `0:0:${value}`;
};

export const to16number = (time: string): number => {
	let result: number = Number();
	let timeArray: number[] = time.split(':').map(v => parseInt(v));
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

type patternObjs = {
	[key: number]: Pattern;
};

const ArrangerComponent: FunctionComponent = () => {
	const [schedulerID, setSchedulerID] = useState<number | undefined>(undefined);
	const triggRef = useContext(triggCtx);
	const dispatch = useDispatch();

	const activePattern = useSelector(
		(state: RootState) => state.sequencer.activePattern
	);
	const isPlaying = useSelector(
		(state: RootState) => state.transport.isPlaying
	);

	// previous
	const previousPlaying = usePrevious(isPlaying);

	const Track = useSelector(
		(state: RootState) => state.track
	);

	const selectedTrack = useSelector(
		(state: RootState) => state.track.selectedTrack
	);

	const activePage = useSelector(
		(state: RootState) => state.sequencer.patterns[activePattern].tracks[selectedTrack].page
	);

	let trackCount = useSelector(
		(state: RootState) => state.track.trackCount
	);

	let pattCounter = useSelector(
		(state: RootState) => state.sequencer.counter
	)

	const songAmount = useSelector(
		(state: RootState) => Object.keys(state.arranger.songs).length
	)

	const currentSong = useSelector(
		(state: RootState) => state.arranger.selectedSong
	);

	const arrangerMode = useSelector(
		(state: RootState) => state.arranger.mode
	);

	let patternTracker = useSelector(
		(state: RootState) => state.arranger.patternTracker
	);

	let sequencer = useSelector(
		(state: RootState) => state.sequencer
	);

	let sequencerRef = useRef<Sequencer>(sequencer);

	let arrangerRef = useStore<RootState>().getState().arranger;

	const activeSongObject = useSelector(
		(state: RootState) => state.arranger.songs[currentSong]
	);

	const isFollowing = useSelector(
		(state: RootState) => state.arranger.following
	);

	const previousMode = usePrevious<arrangerMode>(arrangerMode);

	const patternsObj = useSelector(
		(state: RootState) => state.sequencer.patterns
	);


	const activePatternObj = patternsObj[activePattern];


	const setupPatternMode = () => {
		if (!Tone.Transport.loop) {
			Tone.Transport.loop = true;
		}

		Tone.Transport.loopStart = 0;
		Tone.Transport.loopEnd = to16string(activePatternObj.patternLength);
		[...Array(trackCount)]
			.map((_, i) => i)
			.forEach((ix: number) => {
				triggRef.current[activePattern][ix].loop = true;
				triggRef.current[activePattern][ix].loopStart = 0;
				triggRef.current[activePattern][ix].loopEnd = to16string(
					activePatternObj.tracks[ix].length
				);
				triggRef.current[activePattern][ix].mute = false;
				triggRef.current[activePattern][ix].start(0);
			});
	};

	// setup pattern or arranger playback
	useEffect(() => { }, [arrangerMode, activePattern, trackCount, isPlaying, currentSong]);

	// set following scheduler
	useEffect(() => {
		let newSchedulerId: number
		let schedulerPart: Tone.Part;
		if (isFollowing && !schedulerID && arrangerMode === "arranger") {

			schedulerPart = new Tone.Part(() => {
				goTo();
			}, [0]);
			schedulerPart.start(0);
			schedulerPart.loop = true;
			schedulerPart.loopEnd = '16n';
			newSchedulerId = 1;
			setSchedulerID(newSchedulerId);

		} else if ((!isFollowing && schedulerID) || (!isPlaying && previousPlaying)) {
			setSchedulerID(0)
		}
	}, [isFollowing, schedulerID, isPlaying, arrangerMode]);

	useEffect(() => {
		sequencerRef.current = sequencer;
	}, [sequencer]);


	// dispatchers
	const setModeDisp = (newMode: arrangerMode): void => {
		dispatch(setMode(newMode));
	};

	const stopSongCallback = (): void => {
		activeSongObject.events.forEach((event, idx, array) => {
			if (event.pattern >= 0 && triggRef) {
				[...Array(trackCount).keys()].forEach(track => {
					triggRef.current[event.pattern][track].stop();
					triggRef.current[event.pattern][track].mute = true;
				});
			}
		});
	}

	const goTo = (): void => {
		let nowTime: string = String(Tone.Transport.position).split('.')[0];
		let pageToGo: number | undefined = undefined;
		let patternToUse: number = patternTracker[0] ? patternTracker[0] : activeSongObject.events[0].pattern;
		let timeb: number = patternTracker[1] ? patternTracker[1] : 0;
		let patternToGo: number = patternToUse;
		let timeBBS: string = Tone.Time(timeb, 's').toBarsBeatsSixteenths();
		let step: number = to16number(nowTime) - to16number(timeBBS);
		let patternLocation: number = step % sequencer.patterns[patternTracker[0]].patternLength;
		let trackStep: number =
			sequencer.patterns[patternToUse].tracks[selectedTrack].length
				< sequencer.patterns[patternTracker[0]].patternLength
				? patternLocation % sequencer.patterns[patternTracker[0]].tracks[selectedTrack].length
				: patternLocation;
		pageToGo = Math.floor(trackStep / 16);

		if (
			activePattern !== pageToGo &&
			activePage !== pageToGo
		) {
			dispatch(goToActive(pageToGo, selectedTrack, patternToGo));
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
				let rowEnd = to16string(patternsObj[v.pattern].patternLength * repeat);

				if (v.pattern >= 0) {

					if (idx === 0) {
						Tone.Transport.schedule((time) => {
							dispatch(setTracker([v.pattern, 0]));
							[...Array(trackCount).keys()].forEach(track => {
								let trackLength: number | string = sequencerRef.current.patterns[v.pattern].tracks[track].length;
								let trigg: Tone.Part = triggRef.current[v.pattern][track];
								trigg.mute = false;
								trigg.loop = true;
								trigg.loopEnd = to16string(trackLength);
								trigg.start("+0");
							});
						}, 0);
					} else {
						Tone.Transport.schedule((time) => {
							dispatch(setTracker([v.pattern, secondaryTime]));
							[...Array(trackCount).keys()].forEach(track => {
								let trigg: Tone.Part = triggRef.current[v.pattern][track];
								let pastTrigg: Tone.Part = triggRef.current[arr[idx - 1].pattern][track];
								let trackLength: number = sequencerRef.current.patterns[v.pattern].tracks[track].length;
								if (arr[idx - 1].pattern === v.pattern) {
									if (trigg.state !== "started") trigg.start("+0");
								} else {
									if (arr[idx - 1].pattern >= 0) {
										pastTrigg.stop();
										pastTrigg.mute = true;
										pastTrigg.loop = false;
										trigg.loop = true;
										trigg.loopEnd = to16string(trackLength);
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
								let pastTrigg: Tone.Part = triggRef.current[arr[idx - 1].pattern][track];
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
							triggRef.current[events[eventsLength].pattern][track];
						lastTrigg.stop();
						lastTrigg.mute = true;
					});
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