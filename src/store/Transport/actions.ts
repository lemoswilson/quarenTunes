import { transportActionTypes, transportActions } from "./types";

export function toggleMetronome(): transportActionTypes {
	return {
		type: transportActions.TOGGLE_METRONOME,
	}
}

export function increaseDecreaseBPM(amount: number): transportActionTypes {
	return {
		type: transportActions.INC_DEC_BPM,
		payload: {
			amount: amount,
		}
	}
}

export function start(): transportActionTypes {
	return {
		type: transportActions.START,
	};
}

export function stop(): transportActionTypes {
	return {
		type: transportActions.STOP,
	};
}

export function toggleRecording(): transportActionTypes {
	return {
		type: transportActions.RECORD,
	};
}

export function setBPM(bpm: number): transportActionTypes {
	return {
		type: transportActions.SET_BPM,
		payload: {
			bpm: bpm,
		},
	};
}
