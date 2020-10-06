import {
	startPlayback,
	stopPlayback,
	toggleRecording,
	setBPM,
} from "../../store/Transport";
import React, { useEffect, FunctionComponent, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../App";
import Tone from "../../lib/tone";

const Transport: FunctionComponent = () => {
	const dispatch = useDispatch();

	const isPlaying = useSelector(
		(state: RootState) => state.transport.present.isPlaying
	);

	const recording = useSelector(
		(state: RootState) => state.transport.present.recording
	);

	const bpm = useSelector((state: RootState) => state.transport.present.bpm);

	useEffect(() => {
		isPlaying ? Tone.Transport.start() : Tone.Transport.stop();
	}, [isPlaying]);

	const start = (): void => {
		if (Tone.context.state !== "running") {
			Tone.context.resume();
			Tone.context.latencyHint = "playback";
			Tone.context.lookAhead = 0;
		}
		dispatch(startPlayback());
	};

	const stop = (): void => { dispatch(stopPlayback()) };
	const record = (): void => { dispatch(toggleRecording()) };
	const stopCallback = (): void => { Tone.Transport.cancel() };
	const bpmSet = (e: MouseEvent): void => { setBPM(120) };
	const toggleRec = (): void => { dispatch(toggleRecording()) };

	return <div></div>;
};

export default Transport;
