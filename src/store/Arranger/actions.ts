import { arrangerActionTypes, arrangerMode, arrangerActions } from "./types";

export function toggleMode(): arrangerActionTypes {
	return {
		type: arrangerActions.TOGGLE_MODE,
	}
}

export function removePatternArranger(index: number): arrangerActionTypes {
	return {
		type: arrangerActions.REMOVE_PATTERN,
		payload: {
			index: index,
		},
	};
}

export function setMode(mode: arrangerMode): arrangerActionTypes {
	return {
		type: arrangerActions.SET_MODE,
		payload: {
			arrangerMode: mode,
		},
	};
}

export function setTracker(tracker: number[]): arrangerActionTypes {
	return {
		type: arrangerActions.SET_TRACKER,
		payload: {
			tracker: tracker,
		}
	}
}

export function prependRow(): arrangerActionTypes {
	return {
		type: arrangerActions.PREPEND_ROW,
	};
}

export function addRow(index: number): arrangerActionTypes {
	return {
		type: arrangerActions.ADD_ROW,
		payload: {
			index: index,
		},
	};
}

export function swapEvents(
	song: number,
	from: number,
	to: number
): arrangerActionTypes {
	return {
		type: arrangerActions.SWAP_EVENTS,
		payload: {
			from: from,
			song: song,
			to: to,
		}
	}
}

export function selectSong(songIndex: number): arrangerActionTypes {
	return {
		type: arrangerActions.SELECT_SONG,
		payload: {
			song: songIndex,
		},
	};
}

export function setMute(
	mutes: number[],
	eventIndex: number
): arrangerActionTypes {
	return {
		type: arrangerActions.SET_MUTE,
		payload: {
			eventIndex: eventIndex,
			mutes: mutes,
		},
	};
}

export function setFollow(follow: boolean): arrangerActionTypes {
	return {
		type: arrangerActions.SET_FOLLOW,
		payload: {
			follow,
		},
	};
}

export function addSong(initPatt: number): arrangerActionTypes {
	return {
		type: arrangerActions.ADD_SONG,
		payload: {
			initPatt: initPatt,
		}
	};
}

export function removeSong(songIndex: number, nextSong: number): arrangerActionTypes {
	return {
		type: arrangerActions.REMOVE_SONG,
		payload: {
			songId: songIndex,
			nextSong: nextSong,
		},
	};
}

export function renameSong(
	song: number,
	name: string
): arrangerActionTypes {
	return {
		type: arrangerActions.RENAME_SONG,
		payload: {
			song: song,
			name: name,
		}
	}
};

export function increaseDecreaseRepeat(
	song: number,
	eventIndex: number,
	amount: number
): arrangerActionTypes {
	return {
		type: arrangerActions.INC_DEC_REPEAT,
		payload: {
			amount: amount,
			song: song,
			eventIndex: eventIndex
		}
	}
}

export function setPattern(
	pattern: number,
	eventIndex: number
): arrangerActionTypes {
	return {
		type: arrangerActions.SET_PATTERN,
		payload: {
			eventIndex: eventIndex,
			pattern: pattern,
		},
	};
}

export function setRepeat(
	repeat: number,
	eventIndex: number
): arrangerActionTypes {
	return {
		type: arrangerActions.SET_REPEAT,
		payload: {
			eventIndex: eventIndex,
			repeat: repeat,
		},
	};
}

export function setTimer(timer: (string | number)[], song: number): arrangerActionTypes {
	return {
		type: arrangerActions.SET_TIMER,
		payload: {
			timer: timer,
			song: song
		}
	}
}

export function removeRow(rowIndex: number): arrangerActionTypes {
	return {
		type: arrangerActions.REMOVE_ROW,
		payload: {
			rowIndex: rowIndex,
		},
	};
}
