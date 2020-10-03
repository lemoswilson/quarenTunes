import { effectsInitials } from "../../containers/Track/Instruments";
import {
	trackActions,
	trackActionTypes,
	instrumentTypes,
	effectTypes,
	generalInstrumentOptions,
} from "./types";

export function updateInstrumentState(
	index: number,
	options: generalInstrumentOptions
): trackActionTypes {
	return {
		type: trackActions.UPDATE_INSTRUMENT_STATE,
		payload: {
			index: index,
			options: options
		}
	};
}

export function updateEffectState(
	track: number,
	options: effectsInitials,
	fxIndex: number,
): trackActionTypes {
	return {
		type: trackActions.UPDATE_EFFECT_STATE,
		payload: {
			fxIndex: fxIndex,
			track: track,
			options: options,
		}
	}
}

export function changeInstrument(
	index: number,
	instrument: instrumentTypes
): trackActionTypes {
	return {
		type: trackActions.CHANGE_INSTRUMENT,
		payload: {
			instrument: instrument,
			index: index,
		},
	};
}

export function addInstrument(instrument: instrumentTypes): trackActionTypes {
	return {
		type: trackActions.ADD_INSTRUMENT,
		payload: {
			instrument: instrument,
		},
	};
}

export function removeInstrument(index: number): trackActionTypes {
	return {
		type: trackActions.REMOVE_INSTRUMENT,
		payload: {
			index: index,
		},
	};
}

export function showInstrument(index: number): trackActionTypes {
	return {
		type: trackActions.SHOW_INSTRUMENT,
		payload: {
			index: index,
		},
	};
};

export function selectMidiDevice(
	index: number,
	device: string
): trackActionTypes {
	return {
		type: trackActions.SELECT_MIDI_DEVICE,
		payload: {
			index: index,
			device: device,
		},
	};
};

export function selectMidiChannel(
	index: number,
	channel: number | "all"
): trackActionTypes {
	return {
		type: trackActions.SELECT_MIDI_CHANNEL,
		payload: {
			index: index,
			channel: channel,
		},
	};
}

export function insertEffect(
	index: number,
	effect: effectTypes,
	trackIndex: number
): trackActionTypes {
	return {
		type: trackActions.INSERT_EFFECT,
		payload: {
			effect: effect,
			index: index,
			trackIndex: trackIndex,
		},
	};
}

export function deleteEffect(
	index: number,
	trackIndex: number
): trackActionTypes {
	return {
		type: trackActions.DELETE_EFFECT,
		payload: {
			index: index,
			trackIndex: trackIndex,
		},
	};
}

export function changeEffectIndex(
	fromIndex: number,
	toIndex: number,
	trackIndex: number
): trackActionTypes {
	return {
		type: trackActions.CHANGE_EFFECT_INDEX,
		payload: {
			fromIndex: fromIndex,
			toIndex: toIndex,
			trackIndex: trackIndex,
		},
	};
}
