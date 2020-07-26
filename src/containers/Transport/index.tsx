import {
	startPlayback,
	stopPlayback,
	toggleRecording,
	setBPM,
} from "../../store/Transport";
import React, { useEffect, FunctionComponent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../App";
import Tone from "../../lib/tone";

const Transport: FunctionComponent = () => {
	const dispatch = useDispatch();

	const isPlaying: boolean = useSelector(
		(state: RootState) => state.transport.isPlaying
	);

	const recording: boolean = useSelector(
		(state: RootState) => state.transport.recording
	);

	const bpm: number = useSelector((state: RootState) => state.transport.bpm);

	useEffect(() => {
		if (isPlaying) {
			Tone.Transport.start();
		} else {
			Tone.Transport.stop();
		}
	}, [isPlaying]);

	const start = () => {
		if (Tone.context.state !== "running") {
			Tone.context.resume();
			Tone.context.latencyHint = "playback";
			Tone.context.lookAhead = 0;
		}
		dispatch(startPlayback());
	};

	const stop = () => dispatch(stopPlayback());

	const record = () => dispatch(toggleRecording());

	const stopCallback = () => Tone.Transport.cancel();

	const bpmSet = (e: MouseEvent): void => {
		setBPM(120);
	};
	const toggleRec = () => dispatch(toggleRecording());

	return <div></div>;
};

export default Transport;
