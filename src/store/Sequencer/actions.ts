import { sequencerActions, sequencerActionTypes, event } from "./types";
import { eventOptions, RecursivePartial } from '../../containers/Track/Instruments';
import { generalEffectOptions, trackActions } from "../Track";

export function selectStepsBatch(
	pattern: number,
	trackIndex: number,
	steps: number[]
): sequencerActionTypes {
	return {
		type: sequencerActions.SELECT_STEPS_BATCH,
		payload: {
			pattern: pattern,
			trackIndex: trackIndex,
			steps: steps
		}
	}
}

export function renamePattern(pattern: number, name: string): sequencerActionTypes {
	return {
		type: sequencerActions.RENAME_PATTERN,
		payload: {
			pattern: pattern,
			name: name,
		}
	}
}

export function deleteLocks(
	pattern: number,
	trackIndex: number,
	step: number,
): sequencerActionTypes {
	return {
		type: sequencerActions.DELETE_LOCKS,
		payload: {
			pattern: pattern,
			trackIndex: trackIndex,
			step: step,
		}
	}	
}

export function deleteNotes(
	pattern: number,
	trackIndex: number,
	step: number,
): sequencerActionTypes {
	return {
		type: sequencerActions.DELETE_NOTES,
		payload: {
			pattern: pattern,
			trackIndex: trackIndex,
			step: step,
		}
	}	
}


export function cycleSteps(
	direction: number,
	pattern: number, 
	trackIndex: number,
	interval: number[]
): sequencerActionTypes {
	return {
		type: sequencerActions.CYCLE_STEPS,
		payload: {
			direction: direction,
			pattern: pattern,
			trackIndex: trackIndex, 
			interval: interval,
		}
	}
}

export function incDecStepVelocity(
	amount: number,
	pattern: number,
	trackIndex: number,
	step: number
): sequencerActionTypes {
	return {
		type: sequencerActions.INC_DEC_VELOCITY,
		payload: {
			amount: amount,
			pattern: pattern,
			step: step,
			trackIndex: trackIndex,
		}
	}
}

export function incDecPTVelocity(
	amount: number,
	pattern: number,
	trackIndex: number,
): sequencerActionTypes {
	return {
		type: sequencerActions.INC_DEC_PT_VELOCITY,
		payload: {
			pattern: pattern,
			trackIndex: trackIndex,
			amount: amount,
		}
	}
}

export function incDecOffset(
	amount: number,
	pattern: number,
	trackIndex: number,
	step: number
): sequencerActionTypes {
	return {
		type: sequencerActions.INC_DEC_OFFSET,
		payload: {
			amount: amount,
			pattern: pattern,
			step: step,
			trackIndex: trackIndex,
		}
	}
}

export function incDecPatLength(amount: number, pattern: number): sequencerActionTypes {
	return {
		type: sequencerActions.INC_DEC_PAT_LENGTH,
		payload: {
			amount: amount,
			pattern: pattern
		}
	}
}


export function incDecTrackLength(amount: number, pattern: number, trackIndex: number): sequencerActionTypes {
	return {
		type: sequencerActions.INC_DEC_TRACK_LENGTH,
		payload: {
			trackIndex: trackIndex,
			amount: amount,
			pattern: pattern
		}
	}
}

export function removePattern(patternKey: number): sequencerActionTypes {
	return {
		type: sequencerActions.REMOVE_PATTERN,
		payload: {
			pattern: patternKey,
		},
	};
}

export function setNoteLengthPlayback(
	note: string,
	pattern: number,
	trackIndex: number,
	step: number,
	noteLength: number | string,
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_NOTE_LENGTH_PLAYBACK,
		payload: {
			noteLength: noteLength,
			note: note,
			pattern: pattern,
			step: step,
			trackIndex: trackIndex,
		},
	};
}

export function noteInput(
	pattern: number,
	trackIndex: number,
	step: number,
	offset: number,
	note: string,
	velocity: number
): sequencerActionTypes {
	return {
		type: sequencerActions.NOTE_INPUT,
		payload: {
			note: note,
			pattern: pattern,
			trackIndex: trackIndex,
			offset: offset,
			step: step,
			velocity: velocity,
		},
	};
}

export function setNoteMidi(
	trackIndex: number,
	note: string,
	velocity: number,
	step: number,
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_NOTE_MIDI,
		payload: {
			trackIndex: trackIndex,
			velocity: velocity,
			step: step,
			note: note,
		}
	}
};

export function changePatternName(
	pattern: number,
	name: string
): sequencerActionTypes {
	return {
		type: sequencerActions.CHANGE_PATTERN_NAME,
		payload: {
			pattern: pattern,
			name: name
		}
	}
};

export function goToActive(
	pageToGo: number | undefined,
	trackIndex: number,
	patternToGo: number | undefined
): sequencerActionTypes {
	return {
		type: sequencerActions.GO_TO_ACTIVE,
		payload: {
			pageToGo: pageToGo,
			patternToGo: patternToGo,
			trackIndex: trackIndex,
		},
	};
}

export function toggleOverride(): sequencerActionTypes {
	return {
		type: sequencerActions.TOGGLE_OVERRIDE,
	};
};

export function toggleRecordingQuantization(): sequencerActionTypes {
	return {
		type: sequencerActions.TOGGLE_RECORDING_QUANTIZATION,
	};
};

export function addPattern(): sequencerActionTypes {
	return {
		type: sequencerActions.ADD_PATTERN,
	};
};

export function addEffectSequencer(index: number, trackIndex: number): sequencerActionTypes {
	return {
		type: sequencerActions.ADD_EFFECT_SEQUENCER,
		payload: {
			fxIndex: index,
			trackIndex: trackIndex
		}
	}
};

export function removeEffectSequencer(index: number, trackIndex: number): sequencerActionTypes {
	return {
		type: sequencerActions.REMOVE_EFFECT_SEQUENCER,
		payload: {
			fxIndex: index,
			trackIndex: trackIndex,
		}
	}
};

export function changeEffectIndexSequencer(
	fxIndex: number, 
	trackIndex: number
): sequencerActionTypes {
	return {
		type: sequencerActions.REMOVE_EFFECT_SEQUENCER,
		payload: {
			fxIndex: fxIndex,
			trackIndex: trackIndex,
		}
	}
};

export function removePropertyLock(
	trackIndex: number,
	pattern: number, 
	step: number,
	property: string,
): sequencerActionTypes {
	return {
		type: sequencerActions.REMOVE_PROPERTY_LOCK,
		payload: {
			pattern: pattern,
			property: property,
			step: step,
			trackIndex: trackIndex,
		}
	}
};

export function removeEffectPropertyLock(
	trackIndex: number,
	pattern: number, 
	step: number,
	property: string,
	fxIndex: number,
): sequencerActionTypes {
	return {
		type: sequencerActions.REMOVE_EFFECT_PROPERTY_LOCK,
		payload: {
			pattern: pattern,
			property: property,
			step: step,
			trackIndex: trackIndex,
			fxIndex: fxIndex,
		}
	}
}

export function parameterLockEffect(pattern: number, trackIndex: number, step: number, fxIndex: number, data: any): sequencerActionTypes {
	return {
		type: sequencerActions.PARAMETER_LOCK_EFFECT,
		payload: {
			data: data,
			fxIndex: fxIndex,
			pattern: pattern,
			step: step,
			trackIndex: trackIndex
		}
	}
};


export function changeTrackLength(
	pattern: number,
	trackIndex: number,
	patternLength: number
): sequencerActionTypes {
	return {
		type: sequencerActions.CHANGE_TRACK_LENGTH,
		payload: {
			patternLength: patternLength,
			pattern: pattern,
			trackIndex: trackIndex,
		},
	};
}

export function addInstrumentToSequencer(trackIndex: number): sequencerActionTypes {
	return {
		type: sequencerActions.ADD_INSTRUMENT_TO_SEQUENCER,
		payload: {
			trackIndex: trackIndex,
		},
	};
}

export function removeInstrumentFromSequencer(
	trackIndex: number
): sequencerActionTypes {
	return {
		type: sequencerActions.REMOVE_INSTRUMENT_FROM_SEQUENCER,
		// type: trackActions.REMOVE_INSTRUMENT,
		payload: {
			trackIndex: trackIndex,
		},
	};
};

export function setNoteLength(
	pattern: number,
	trackIndex: number,
	noteLength: number | string,
	step: number
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_NOTE_LENGTH,
		payload: {
			noteLength: noteLength,
			step: step,
			pattern: pattern,
			trackIndex: trackIndex,
		},
	};
}

export function copyNotes(
	pattern: number,
	trackIndex: number,
	events?: event[]
): sequencerActionTypes {
	return {
		type: sequencerActions.COPY_NOTES,
		payload: {
			events: events,
			trackIndex: trackIndex,
			pattern: pattern,
		}
	}
}

export function copyEvents(
	pattern: number,
	trackIndex: number,
	events?: any[]
): sequencerActionTypes {
	return {
		type: sequencerActions.COPY_EVENTS,
		payload: {
			events: events,
			trackIndex: trackIndex,
			pattern: pattern,
		}
	}
}


export function deleteEvents(
	pattern: number,
	trackIndex: number,
	step: number,
): sequencerActionTypes {
	return {
		type: sequencerActions.DELETE_EVENTS,
		payload: {
			step: step,
			pattern: pattern,
			trackIndex: trackIndex,
		},
	};
}

export function selectStep(
	pattern: number,
	trackIndex: number,
	step: number
): sequencerActionTypes {
	return {
		type: sequencerActions.SELECT_STEP,
		payload: {
			pattern: pattern,
			step: step,
			trackIndex: trackIndex,
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

export function duplicatePattern(pattern: number): sequencerActionTypes {
	return {
		type: sequencerActions.DUPLICATE_PATTERN,
		payload: {
			pattern: pattern,
		}
	}
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
	trackIndex: number,
	page: number
): sequencerActionTypes {
	return {
		type: sequencerActions.CHANGE_PAGE,
		payload: {
			page: page,
			pattern: pattern,
			trackIndex: trackIndex,
		},
	};
}

export function setPatternTrackVelocity(
	pattern: number,
	trackIndex: number,
	velocity: number
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_PATTERN_TRACK_VELOCITY,
		payload: {
			pattern: pattern,
			trackIndex: trackIndex,
			velocity: velocity,
		}
	}
};

export function setOffset(
	pattern: number,
	trackIndex: number,
	step: number,
	offset: number
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_OFFSET,
		payload: {
			offset: offset,
			pattern: pattern,
			step: step,
			trackIndex: trackIndex,
		},
	};
}

export function setNote(
	pattern: number,
	trackIndex: number,
	note: string,
	step: number
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_NOTE,
		payload: {
			note: note,
			pattern: pattern,
			step: step,
			trackIndex: trackIndex,
		},
	};
}

export function setPatternNoteLength(
	pattern: number,
	noteLength: number | string | undefined,
	trackindex: number,
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_PATTERN_NOTE_LENGTH,
		payload: {
			noteLength: noteLength,
			pattern: pattern,
			trackIndex: trackindex,
		},
	};
}

export function parameterLockIncreaseDecrease(
	pattern: number,
	trackIndex: number,
	step: number,
	movement: number,
	property: string,
	trackValues: any[],
	cc?: boolean,
	isContinuous?: boolean,
): sequencerActionTypes {
	return {
		type: sequencerActions.PARAMETER_LOCK_INC_DEC,
		payload: {
			pattern: pattern,
			movement: movement,
			property: property,
			step: step,
			trackIndex: trackIndex,
			cc: cc,
			isContinuous: isContinuous,
			trackValues: trackValues,
		}
	}
};

export function parameterLockEffectIncreaseDecrease(
	pattern: number,
	trackIndex: number,
	step: number,
	fxIndex: number,
	movement: number,
	property: string,
	effectValues: any[],
	cc?: boolean,
	isContinuous?: boolean,
): sequencerActionTypes {
	return {
		type: sequencerActions.PARAMETER_LOCK_INC_DEC_EFFECT,
		payload: {
			pattern: pattern,
			movement: movement,
			property: property,
			step: step,
			trackIndex: trackIndex,
			fxIndex: fxIndex,
			cc: cc,
			isContinuous: isContinuous,
			effectValues: effectValues,
		}
	}
};

export function setVelocity(
	pattern: number,
	trackIndex: number,
	step: number,
	velocity: number
): sequencerActionTypes {
	return {
		type: sequencerActions.SET_VELOCITY,
		payload: {
			pattern: pattern,
			step: step,
			trackIndex: trackIndex,
			velocity: velocity,
		},
	};
}

export function parameterLock(
	pattern: number,
	trackIndex: number,
	step: number,
	data: any,
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
			trackIndex: trackIndex,
		},
	};
}
