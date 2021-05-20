import {
	start,
	stop,
	toggleRecording,
	setBPM,
	increaseDecreaseBPMAction,
	toggleMetronome,
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
import Metronome from '../../components/Layout/Icons/Metronome';
import { bbsFromSixteenth, sixteenthFromBBSOG } from "../Arranger";
import { FMSynth, Sampler } from "tone";
import strong from '../../assets/strong.mp3'
import weak from '../../assets/weak.mp3'

const Transport: FunctionComponent = () => {
	// const Tone = useContext(ToneContext);
	const dispatch = useDispatch();
	// const Tone = useContext(ToneContext);

	const isPlay = useSelector(
		(state: RootState) => state.transport.present.isPlaying
	);

	const metronomeState = useSelector(
		(state: RootState) => state.transport.present.metronome
	)

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

	// const metronome: MutableRefObject<FMSynth | null> = useRef(null);
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
			// baseUrl: "/assets/",
			onload: () => {
				console.log('loaded samples')
			},
			onerror: (error) => {
				console.log('error, the error is:', error)
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
			// console.log('tone context is', Tone.context.latencyHint);
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

	// useEffect(() => {
	// 	Tone.Transport.scheduleRepeat((time) => {
	// 		console.log(`tone transport callback, time ${time}`)
	// 	}, '16n');
	// }, []);


	const _stop = (): void => { 
		dispatch(stop()) 
		// Tone.Transport.position = 0;
	};
	const _toggleRecording = (): void => { dispatch(toggleRecording()) };
	const stopCallback = (): void => { Tone.Transport.cancel() };
	const _setBPM = (bpm: number): void => { dispatch(setBPM(bpm)) };

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
					<Rec onClick={_toggleRecording} active={isRec}/>
					<ModeSelector mode={mode} onClick={() => {dispatch(toggleMode())}}/>
					<Metronome toggleMetronome={_toggleMetronome} active={metronomeState}/>
				</div>
			</div>
	)	
};

export default Transport;
