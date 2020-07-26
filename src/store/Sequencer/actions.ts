import { sequencerActions, sequencerActionTypes, pLockType } from "./types";

export function removePattern(patternKey: number): sequencerActionTypes {
	return {
		type: sequencerActions.REMOVE_PATTERN,
		payload: {
			patternKey: patternKey,
		},
	};
}

export function setNoteLengthPlayback(
	note: string,
	pattern: number,
	track: number,
	step: number,
	noteLength: number | string
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_NOTE_LENGTH_PLAYBACK,
		payload: {
			noteLength: noteLength,
			note: note,
			pattern: pattern,
			step: step,
			track: track,
		},
	};
}

export function setPlaybackInput(
	pattern: number,
	track: number,
	step: number,
	offset: number,
	note: string,
	velocity: number
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_PLAYBACK_INPUT,
		payload: {
			note: note,
			pattern: pattern,
			track: track,
			offset: offset,
			step: step,
			velocity: velocity,
		},
	};
}

export function goToActive(
	pageToGo: number | undefined,
	track: number,
	patternToGo: number | undefined
): sequencerActionTypes {
	return {
		type: sequencerActions.GO_TO_ACTIVE,
		payload: {
			pageToGo: pageToGo,
			patternToGo: patternToGo,
			track: track,
		},
	};
}

export function toggleOverride(): sequencerActionTypes {
	return {
		type: sequencerActions.TOGGLE_OVERRIDE,
	};
}

export function toggleRecordingQuantization(): sequencerActionTypes {
	return {
		type: sequencerActions.TOGGLE_RECORDING_QUANTIZATION,
	};
}

export function addPattern(trackCount: number): sequencerActionTypes {
	return {
		type: sequencerActions.ADD_PATTERN,
		payload: {
			trackCount: trackCount,
		},
	};
}

export function changeTrackLength(
	pattern: number,
	track: number,
	patternLength: number
): sequencerActionTypes {
	return {
		type: sequencerActions.CHANGE_TRACK_LENGTH,
		payload: {
			patternLength: patternLength,
			pattern: pattern,
			track: track,
		},
	};
}

export function addInstrumentToSequencer(): sequencerActionTypes {
	return {
		type: sequencerActions.ADD_INSTRUMENT_TO_SEQUENCER,
	};
}

export function removeInstrumentFromSequencer(
	index: number
): sequencerActionTypes {
	return {
		type: sequencerActions.REMOVE_INSTRUMENT_FROM_SEQUENCER,
		payload: {
			index: index,
		},
	};
}

export function setNoteLength(
	pattern: number,
	track: number,
	noteLength: number | string,
	step: number[]
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_NOTE_LENGTH,
		payload: {
			noteLength: noteLength,
			step: step,
			pattern: pattern,
			track: track,
		},
	};
}

export function deleteEvents(
	pattern: number,
	track: number
): sequencerActionTypes {
	return {
		type: sequencerActions.DELETE_EVENTS,
		payload: {
			pattern: pattern,
			track: track,
		},
	};
}

export function selectStep(
	pattern: number,
	track: number,
	step: number
): sequencerActionTypes {
	return {
		type: sequencerActions.SELECT_STEP,
		payload: {
			pattern: pattern,
			step: step,
			track: track,
		},
	};
}

export function changePatternLength(
	pattern: number,
	patternLength: number
): sequencerActionTypes {
	return {
		type: sequencerActions.CHANGE_PATTERN_LENGTH,
		payload: {
			patternLength: patternLength,
			pattern: pattern,
		},
	};
}

export function selectPattern(pattern: number): sequencerActionTypes {
	return {
		type: sequencerActions.SELECT_PATTERN,
		payload: {
			pattern,
		},
	};
}

export function changePage(
	pattern: number,
	track: number,
	page: number
): sequencerActionTypes {
	return {
		type: sequencerActions.CHANGE_PAGE,
		payload: {
			page: page,
			pattern: pattern,
			track: track,
		},
	};
}

export function setOffset(
	pattern: number,
	track: number,
	step: number[],
	offset: number
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_OFFSET,
		payload: {
			offset: offset,
			pattern: pattern,
			step: step,
			track: track,
		},
	};
}

export function setNote(
	pattern: number,
	track: number,
	note: string[],
	step: number[]
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_NOTE,
		payload: {
			note: note,
			pattern: pattern,
			step: step,
			track: track,
		},
	};
}

export function setPatternNoteLength(
	pattern: number,
	noteLength: number | string,
	track: number,
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_PATTERN_NOTE_LENGTH,
		payload: {
			noteLength: noteLength,
			pattern: pattern,
			track: track,
		},
	};
}

export function setVelocity(
	pattern: number,
	track: number,
	step: number[],
	velocity: number
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_VELOCITY,
		payload: {
			pattern: pattern,
			step: step,
			track: track,
			velocity: velocity,
		},
	};
}

export function parameterLock(
	pattern: number,
	track: number,
	step: number[],
	data: pLockType,
	parameter: string
): sequencerActionTypes {
	return {
		type: sequencerActions.PARAMETER_LOCK,
		payload: {
			data: {
				parameter: parameter,
				value: data,
			},
			pattern: pattern,
			step: step,
			track: track,
		},
	};
}
