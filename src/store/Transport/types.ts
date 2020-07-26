export enum transportActions {
	START = "START",
	STOP = "STOP",
	RECORD = "RECORD",
	SET_BPM = "SET_BPM",
}

export interface Transport {
	isPlaying: boolean;
	recording: boolean;
	bpm: number;
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
	| setBPMAction;
