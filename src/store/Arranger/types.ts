export enum arrangerMode {
	ARRANGER = "arranger",
	PATTERN = "pattern",
}

export interface songEvent {
	pattern: number;
	repeat: number;
	mute: number[];
	id: number;
}

export interface Song {
	name: string;
	events: songEvent[];
	counter: number;
	timer: (string | number)[];
}

export interface Arranger {
	mode: arrangerMode;
	following: boolean;
	selectedSong: number;
	counter: number;
	patternTracker: number[];
	songs: {
		[key: number]: Song;
	};
}

export enum arrangerActions {
	SET_MODE = "SET_MODE",
	PREPEND_ROW = "PREPEND_ROW",
	ADD_ROW = "ADD_ROW",
	SELECT_SONG = "SELECT_SONG",
	SET_MUTE = "SET_MUTE",
	SET_FOLLOW = "SET_FOLLOW",
	ADD_SONG = "ADD_SONG",
	REMOVE_SONG = "REMOVE_SONG",
	SET_PATTERN = "SET_PATTERN",
	SET_REPEAT = "SET_REPEAT",
	REMOVE_ROW = "REMOVE_ROW",
	REMOVE_PATTERN = "REMOVE_PATTERN",
	SET_TRACKER = "SET_TRACKER",
	SET_TIMER = "SET_TIMER",
	RENAME_SONG = "RENAME_SONG",
	INC_DEC_REPEAT = "INC_DEC_REPEAT"
}

export interface renameSongAction {
	type: arrangerActions.RENAME_SONG,
	payload: {
		song: number,
		name: string,
	}
}

export interface setTrackerAction {
	type: arrangerActions.SET_TRACKER,
	payload: {
		tracker: number[],
	}
}

export interface increaseDecreaseRepeatAction {
	type: arrangerActions.INC_DEC_REPEAT,
	payload: {
		song: number,
		eventIndex: number,
		amount: number,
	}
}

export interface setTimerAction {
	type: arrangerActions.SET_TIMER,
	payload: {
		timer: (number | string)[],
		song: number,
	}
}

export interface removePatternAction {
	type: arrangerActions.REMOVE_PATTERN;
	payload: {
		index: number;
	};
}

export interface setModeAction {
	type: arrangerActions.SET_MODE;
	payload: {
		arrangerMode: arrangerMode;
	};
}

export interface prependRowAction {
	type: arrangerActions.PREPEND_ROW;
}

export interface addRowAction {
	type: arrangerActions.ADD_ROW;
	payload: {
		index: number;
	};
}

export interface selectSongAction {
	type: arrangerActions.SELECT_SONG;
	payload: {
		song: number;
	};
}

export interface setMuteAction {
	type: arrangerActions.SET_MUTE;
	payload: {
		mutes: number[];
		eventIndex: number;
	};
}

export interface setFollowAction {
	type: arrangerActions.SET_FOLLOW;
	payload: {
		follow: boolean;
	};
}

export interface addSongAction {
	type: arrangerActions.ADD_SONG;
}

export interface removeSongAction {
	type: arrangerActions.REMOVE_SONG;
	payload: {
		songIndex: number;
	};
}

export interface setPatternAction {
	type: arrangerActions.SET_PATTERN;
	payload: {
		pattern: number;
		eventIndex: number;
	};
}

export interface setRepeatAction {
	type: arrangerActions.SET_REPEAT;
	payload: {
		eventIndex: number;
		repeat: number;
	};
}

export interface removeRowAction {
	type: arrangerActions.REMOVE_ROW;
	payload: {
		rowIndex: number;
	};
}

export type arrangerActionTypes =
	| addRowAction
	| addSongAction
	| prependRowAction
	| removeRowAction
	| removeSongAction
	| selectSongAction
	| setFollowAction
	| setModeAction
	| setMuteAction
	| setPatternAction
	| setRepeatAction
	| setTrackerAction
	| setTimerAction
	| increaseDecreaseRepeatAction
	| renameSongAction
	| removePatternAction;
