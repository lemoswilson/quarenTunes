import { effectsInitials, effectsInitialsArray, initialsArray, RecursivePartial } from '../../containers/Track/Instruments/types';
import {
	AutoPanner,
	AutoWah,
	BitCrusher,
	Chebyshev,
	Chorus,
	Distortion,
	FeedbackDelay,
	Freeverb,
	FrequencyShifter,
	JCReverb,
	Phaser,
	PingPongDelay,
	PitchShift,
	Reverb,
	StereoWidener,
	Tremolo,
	Vibrato,
	Compressor,
	EQ3,
	Filter,
	LowpassCombFilter,
	Gain,
	Meter,
	Volume,
	Limiter,
	Delay,
	MultibandCompressor,
	MembraneSynth,
	MetalSynth,
	FMSynth,
	AMSynth,
	Synth,
	Sampler,
	NoiseSynth,
	PluckSynth,
	MembraneSynthOptions,
	MetalSynthOptions,
	FMSynthOptions,
	AMSynthOptions,
	SynthOptions,
	Gate,
	DuoSynthOptions,
	SamplerOptions,
	NoiseSynthOptions,
	PluckSynthOptions,
	AutoFilter
} from 'tone';
import { curveTypes } from '../../containers/Track/defaults';


export type toneEffects =
	AutoPanner |
	AutoFilter |
	AutoWah |
	BitCrusher |
	Chebyshev |
	Chorus |
	Distortion |
	FeedbackDelay |
	Freeverb |
	FrequencyShifter |
	JCReverb |
	Phaser |
	PingPongDelay |
	PitchShift |
	Reverb |
	StereoWidener |
	Tremolo |
	Vibrato |
	Compressor |
	EQ3 |
	Gain |
	Gate |
	Filter |
	LowpassCombFilter |
	Meter |
	Volume |
	Limiter |
	Delay |
	MultibandCompressor;

export type toneInstruments =
	Sampler
	| AMSynth
	| FMSynth
	| MetalSynth
	| MembraneSynth
	| Synth
	| NoiseSynth
	| PluckSynth

export type PolyInstruments = MembraneSynth | MetalSynth | FMSynth | AMSynth | Synth



export enum xolombrisxInstruments {
	FMSYNTH = "FMSYNTH",
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
	// AUTOWAH = "AUTOWAH",
	BITCRUSHER = "BITCRUSHER",
	CHEBYSHEV = "CHEBYSHEV",
	CHORUS = "CHORUS",
	// CONVOLVER = "CONVOLVER",
	DISTORTION = "DISTORTION",
	// EFFECT = "EFFECT",
	FEEDBACKDELAY = "FEEDBACKDELAY",
	// FEEDBACKEFFECT = "FEEDBACKEFFECT",
	FREEVERB = "FREEVERB",
	JCREVERB = "JCREVERB",
	// MIDSIDEEFFECT = "MIDSIDEEFFECT",
	PHASER = "PHASER",
	PINGPONGDELAY = "PINGPONGDELAY",
	PITCHSHIFT = "PITCHSHIFT",
	FREQUENCYSHIFTER = 'FREQUENCYSHIFTER',
	// REVERB = "REVERB",
	// STEREOEFFECT = "STEREOEFFECT",
	// STEREOFEEDBACKEFFECT = "STEREOFEEDBACKEFFECT",
	STEREOWIDENER = "STEREOWIDENER",
	// STEREOXFEEDBACKEFFECT = "STEREOXFEEDBACKEFFECT",
	TREMOLO = "TREMOLO",
	VIBRATO = "VIBRATO",
	COMPRESSOR = "COMPRESSOR",
	EQ3 = "EQ3",
	FILTER = "FILTER",
	LIMITER = "LIMITER",
	GATE = "GATE",
	// MIDSIDECOMPRESSOR = "MIDISIDECOMPRESSOR",
	MULTIBANDCOMPRESSOR = 'MULTIBANDCOMPRESSOR',
	MONO = "MONO",
}

export interface midi {
	device: string | undefined;
	channel: number | "all" | undefined;
}

// export interface instrumentInfo {
// 	instrument: instrumentTypes;
// 	id: number;
// 	midi: midi;
// }

export interface effectsInfo {
	fx: effectTypes;
	id: number;
	options: effectsInitialsArray;
}

export interface trackInfo {
	instrument: xolombrisxInstruments;
	id: number;
	midi: midi;
	fx: effectsInfo[];
	fxCounter: number;
	// options: any;
	// options: initialsArray;
	options: any;
	env?: number,
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
	CHANGE_EFFECT = "CHANGE_EFFECT",
	CHANGE_EFFECT_INDEX = "CHANGE_EFFECT_INDEX",
	UPDATE_INSTRUMENT_STATE = "UPDATE_INSTRUMENT_STATE",
	INC_DEC_INST_PROP = "INC_DEC_STATE_INST_PROP",
	INC_DEC_EFFECT_PROP = "INC_DEC_STATE__EFFECT_PROP",
	UPDATE_EFFECT_STATE = "UPDATE_EFFECT_STATE",
	ENVELOPE_ATTACK = "ENVELOPE_ATTACK",
	UPDATE_ENVELOPE_CURVE = "UPDATE_ENVELOPE_CURVE",
}

export interface updateEnvelopeCurveAction {
	type: trackActions.UPDATE_ENVELOPE_CURVE,
	payload: {
		track: number,
		target: 'envelope' | 'modulationEnvelope',
		curve: curveTypes,
	}
};


export interface changeInstrumentAction {
	type: trackActions.CHANGE_INSTRUMENT;
	payload: {
		index: number;
		instrument: xolombrisxInstruments;
	};
}

export interface envelopeAttackAction {
	type: trackActions.ENVELOPE_ATTACK,
	payload: {
		index: number,
		amount: number,
	}
}

export interface updateEffectStateAction {
	type: trackActions.UPDATE_EFFECT_STATE,
	payload: {
		track: number,
		fxIndex: number,
		options: effectsInitials,
	}
}

export type generalInstrumentOptions = RecursivePartial<MembraneSynthOptions |
	MetalSynthOptions |
	FMSynthOptions |
	AMSynthOptions |
	SynthOptions |
	DuoSynthOptions |
	SamplerOptions |
	NoiseSynthOptions |
	PluckSynthOptions
>

export interface increaseDecreaseInstrumentPropertyAction {
	type: trackActions.INC_DEC_INST_PROP,
	payload: {
		track: number,
		property: string,
		movement: number,
		cc?: boolean,
		isContinuous?: boolean,
	}
}

export interface increaseDecreaseEffectPropertyAction {
	type: trackActions.INC_DEC_EFFECT_PROP,
	payload: {
		track: number,
		fx: number,
		property: string,
		movement: number,
		cc?: boolean,
		isContinuous?: boolean,
	}
}

export interface updateInstrumentStateAction {
	type: trackActions.UPDATE_INSTRUMENT_STATE,
	payload: {
		track: number,
		options: generalInstrumentOptions,
	}
}

export interface addInstrumentAction {
	type: trackActions.ADD_INSTRUMENT;
	payload: {
		instrument: xolombrisxInstruments;
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

export interface changeEffectAction {
	type: trackActions.CHANGE_EFFECT,
	payload: {
		trackId: number,
		effect: effectTypes,
		effectIndex: number,
	}
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
	| changeEffectAction
	| updateEffectStateAction
	| updateInstrumentStateAction
	| increaseDecreaseEffectPropertyAction
	| increaseDecreaseInstrumentPropertyAction
	| envelopeAttackAction
	| updateEnvelopeCurveAction
	| changeEffectIndexAction;
