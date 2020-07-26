export enum instrumentTypes {
	FMSYNTH = "FMSYNTH",
	DUOSYNTH = "DUOSYNTH",
	AMSYNTH = "AMSYNTH",
	MEMBRANESYNTH = "MEMBRANESYNTH",
	METALSYNTH = "METALSYNTH",
	NOISESYNTH = "NOISESYNTH",
	PLUCKSYNTH = "PLUCKSYNTH",
	SAMPLER = "SAMPLER",
	DRUMRACK = "DRUMRACK",
}

export enum effectTypes {
	AUTOFILTER = "AUTOFILTER",
	AUTOPANNER = "AUTOPANNER",
	AUTOWAH = "AUTOWAH",
	BITCRUSHER = "BITCRUSHER",
	CHEBYSHEV = "CHEBYSHEV",
	CHORUS = "CHORUS",
	CONVOLVER = "CONVOLVER",
	DISTORTION = "DISTORTION",
	EFFECT = "EFFECT",
	FEEDBACKDELAY = "FEEDBACKDELAY",
	FEEDBACKEFFECT = "FEEDBACKEFFECT",
	FREEVERB = "FREEVERB",
	JCREVERB = "JCREVERB",
	MIDSIDEEFFECT = "MIDSIDEEFFECT",
	PHASER = "PHASER",
	PINGPONGDELAY = "PINGPONGDELAY",
	PITCHSHIFT = "PITCHSHIFT",
	REVERB = "REVERB",
	STEREOEFFECT = "STEREOEFFECT",
	STEREOFEEDBACKEFFECT = "STEREOFEEDBACKEFFECT",
	STEREOWIDENER = "STEREOWIDENER",
	STEREOXFEEDBACKEFFECT = "STEREOXFEEDBACKEFFECT",
	TREMOLO = "TREMOLO",
	VIBRATO = "VIBRATO",
	COMPRESSOR = "COMPRESSOR",
	EQ3 = "EQ3",
	FILTER = "FILTER",
	LIMITER = "LIMITER",
	GATE = "GATE",
	MIDSIDECOMPRESSOR = "MIDISIDECOMPRESSOR",
	MONO = "MONO",
}

export interface midi {
	device: string | undefined;
	channel: number | "all" | undefined;
}

export interface instrumentInfo {
	instrument: instrumentTypes;
	id: number;
	midi: midi;
}

export interface effectsInfo {
	fx: effectTypes;
	id: number;
}

export interface trackInfo {
	instrument: instrumentTypes;
	id: number;
	midi: midi;
	fx: effectsInfo[];
	fxCounter: number;
}

export interface Track {
	tracks: trackInfo[];
	selectedTrack: number;
	trackCount: number;
	instrumentCounter: number;
}

export enum trackActions {
	CHANGE_INSTRUMENT = "CHANGE_INSTRUMENT",
	ADD_INSTRUMENT = "ADD_INSTRUMENT",
	REMOVE_INSTRUMENT = "REMOVE_INSTRUMENT",
	SHOW_INSTRUMENT = "SHOW_INSTRUMENT",
	SELECT_MIDI_DEVICE = "SELECT_MIDI_DEVICE",
	SELECT_MIDI_CHANNEL = "SELECT_MIDI_CHANNEL",
	INSERT_EFFECT = "INSERT_EFFECT",
	DELETE_EFFECT = "DELETE_EFFECT",
	CHANGE_EFFECT_INDEX = "CHANGE_EFFECT_INDEX",
}

export interface changeInstrumentAction {
	type: trackActions.CHANGE_INSTRUMENT;
	payload: {
		index: number;
		instrument: instrumentTypes;
	};
}

export interface addInstrumentAction {
	type: trackActions.ADD_INSTRUMENT;
	payload: {
		instrument: instrumentTypes;
	};
}

export interface removeInstrumentAction {
	type: trackActions.REMOVE_INSTRUMENT;
	payload: {
		index: number;
	};
}

export interface showInstrumentAction {
	type: trackActions.SHOW_INSTRUMENT;
	payload: {
		index: number;
	};
}

export interface selectMidiDeviceAction {
	type: trackActions.SELECT_MIDI_DEVICE;
	payload: {
		index: number;
		device: string;
	};
}

export interface selectMidiChannelAction {
	type: trackActions.SELECT_MIDI_CHANNEL;
	payload: {
		index: number;
		channel: number | "all";
	};
}

export interface insertEffectAction {
	type: trackActions.INSERT_EFFECT;
	payload: {
		index: number;
		trackIndex: number;
		effect: effectTypes;
	};
}

export interface deleteEffectAction {
	type: trackActions.DELETE_EFFECT;
	payload: {
		index: number;
		trackIndex: number;
	};
}

export interface changeEffectIndexAction {
	type: trackActions.CHANGE_EFFECT_INDEX;
	payload: {
		fromIndex: number;
		toIndex: number;
		trackIndex: number;
	};
}

export type trackActionTypes =
	| changeInstrumentAction
	| addInstrumentAction
	| removeInstrumentAction
	| showInstrumentAction
	| selectMidiDeviceAction
	| selectMidiChannelAction
	| insertEffectAction
	| deleteEffectAction
	| changeEffectIndexAction;
