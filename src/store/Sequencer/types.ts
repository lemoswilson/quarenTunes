import Tone from "../../lib/tone";

export type pLockType = number | string | boolean | Tone.TimeClass;
export interface LockData {
	value: pLockType;
	parameter: string;
}

export enum sequencerActions {
	REMOVE_PATTERN = "REMOVE_PATTERN",
	SET_NOTE_LENGTH_PLAYBACK = "SET_NOTE_LENGTH_PLAYBACK",
	SET_PLAYBACK_INPUT = "SET_PLAYBACK_INPUT",
	GO_TO_ACTIVE = "GO_TO_ACTIVE",
	TOGGLE_OVERRIDE = "TOGGLE_OVERRIDE",
	TOGGLE_RECORDING_QUANTIZATION = "TOGGLE_RECORDING_QUANTIZATION",
	ADD_PATTERN = "ADD_PATTERN",
	CHANGE_TRACK_LENGTH = "CHANGE_TRACK_LENGTH",
	SET_NOTE_LENGTH = "SET_NOTE_LENGTH",
	DELETE_EVENTS = "DELTE_EVENTS",
	SELECT_STEP = "SELECT_STEP",
	CHANGE_PATTERN_LENGTH = "CHANGE_PATTERN_LENGTH",
	SELECT_PATTERN = "SELECT_PATTERN",
	CHANGE_PAGE = "CHANGE_PAGE",
	SET_OFFSET = "SET_OFFSET",
	SET_NOTE = "SET_NOTE",
	SET_PATTERN_NOTE_LENGTH = "SET_PATTERN_NOTE_LENGTH",
	SET_VELOCITY = "SET_VELOCITY",
	PARAMETER_LOCK = "PARAMETER_LOCK",
	ADD_INSTRUMENT_TO_SEQUENCER = "ADD_INSTRUMENT_TO_SEQUENCER",
	REMOVE_INSTRUMENT_FROM_SEQUENCER = "REMOVE_INSTRUMENT_FROM_SEQUENCER",
}

export interface trackSeqData {
	length: number;
	noteLength: string | number;
	triggState: Tone.Part;
	events: any[];
	page: number;
	selected: number[];
}

export type Pattern = {
	name: string;
	patternLength: number;
	tracks: trackSeqData[];
};

export interface Sequencer {
	patterns: {
		[key: number]: Pattern;
	};
	activePattern: number;
	step: number | undefined;
	followSchedulerID: number | undefined;
	stepFollowerdID: number | undefined;
	counter: number;
	override: boolean;
	quantizeRecording: boolean;
}

export interface removePatternAction {
	type: sequencerActions.REMOVE_PATTERN;
	payload: {
		patternKey: number;
	};
}

export interface setNoteLengthPlaybackAction {
	type: sequencerActions.SET_NOTE_LENGTH_PLAYBACK;
	payload: {
		note: string;
		pattern: number;
		track: number;
		step: number;
		noteLength: number | string;
	};
}

export interface setPlaybackInputAction {
	type: sequencerActions.SET_PLAYBACK_INPUT;
	payload: {
		pattern: number;
		track: number;
		step: number;
		offset: number;
		note: string;
		velocity: number;
	};
}

export interface goToActiveAction {
	type: sequencerActions.GO_TO_ACTIVE;
	payload: {
		pageToGo: number | undefined;
		patternToGo: number | undefined;
		track: number;
	};
}

export interface toggleOverrideAction {
	type: sequencerActions.TOGGLE_OVERRIDE;
}

export interface toggleRecordingQuantizationAction {
	type: sequencerActions.TOGGLE_RECORDING_QUANTIZATION;
}

export interface addPatternAction {
	type: sequencerActions.ADD_PATTERN;
	payload: {
		trackCount: number;
	};
}

export interface changeTrackLengthAction {
	type: sequencerActions.CHANGE_TRACK_LENGTH;
	payload: {
		pattern: number;
		track: number;
		patternLength: number;
	};
}

export interface setNoteLengthAction {
	type: sequencerActions.SET_NOTE_LENGTH;
	payload: {
		pattern: number;
		track: number;
		step: number[];
		noteLength: number | string;
	};
}

export interface deleteEventsAction {
	type: sequencerActions.DELETE_EVENTS;
	payload: {
		pattern: number;
		track: number;
	};
}

export interface selectStepAction {
	type: sequencerActions.SELECT_STEP;
	payload: {
		pattern: number;
		track: number;
		step: number;
	};
}

export interface changePatternLengthAction {
	type: sequencerActions.CHANGE_PATTERN_LENGTH;
	payload: {
		pattern: number;
		patternLength: number;
	};
}

export interface selectPatternAction {
	type: sequencerActions.SELECT_PATTERN;
	payload: {
		pattern: number;
	};
}

export interface changePageAction {
	type: sequencerActions.CHANGE_PAGE;
	payload: {
		track: number;
		pattern: number;
		page: number;
	};
}

export interface setOffsetAction {
	type: sequencerActions.SET_OFFSET;
	payload: {
		pattern: number;
		track: number;
		step: number[];
		offset: number;
	};
}

export interface setNoteAction {
	type: sequencerActions.SET_NOTE;
	payload: {
		pattern: number;
		track: number;
		step: number[];
		note: string[];
	};
}

export interface setPatternNoteLengthAction {
	type: sequencerActions.SET_PATTERN_NOTE_LENGTH;
	payload: {
		pattern: number;
		noteLength: number | string;
		track: number;
	};
}

export interface setVelocityAction {
	type: sequencerActions.SET_VELOCITY;
	payload: {
		pattern: number;
		track: number;
		step: number[];
		velocity: number;
	};
}

export interface parameterLockAction {
	type: sequencerActions.PARAMETER_LOCK;
	payload: {
		pattern: number;
		track: number;
		step: number[];
		data: LockData;
	};
}

export interface addInstrumentToSequencerAction {
	type: sequencerActions.ADD_INSTRUMENT_TO_SEQUENCER;
}

export interface removeInstrumentFromSequencerAction {
	type: sequencerActions.REMOVE_INSTRUMENT_FROM_SEQUENCER;
	payload: {
		index: number;
	};
}

export type sequencerActionTypes =
	| addPatternAction
	| changePageAction
	| changePatternLengthAction
	| changeTrackLengthAction
	| deleteEventsAction
	| goToActiveAction
	| parameterLockAction
	| removePatternAction
	| selectPatternAction
	| selectStepAction
	| setNoteAction
	| setNoteLengthAction
	| setNoteLengthPlaybackAction
	| setOffsetAction
	| setPatternNoteLengthAction
	| setPlaybackInputAction
	| setVelocityAction
	| toggleOverrideAction
	| toggleRecordingQuantizationAction
	| addInstrumentToSequencerAction
	| removeInstrumentFromSequencerAction;
