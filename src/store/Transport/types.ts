export enum transportActions {
	START = "START",
	STOP = "STOP",
	RECORD = "RECORD",
	SET_BPM = "SET_BPM",
	INC_DEC_BPM = "INC_DEC_BPM",
	TOGGLE_METRONOME = "TOGGLE_METRONOME"
}

export interface Transport {
	isPlaying: boolean;
	recording: boolean;
	bpm: number;
	metronome: boolean;
}

export interface toggleMetronomeAction {
	type: transportActions.TOGGLE_METRONOME,
}

export interface startAction {
	type: transportActions.START;
}

export interface stopAction {
	type: transportActions.STOP;
}

export interface toggleRecordingAction {
	type: transportActions.RECORD;
}

export interface increaseDecreaseBPMAction {
	type: transportActions.INC_DEC_BPM,
	payload: {
		amount: number,
	}
}

export interface setBPMAction {
	type: transportActions.SET_BPM;
	payload: {
		bpm: number;
	};
}

export type transportActionTypes =
	| startAction
	| stopAction
	| toggleRecordingAction
	| increaseDecreaseBPMAction
	| toggleMetronomeAction
	| setBPMAction;
