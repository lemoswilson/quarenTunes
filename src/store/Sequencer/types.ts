import { effectsInitials, eventOptions } from "../../containers/Track/Instruments";
import Tone from "../../lib/tone";
import { RecursivePartial } from '../../containers/Track/Instruments'
import { Part } from "tone";

export type pLockType = number | string | boolean | Tone.TimeClass;

export enum sequencerActions {
	REMOVE_PATTERN = "REMOVE_PATTERN",
	SET_NOTE_LENGTH_PLAYBACK = "SET_NOTE_LENGTH_PLAYBACK",
	NOTE_INPUT = "NOTE_INPUT",
	GO_TO_ACTIVE = "GO_TO_ACTIVE",
	TOGGLE_OVERRIDE = "TOGGLE_OVERRIDE",
	TOGGLE_RECORDING_QUANTIZATION = "TOGGLE_RECORDING_QUANTIZATION",
	RENAME_PATTERN = "RENAME_PATTERN",
	DUPLICATE_PATTERN = "DUPLICATE_PATTERN",
	ADD_PATTERN = "ADD_PATTERN",
	CHANGE_TRACK_LENGTH = "CHANGE_TRACK_LENGTH",
	INC_DEC_TRACK_LENGTH = "INC_DEC_TRACK_LENGTH",
	INC_DEC_VELOCITY = "INC_DEC_VELOCITY",
	INC_DEC_OFFSET = "INC_DEC_OFFSET",
	SET_NOTE_LENGTH = "SET_NOTE_LENGTH",
	DELETE_EVENTS = "DELTE_EVENTS",
	SELECT_STEP = "SELECT_STEP",
	CHANGE_PATTERN_LENGTH = "CHANGE_PATTERN_LENGTH",
	INC_DEC_PAT_LENGTH = "INC_DEC_PAT_LENGTH",
	SELECT_PATTERN = "SELECT_PATTERN",
	CHANGE_PAGE = "CHANGE_PAGE",
	CHANGE_PATTERN_NAME = "CHANGE_PATTERN_NAME",
	SET_OFFSET = "SET_OFFSET",
	SET_NOTE = "SET_NOTE",
	SET_NOTE_MIDI = "SET_NOTE_MIDI",
	SET_PATTERN_NOTE_LENGTH = "SET_PATTERN_NOTE_LENGTH",
	SET_VELOCITY = "SET_VELOCITY",
	PARAMETER_LOCK = "PARAMETER_LOCK",
	ADD_INSTRUMENT_TO_SEQUENCER = "ADD_INSTRUMENT_TO_SEQUENCER",
	REMOVE_INSTRUMENT_FROM_SEQUENCER = "REMOVE_INSTRUMENT_FROM_SEQUENCER",
	SET_PATTERN_TRACK_VELOCITY = "SET_PATTERN_TRACK_VELOCITY",
	ADD_EFFECT_SEQUENCER = "ADD_EFFECT_SEQUENCER",
	REMOVE_EFFECT_SEQUENCER = "REMOVE_EFFECT_SEQUENCER",
	CHANGE_EFFECT_INDEX = "CHANGE_EFFECT_INDEX",
	PARAMETER_LOCK_EFFECT = "PARAMETER_LOCK_EFFECT",
};

export type fxOptions = effectsInitials;

export interface event {
	instrument: RecursivePartial<eventOptions>,
	fx: fxOptions[],
	offset: number,
}

export interface trackSeqData {
	length: number;
	velocity: number;
	noteLength: string | number;
	// events: RecursivePartial<eventOptions>[];
	events: event[];
	page: number;
	selected: number[];
};

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
	counter: number;
	override: boolean;
	quantizeRecording: boolean;
};

export interface renamePatternAction {
	type: sequencerActions.RENAME_PATTERN,
	payload: {
		pattern: number,
		name: string,
	}
}

export interface increaseDecreaseVelocityAction {
	type: sequencerActions.INC_DEC_VELOCITY,
	payload: {
		pattern: number,
		track: number,
		step: number,
		amount: number,
	}
}

export interface increaseDecreaseOffsetAction {
	type: sequencerActions.INC_DEC_OFFSET,
	payload: {
		pattern: number,
		track: number,
		step: number,
		amount: number,
	}
}

export interface increaseDecreaesePatternLengthAction {
	type: sequencerActions.INC_DEC_PAT_LENGTH,
	payload: {
		pattern: number,
		amount: number,
	}
}

export interface increaseDecreaeseTrackLengthAction {
	type: sequencerActions.INC_DEC_TRACK_LENGTH,
	payload: {
		pattern: number,
		track: number,
		amount: number,
	}
}

export interface setPatternTrackVelocityAction {
	type: sequencerActions.SET_PATTERN_TRACK_VELOCITY,
	payload: {
		pattern: number,
		track: number,
		velocity: number,
	}
};

export interface addEffectAction {
	type: sequencerActions.ADD_EFFECT_SEQUENCER,
	payload: {
		track: number,
		index: number,
	}
};

export interface removeEffectAction {
	type: sequencerActions.REMOVE_EFFECT_SEQUENCER,
	payload: {
		track: number,
		index: number
	}
};

export interface changeEffectIndexAction {
	type: sequencerActions.CHANGE_EFFECT_INDEX,
	payload: {
		track: number,
		from: number,
		to: number,
	}
};

export interface changePatternNameAction {
	type: sequencerActions.CHANGE_PATTERN_NAME;
	payload: {
		name: string,
		pattern: number,
	}
};

export interface removePatternAction {
	type: sequencerActions.REMOVE_PATTERN;
	payload: {
		patternKey: number;
	};
};

export interface parameterLockEffectAction {
	type: sequencerActions.PARAMETER_LOCK_EFFECT,
	payload: {
		pattern: number,
		track: number,
		fxIndex: number,
		step: number,
		data: any
	}
};

export interface setNoteLengthPlaybackAction {
	type: sequencerActions.SET_NOTE_LENGTH_PLAYBACK;
	payload: {
		note: string;
		pattern: number;
		track: number;
		step: number;
		noteLength: number | string;
	};
};

export interface setNoteMidiAction {
	type: sequencerActions.SET_NOTE_MIDI;
	payload: {
		note: string | string[];
		step: number;
		track: number;
		velocity: number;
	}
};

export interface noteInputAction {
	type: sequencerActions.NOTE_INPUT;
	payload: {
		pattern: number;
		track: number;
		step: number;
		offset: number;
		note: string;
		velocity: number;
	};
};

export interface goToActiveAction {
	type: sequencerActions.GO_TO_ACTIVE;
	payload: {
		pageToGo: number | undefined;
		patternToGo: number | undefined;
		track: number;
	};
};

export interface toggleOverrideAction {
	type: sequencerActions.TOGGLE_OVERRIDE;
};

export interface toggleRecordingQuantizationAction {
	type: sequencerActions.TOGGLE_RECORDING_QUANTIZATION;
};

export interface addPatternAction {
	type: sequencerActions.ADD_PATTERN;
}

export interface changeTrackLengthAction {
	type: sequencerActions.CHANGE_TRACK_LENGTH;
	payload: {
		pattern: number;
		track: number;
		patternLength: number;
	};
};

// export interface setPlaybackInputAction {
// 	type: 
// }

export interface setNoteLengthAction {
	type: sequencerActions.SET_NOTE_LENGTH;
	payload: {
		pattern: number;
		track: number;
		step: number;
		noteLength: number | string;
	};
};

export interface deleteEventsAction {
	type: sequencerActions.DELETE_EVENTS;
	payload: {
		pattern: number;
		track: number;
		step: number;
	};
};

export interface selectStepAction {
	type: sequencerActions.SELECT_STEP;
	payload: {
		pattern: number;
		track: number;
		step: number;
	};
};

export interface changePatternLengthAction {
	type: sequencerActions.CHANGE_PATTERN_LENGTH;
	payload: {
		pattern: number;
		patternLength: number;
	};
};

export interface selectPatternAction {
	type: sequencerActions.SELECT_PATTERN;
	payload: {
		pattern: number;
	};
};

export interface changePageAction {
	type: sequencerActions.CHANGE_PAGE;
	payload: {
		track: number;
		pattern: number;
		page: number;
	};
};

export interface setOffsetAction {
	type: sequencerActions.SET_OFFSET;
	payload: {
		pattern: number;
		track: number;
		step: number;
		offset: number;
	};
};

export interface setNoteAction {
	type: sequencerActions.SET_NOTE;
	payload: {
		pattern: number;
		track: number;
		step: number;
		note: string;
	};
};

export interface setPatternNoteLengthAction {
	type: sequencerActions.SET_PATTERN_NOTE_LENGTH;
	payload: {
		pattern: number;
		noteLength: number | string;
		track: number;
	};
};

export interface setVelocityAction {
	type: sequencerActions.SET_VELOCITY;
	payload: {
		pattern: number;
		track: number;
		step: number;
		velocity: number;
	};
};

export interface parameterLockAction {
	type: sequencerActions.PARAMETER_LOCK;
	payload: {
		pattern: number;
		track: number;
		step: number;
		data: any;
	};
};

export interface duplicatePatternAction {
	type: sequencerActions.DUPLICATE_PATTERN;
	payload: {
		pattern: number,
	}
}

export interface addInstrumentToSequencerAction {
	type: sequencerActions.ADD_INSTRUMENT_TO_SEQUENCER;
};

export interface removeInstrumentFromSequencerAction {
	type: sequencerActions.REMOVE_INSTRUMENT_FROM_SEQUENCER;
	payload: {
		index: number;
	};
};

export type sequencerActionTypes =
	| addPatternAction
	| changePageAction
	| changePatternLengthAction
	| changeTrackLengthAction
	| deleteEventsAction
	| goToActiveAction
	| noteInputAction
	| parameterLockAction
	| removePatternAction
	| selectPatternAction
	| selectStepAction
	| setNoteAction
	| setNoteLengthAction
	| setNoteLengthPlaybackAction
	| setOffsetAction
	| setPatternNoteLengthAction
	| setVelocityAction
	| toggleOverrideAction
	| toggleRecordingQuantizationAction
	| parameterLockEffectAction
	| changePatternNameAction
	| addInstrumentToSequencerAction
	| setNoteMidiAction
	| duplicatePatternAction
	| setPatternTrackVelocityAction
	| addEffectAction
	| removeEffectAction
	| changeEffectIndexAction
	| increaseDecreaeseTrackLengthAction
	| increaseDecreaesePatternLengthAction
	| increaseDecreaseOffsetAction
	| increaseDecreaseVelocityAction
	| renamePatternAction
	| removeInstrumentFromSequencerAction;