import {
	start,
	stop,
	toggleRecording,
	setBPM,
	toggleMetronome,
	increaseDecreaseBPM,
} from "../../store/Transport";
import React, { useEffect, FunctionComponent, useRef, MutableRefObject, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import * as Tone from "tone";
import styles from './style.module.scss';
import Save from '../../components/UI/Save';
import Play from '../../components/UI/Play'
import Stop from '../../components/UI/Stop'
import Rec from '../../components/UI/Record'
import ModeSelector from '../../components/UI/ModeSelector'
import BPMSelector from '../../components/UI/BPMSelector';
import Metronome from '../../components/UI/Metronome';
import { sixteenthFromBBSOG } from "../../lib/utility"
import { Sampler } from "tone";
import UserDataContext from "../../context/userDataContext";
import strong from '../../assets/strong.mp3'
import weak from '../../assets/weak.mp3'

const Transport: React.FC<{name?: string, saveProject: () => void }> = ({saveProject}) => {
	const dispatch = useDispatch();
	const User = useContext(UserDataContext);

	const isPlay = useSelector(
		(state: RootState) => state.transport.present.isPlaying
	);

	const metronomeState = useSelector(
		(state: RootState) => state.transport.present.metronome
	)


	const isRec = useSelector(
		(state: RootState) => state.transport.present.recording
	);

	const bpm = useSelector((state: RootState) => state.transport.present.bpm);

	const metronome: MutableRefObject<Sampler | null> = useRef(null);
	const metronomeLoop: MutableRefObject<Tone.Loop | null> = useRef(null);

	useEffect(() => {
		function playNote(time: any) {
			metronome.current?.triggerAttackRelease(
				sixteenthFromBBSOG(Tone.Transport.position.toLocaleString()) % 16 === 0
				? 'C3'
				: 'D3',
				'16n',
				time
			)
		}

		metronome.current = new Tone.Sampler({
			urls: {
				C3: strong,
				D3: weak,
			},
		}).toDestination()

		metronomeLoop.current = new Tone.Loop(playNote, '4n');
	}, [])

	useEffect(() => {

		if (metronomeState && metronomeLoop.current){
			metronomeLoop.current.start(0)
		} else {
			metronomeLoop.current?.stop()
		}

	}, [metronomeState])



	useEffect(() => {
		Tone.Transport.bpm.value = bpm;
	}, [bpm])

	useEffect(() => {
		isPlay ? Tone.Transport.start() : Tone.Transport.stop();
	}, [isPlay]);

	const _start = (): void => {
		if (Tone.context.state !== "running") {
			Tone.context.resume();
			Tone.context.latencyHint = "interactive";
			Tone.context.lookAhead = 0;
		}
		dispatch(start());
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

	const _toggleMetronome = () => {
		dispatch(toggleMetronome());
	}

	const _stop = (): void => { dispatch(stop()) };
	const _toggleRecording = (): void => { dispatch(toggleRecording()) };
	const _setBPM = (bpm: number): void => { dispatch(setBPM(bpm)) };

	useEffect(() => {
		Tone.context.lookAhead = 0.05;
	}, [])


	return (
			<div className={styles.overlay}>
				<div className={styles.grouper}>
					{ User.isAuthenticated ? <Save onClick={saveProject} small={true}/> : null }
					{/* <Save onClick={saveProject} small={true}/> */}
					<BPMSelector bpm={bpm} increaseDecrease={_increaseDecreaseBPM} disabled={false} onSubmit={submitBPM}/>
					<Play onClick={_start}/>
					<Stop onClick={_stop}/>
					<Rec onClick={_toggleRecording} active={isRec}/>
					<Metronome toggleMetronome={_toggleMetronome} active={metronomeState}/>
				</div>
			</div>
	)	
};

export default Transport;
