import { transportActionTypes, transportActions } from "./types";

export function startPlayback(): transportActionTypes {
	return {
		type: transportActions.START,
	};
}

export function stopPlayback(): transportActionTypes {
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
