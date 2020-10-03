import React, {
	useEffect,
	FunctionComponent,
	ChangeEvent,
	KeyboardEvent,
	MouseEvent,
	useRef,
	useContext,
	useState,
	useCallback
} from "react";
import { useDispatch, useSelector } from "react-redux";
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
	event,
	// Arranger,
} from "../../store/Arranger";
import { goToActive } from '../../store/Sequencer'
import Tone from "../../lib/tone";
import { RootState } from "../../App";
import usePrevious from "../../hooks/usePrevious";
import useQuickRef from "../../hooks/useQuickRef";
import { current } from "immer";

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

	const actPat = useSelector((state: RootState) => state.sequencer.activePattern);
	const isPlaying = useSelector((state: RootState) => state.transport.isPlaying);
	const previousPlaying = usePrevious(isPlaying);
	const selectedTrack = useSelector((state: RootState) => state.track.selectedTrack);
	const activePage = useSelector((state: RootState) => state.sequencer.patterns[actPat].tracks[selectedTrack].page);
	const trkCount = useSelector((state: RootState) => state.track.trackCount);
	const trackCounter = useQuickRef(trkCount);
	const songAmount = useSelector((state: RootState) => Object.keys(state.arranger.songs).length)
	const currentSong = useSelector((state: RootState) => state.arranger.selectedSong);
	const arrangerMode = useSelector((state: RootState) => state.arranger.mode);
	const patternTracker = useSelector((state: RootState) => state.arranger.patternTracker);
	const patte = useSelector((state: RootState) => state.sequencer.patterns)
	const arrg = useSelector((state: RootState) => state.arranger)
	const actSongObj = useSelector((state: RootState) => state.arranger.songs[currentSong]);
	const isFollowing = useSelector((state: RootState) => state.arranger.following);
	const previousMode = usePrevious(arrangerMode);
	const patternsObj = useSelector((state: RootState) => state.sequencer.patterns);
	const activePatternObj = patternsObj[actPat];
	const activePattern = useQuickRef(actPat)
	const isPlay = useQuickRef(isPlaying)
	const patterns = useQuickRef(patte);
	const arranger = useQuickRef(arrg);
	const activeSongObject = useQuickRef(actSongObj);
	const songPatterns = actSongObj.events.map(v => v.pattern);
	const songRepeats = actSongObj.events.map(v => v.repeat);
	const songMutes = actSongObj.events.map(v => v.mute);

	const scheduleFromIndex = useCallback((...args: any) => {
		const events: event[] = args[1] ? args[1] : activeSongObject.current.events;

		if (Tone.Transport.loop) {
			Tone.Transport.loop = false;
		}

		if (events.length >= 1) {
			Tone.Transport.cancel();
			let timeCounter: number = 0;
			const eventsLength: number = events.length - 1;

			events.forEach((v, idx, arr) => {
				const secondaryTime: number = timeCounter;
				const repeat: number = v.repeat + 1;
				const rowEnd = bbsFromSixteenth(patternsObj[v.pattern].patternLength * repeat);

				if (v.pattern >= 0) {

					if (idx === 0) {
						Tone.Transport.schedule((time) => {
							dispatch(setTracker([v.pattern, 0]));
							[...Array(trackCounter.current).keys()].forEach(track => {
								const trackLength: number | string = patterns.current[v.pattern].tracks[track].length;
								const b = bbsFromSixteenth(trackLength)
								const instrumentTrigg: Tone.Part = triggRef.current[v.pattern][track].instrument;
								const fxTriggs = triggRef.current[v.pattern][track].effects
								const l = fxTriggs.length
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
							});
						}, 0);
					} else {
						Tone.Transport.schedule((time) => {
							dispatch(setTracker([v.pattern, secondaryTime]));
							[...Array(trackCounter.current).keys()].forEach(track => {
								const instrumentTrigg = triggRef.current[v.pattern][track].instrument;
								const fxTriggs = triggRef.current[v.pattern][track].effects
								const pastFxTriggs = triggRef.current[arr[idx - 1].pattern][track].effects
								const pastInstrumentTrigg = triggRef.current[arr[idx - 1].pattern][track].instrument;
								const trackLength: number = patterns.current[v.pattern].tracks[track].length;
								if (arr[idx - 1].pattern === v.pattern) {
									if (instrumentTrigg.state !== "started") instrumentTrigg.start("+0");
									for (let i = 0; i < fxTriggs.length; i++) {
										if (fxTriggs[i].state !== "started") fxTriggs[i].start("+0")
									}
								} else {
									if (arr[idx - 1].pattern >= 0) {
										pastInstrumentTrigg.stop();
										pastInstrumentTrigg.mute = true;
										pastInstrumentTrigg.loop = false;
										instrumentTrigg.loop = true;
										instrumentTrigg.loopEnd = bbsFromSixteenth(trackLength);
										instrumentTrigg.mute = false;
										instrumentTrigg.start("+0");
										for (let i = 0; i < fxTriggs.length; i++) {
											pastFxTriggs[i].mute = true
											pastFxTriggs[i].loop = false
											pastFxTriggs[i].stop();
											fxTriggs[i].mute = false;
											fxTriggs[i].loop = true;
											fxTriggs[i].loopEnd = bbsFromSixteenth(trackLength);
											fxTriggs[i].start("+0");
										}
									}
								}
							});
						}, timeCounter);
					}

				} else {
					if (idx > 0 && arr[idx - 1].pattern >= 0) {
						Tone.Transport.schedule((time) => {
							[...Array(trkCount).keys()].forEach(track => {
								const pastInstrumentTriggs: Tone.Part = triggRef.current[arr[idx - 1].pattern][track].instrument;
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
			if (patterns.current[events[eventsLength].pattern]) {
				// Stopping patterns
				Tone.Transport.schedule((time) => {
					[...Array(trkCount).keys()].forEach(track => {
						const lastTriggInstrument: Tone.Part =
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
		patternsObj,
		triggRef,
		trkCount
	]
	)


	const setupPatternMode = useCallback(() => {
		if (!Tone.Transport.loop) {
			Tone.Transport.loop = true;
		}

		Tone.Transport.loopStart = 0;
		Tone.Transport.loopEnd = bbsFromSixteenth(activePatternObj.patternLength);
		[...Array(trkCount)]
			.map((_, i) => i)
			.forEach((ix: number) => {
				const b = bbsFromSixteenth(activePatternObj.tracks[ix].length)
				const InstrumentTrigg = triggRef.current[actPat][ix].instrument
				const fxTriggs = triggRef.current[actPat][ix].effects
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
		actPat,
		activePatternObj.patternLength,
		activePatternObj.tracks,
		triggRef,
		trkCount
	])


	const goTo = useCallback(() => {
		let pageToGo: number | undefined = undefined;
		const nowTime: string = String(Tone.Transport.position).split('.')[0];
		const patternToUse: number = patternTracker[0] ? patternTracker[0] : activeSongObject.current.events[0].pattern;
		const timeb: number = patternTracker[1] ? patternTracker[1] : 0;
		const patternToGo: number = patternToUse;
		const timeBBS: string = Tone.Time(timeb, 's').toBarsBeatsSixteenths();
		const step: number = sixteenthFromBBS(nowTime) - sixteenthFromBBS(timeBBS);
		const patternLocation: number = step % patterns.current[patternTracker[0]].patternLength;
		const trackStep: number =
			patterns.current[patternToUse].tracks[selectedTrack].length
				< patterns.current[patternTracker[0]].patternLength
				? patternLocation % patterns.current[patternTracker[0]].tracks[selectedTrack].length
				: patternLocation;
		pageToGo = Math.floor(trackStep / 16);

		if (
			actPat !== pageToGo
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
			actPat === patternToGo
			&& activePage !== pageToGo
		) {
			dispatch(goToActive(pageToGo, selectedTrack, undefined));
		} else if (
			actPat !== patternToGo
			&& pageToGo === activePage
		) {
			dispatch(goToActive(undefined, selectedTrack, patternToGo));
		}
	}, [
		actPat,
		activePage,
		dispatch,
		patternTracker,
		selectedTrack,
		patterns,
	])

	// setup pattern or arranger playback
	useEffect(() => {
		if (Tone.Transport.state !== "started") {
			if (arrangerMode === "pattern") {
				Tone.Transport.cancel(0);
				setupPatternMode();
			} else {
				if (previousMode === "pattern") {
					[...Array(trackCounter.current).keys()].forEach(track => {
						const fxTriggs = triggRef.current[activePattern.current][track].effects
						triggRef.current[activePattern.current][track].instrument.stop();
						triggRef.current[activePattern.current][track].instrument.mute = true;
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
		actPat,
		trkCount,
		isPlaying,
		currentSong,
		scheduleFromIndex,
		setupPatternMode,
		previousMode,
		triggRef
	]
	);


	useEffect(() => {
		scheduleFromIndex(0)
	}, [songMutes, songPatterns, songRepeats, scheduleFromIndex, currentSong])

	// set following scheduler
	useEffect(() => {
		let newSchedulerId: number
		let schedulerPart: Tone.Part;
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
	const setModeDisp = (newMode: arrangerMode): void => {
		dispatch(setMode(newMode));
	};





	const ppRow = (): void => {
		dispatch(prependRow());
		const edummy: event[] = [...activeSongObject.current.events];
		edummy.unshift({
			pattern: -1,
			repeat: 0,
			mute: [],
			id: -1,
		})
		Tone.Transport.cancel(0);
		// scheduleFromIndex(0, edummy);
	}

	const aRow = (index: number): void => {
		dispatch(addRow(index));
		const edummy: event[] = [...activeSongObject.current.events];
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

	const selSong = (e: ChangeEvent<HTMLSelectElement>): void => {
		const songIndex: number = parseInt(e.currentTarget.value);
		if (arrangerMode === "arranger") Tone.Transport.cancel(0);
		dispatch(selectSong(songIndex));
		// Tone.Transport.cancel();
		// scheduleFromIndex(0, arranger.current.songs[songIndex]);
	};


	const aSong = (): void => { dispatch(addSong()); };

	const rSong = (e: MouseEvent<HTMLDivElement>): void => {
		Tone.Transport.cancel();
		dispatch(removeSong(currentSong));
	};

	const sPattern = (e: ChangeEvent<HTMLInputElement>, eventIndex: number): void => {
		const pIdx: number = e.currentTarget.valueAsNumber;
		// const dummye: event[] = [...activeSongObject.current.events]
		// dummye[eventIndex] = { ...dummye[eventIndex] };
		// dummye[eventIndex].pattern = pIdx;
		dispatch(setPattern(pIdx, eventIndex));
		// Tone.Transport.cancel(0);
		// scheduleFromIndex(0, dummye);
	};

	const sRepeat = (e: ChangeEvent<HTMLInputElement>, eventIndex: number): void => {
		const repeat: number = e.currentTarget.valueAsNumber;
		// const dummye: event[] = [...activeSongObject.current.events];
		// dummye[eventIndex] = { ...dummye[eventIndex] };
		// dummye[eventIndex].repeat = repeat;
		dispatch(setRepeat(repeat, eventIndex));
		// Tone.Transport.cancel();
		// scheduleFromIndex(0, dummye);
	};

	const rRow = (index: number): void => {
		const dummye: event[] = [...activeSongObject.current.events];
		dummye.splice(index, 1);
		dispatch(removeRow(index));
		// Tone.Transport.cancel()
		// scheduleFromIndex(0, dummye);
	};

	const sMute = (e: KeyboardEvent<HTMLInputElement>, eventIndex: number): void => {
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
		return activeSongObject.current.events[eventIndex].mute.join(',');
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
			{trkCount}
			<div></div>
		</div>
	);
};

export default Arranger;