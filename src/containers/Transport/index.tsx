import {
	start,
	stop,
	toggleRecording,
	setBPM,
	increaseDecreaseBPMAction,
	increaseDecreaseBPM,
} from "../../store/Transport";
import React, { useEffect, FunctionComponent, useContext, useRef, MutableRefObject } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Xolombrisx";
import { arrangerMode, toggleMode } from '../../store/Arranger';
// import Tone from "../../lib/tone";
import * as Tone from "tone";
import styles from './style.module.scss';
// import ToneContext from '../../context/ToneContext';
import Save from '../../components/Layout/Icons/Save';
import Play from '../../components/Layout/Play'
import Stop from '../../components/Layout/Stop'
import Rec from '../../components/Layout/Record'
import ModeSelector from '../../components/Layout/ModeSelector'
import BPMSelector from '../../components/Layout/BPMSelector';
import { bbsFromSixteenth } from "../Arranger";
import { FMSynth } from "tone";

const Transport: FunctionComponent = () => {
	// const Tone = useContext(ToneContext);
	const dispatch = useDispatch();
	// const Tone = useContext(ToneContext);

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

	const patternLength = useSelector((state: RootState) => {
		const activePatt = state.sequencer.present.activePattern;
		return state.sequencer.present.patterns[activePatt].patternLength
	})

	const metronome: MutableRefObject<FMSynth | null> = useRef(null);
	const metronomeLoop: MutableRefObject<any> = useRef(null);

	useEffect(() => {
		// function playNote(time: any) {
		// 	metronome.current?.triggerAttackRelease('A4', '16n', time);
		// }
		// metronome.current = new Tone.FMSynth().toDestination()
		// metronomeLoop.current = new Tone.Loop(playNote, '4n');
		// metronomeLoop.current.start(0);



		// Tone.Transport.scheduleRepeat((time) => {
		// 	metronome.current?.triggerAttackRelease('C3', '16n', "+0");
		// }, '4n')
	}, [])

	useEffect(() => {
		Tone.Transport.bpm.value = bpm;
		// Tone.Transport.scheduleOnce((time) => {
		// 	// console.log(`should be starting now `);
		// }, 0)
	}, [])


	useEffect(() => {
		Tone.Transport.bpm.value = bpm;
	}, [bpm])

	useEffect(() => {
		// console.log('is play', isPlay, 'if true shuold be starting');
		isPlay ? Tone.Transport.start() : Tone.Transport.stop();
	}, [isPlay]);

	const _start = (): void => {
		if (Tone.context.state !== "running") {
			Tone.context.resume();
			console.log('tone context is', Tone.context.latencyHint);
			// Tone.context.latencyHint = "interactive";
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

	// useEffect(() => {
	// 	Tone.Transport.scheduleRepeat((time) => {
	// 		console.log(`tone transport callback, time ${time}`)
	// 	}, '16n');
	// }, []);


	const _stop = (): void => { 
		dispatch(stop()) 
		// Tone.Transport.position = 0;
	};
	const record = (): void => { dispatch(toggleRecording()) };
	const stopCallback = (): void => { Tone.Transport.cancel() };
	const _setBPM = (bpm: number): void => { dispatch(setBPM(bpm)) };
	const toggleRec = (): void => { dispatch(toggleRecording()) };

	useEffect(() => {
		// Tone.Transport.loop = mode === arrangerMode.ARRANGER ? false : true;
		// if (mode === arrangerMode.PATTERN) {
		// 	Tone.Transport.setLoopPoints(0, bbsFromSixteenth(patternLength) )
		// }
	}, [mode])

	return (
			<div className={styles.overlay}>
				<div className={styles.grouper}>
					<Save small={true}/>
					<BPMSelector bpm={bpm} increaseDecrease={_increaseDecreaseBPM} disabled={false} onSubmit={submitBPM}/>
					<Play onClick={_start}/>
					<Stop onClick={_stop}/>
					<Rec onClick={record}/>
					<ModeSelector mode={mode} onClick={() => {dispatch(toggleMode())}}/>
				</div>
			</div>
	)	
};

export default Transport;
