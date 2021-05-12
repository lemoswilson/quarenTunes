import {
	startPlayback,
	stopPlayback,
	toggleRecording,
	setBPM,
	increaseDecreaseBPMAction,
	increaseDecreaseBPM,
} from "../../store/Transport";
import React, { useEffect, FunctionComponent, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Xolombrisx";
import { toggleMode } from '../../store/Arranger';
// import Tone from "../../lib/tone";
import * as Tone from "tone";
import styles from './style.module.scss';
import ToneContext from '../../context/ToneContext';
import Save from '../../components/Layout/Icons/Save';
import Play from '../../components/Layout/Play'
import Stop from '../../components/Layout/Stop'
import Rec from '../../components/Layout/Record'
import ModeSelector from '../../components/Layout/ModeSelector'
import BPMSelector from '../../components/Layout/BPMSelector';

const Transport: FunctionComponent = () => {
	// const Tone = useContext(ToneContext);
	const dispatch = useDispatch();

	const isPlay = useSelector(
		(state: RootState) => state.transport.present.isPlaying
	);

	const mode = useSelector(
		(state: RootState) => state.arranger.present.mode
	)

	const isRec = useSelector(
		(state: RootState) => state.transport.present.recording
	);

	const bpm = useSelector((state: RootState) => state.transport.present.bpm);

	useEffect(() => {
		isPlay ? Tone.Transport.start() : Tone.Transport.stop();
	}, [isPlay]);

	const start = (): void => {
		if (Tone.context.state !== "running") {
			Tone.context.resume();
			Tone.context.latencyHint = "interactive";
			Tone.context.lookAhead = 0;
		}
		dispatch(startPlayback());
	};

	const _increaseDecreaseBPM = (amount: number) => {
		dispatch(increaseDecreaseBPM(amount))
	}

	const submitBPM = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        const val = Number(input.value)
		
		let data = bpm;

		if (!Number.isNaN(val) && val >= 33 && val <= 350) {
			_setBPM(val)
			data = val
		}
			
        input.value = String(data);
        input.blur()
    };

	const stop = (): void => { dispatch(stopPlayback()) };
	const record = (): void => { dispatch(toggleRecording()) };
	const stopCallback = (): void => { Tone.Transport.cancel() };
	const _setBPM = (bpm: number): void => { dispatch(setBPM(bpm)) };
	const toggleRec = (): void => { dispatch(toggleRecording()) };

	return (
			<div className={styles.overlay}>
				<div className={styles.grouper}>
					<Save small={true}/>
					<BPMSelector bpm={bpm} increaseDecrease={_increaseDecreaseBPM} disabled={false} onSubmit={submitBPM}/>
					<Play onClick={start}/>
					<Stop onClick={stop}/>
					<Rec onClick={record}/>
					<ModeSelector mode={mode} onClick={() => {dispatch(toggleMode())}}/>
				</div>
			</div>
	)	
};

export default Transport;
