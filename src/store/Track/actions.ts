import { curveTypes } from "../../containers/Track/defaults";
import { effectsInitials } from "../../containers/Track/Instruments";
import {
	trackActions,
	trackActionTypes,
	xolombrisxInstruments,
	effectTypes,
	generalInstrumentOptions,
} from "./types";

export function updateEnvelopeCurve(
	track: number,
	target: 'envelope' | 'modulationEnvelope' | 'drumrack',
	curve: curveTypes,
	padIdx?: number,
): trackActionTypes {
	return {
		type: trackActions.UPDATE_ENVELOPE_CURVE,
		payload: {
			trackIndex: track,
			target: target,
			curve: curve,
			padIdx: padIdx,
		}
	}
};

export function increaseDecreaseInstrumentProperty(
	index: number,
	property: string,
	movement: number,
	cc?: boolean,
	isContinuous?: boolean
): trackActionTypes {
	return {
		type: trackActions.INC_DEC_INST_PROP,
		payload: {
			trackIndex: index,
			movement: movement,
			property: property,
			cc: cc,
			isContinuous: isContinuous
		}
	}
}

export function envelopeAttack(
	index: number,
	movement: number,
): trackActionTypes {
	return {
		type: trackActions.ENVELOPE_ATTACK,
		payload: {
			amount: movement,
			trackIndex: index
		}
	}
};

export function increaseDecreaseEffectProperty(
	track: number,
	fx: number,
	property: string,
	movement: number,
	cc?: boolean,
	isContinuous?: boolean
): trackActionTypes {
	return {
		type: trackActions.INC_DEC_EFFECT_PROP,
		payload: {
			trackIndex: track,
			fx: fx,
			movement: movement,
			property: property,
			cc: cc,
			isContinuous: isContinuous
		}
	}
}

export function updateInstrumentState(
	index: number,
	options: generalInstrumentOptions
): trackActionTypes {
	return {
		type: trackActions.UPDATE_INSTRUMENT_STATE,
		payload: {
			trackIndex: index,
			options: options
		}
	};
}

export function updateEffectState(
	trackIndex: number,
	options: effectsInitials,
	fxIndex: number,
): trackActionTypes {
	return {
		type: trackActions.UPDATE_EFFECT_STATE,
		payload: {
			fxIndex: fxIndex,
			trackIndex: trackIndex,
			options: options,
		}
	}
}

export function changeInstrument(
	index: number,
	instrument: xolombrisxInstruments
): trackActionTypes {
	return {
		type: trackActions.CHANGE_INSTRUMENT,
		payload: {
			instrument: instrument,
			trackIndex: index,
		},
	};
}
export function removeMidiDevice(device: string) {
	return {
		type: trackActions.REMOVE_MIDI_DEVICE,
		payload: {
			device: device,
		}
	}
};

export function addInstrument(instrument: xolombrisxInstruments): trackActionTypes {
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
			trackIndex: index,
		},
	};
}

export function selectTrack(index: number): trackActionTypes {
	return {
		type: trackActions.SELECT_INSTRUMENT,
		payload: {
			trackIndex: index,
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
			trackIndex: index,
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
			trackIndex: index,
			channel: channel,
		},
	};
}

export function addEffect(
	fxIndex: number,
	trackIndex: number,
	effect: effectTypes,
): trackActionTypes {
	return {
		type: trackActions.ADD_EFFECT,
		payload: {
			effect: effect,
			effectIndex: fxIndex,
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
			effectIndex: index,
			trackIndex: trackIndex,
		},
	};
}

export function changeEffect(
	effectIndex: number,
	trackIndex: number,
	effect: effectTypes,
): trackActionTypes {
	return {
		type: trackActions.CHANGE_EFFECT,
		payload: {
			effect: effect,
			effectIndex: effectIndex,
			trackIndex: trackIndex
		}
	}
};

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
