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
	AutoFilter,
	DelayOptions,
	ChorusOptions,
	FilterOptions,
	PhaserOptions,
	AutoWahOptions,
	LimiterOptions,
	TremoloOptions,
	VibratoOptions,
	GateOptions,
	FreeverbOptions,
	JCReverbOptions,
	ChebyshevOptions,
	AutoFilterOptions,
	AutoPannerOptions,
	BiquadFilterOptions,
	StereoWidenerOptions,
	CompressorOptions,
	PingPongDelayOptions,
	PitchShiftOptions,
	BitCrusherOptions,
	DistortionOptions,

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
	FMSYNTH = "FMSynth",
	AMSYNTH = "AMSynth",
	MEMBRANESYNTH = "MembraneSynth",
	METALSYNTH = "MetalSynth",
	NOISESYNTH = "NoiseSynth",
	// PLUCKSYNTH = "PluckSynth",
	SAMPLER = "Sampler",
	DRUMRACK = "DrumRack",
}

export enum effectTypes {
	AUTOFILTER = "AutoFilter",
	AUTOPANNER = "AutoPan",
	// AUTOWAH = "AUTOWAH",
	BITCRUSHER = "BitCrusher",
	CHEBYSHEV = "Chebyshev",
	CHORUS = "Chorus",
	// CONVOLVER = "CONVOLVER",
	DISTORTION = "Distortion",
	// EFFECT = "EFFECT",
	FEEDBACKDELAY = "FeedDelay",
	// FEEDBACKEFFECT = "FEEDBACKEFFECT",
	FREEVERB = "FreeVerb",
	JCREVERB = "JCReverb",
	// MIDSIDEEFFECT = "MIDSIDEEFFECT",
	PHASER = "Phaser",
	PINGPONGDELAY = "PingPongDelay",
	PITCHSHIFT = "PitchShifter",
	FREQUENCYSHIFTER = 'FreqShifter',
	// REVERB = "REVERB",
	// STEREOEFFECT = "STEREOEFFECT",
	// STEREOFEEDBACKEFFECT = "STEREOFEEDBACKEFFECT",
	STEREOWIDENER = "StereoWidener",
	// STEREOXFEEDBACKEFFECT = "STEREOXFEEDBACKEFFECT",
	TREMOLO = "Tremolo",
	VIBRATO = "Vibrato",
	COMPRESSOR = "Compressor",
	EQ3 = "EQ3",
	FILTER = "Filter",
	LIMITER = "Limiter",
	GATE = "Gate",
	// MIDSIDECOMPRESSOR = "MIDISIDECOMPRESSOR",
	MULTIBANDCOMPRESSOR = 'MultiCompressor',
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
	options: any;
	name: string,
}

export interface trackInfo {
	instrument: xolombrisxInstruments;
	id: number;
	midi: midi;
	fx: effectsInfo[];
	fxCounter: number;
	options: any;
	env?: number,
	name: string,
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
	SELECT_INSTRUMENT = "SELECT_INSTRUMENT",
	SELECT_MIDI_DEVICE = "SELECT_MIDI_DEVICE",
	SELECT_MIDI_CHANNEL = "SELECT_MIDI_CHANNEL",
	RESET_DEVICE = "RESET_DEVICE",
	ADD_EFFECT = "INSERT_EFFECT",
	DELETE_EFFECT = "DELETE_EFFECT",
	CHANGE_EFFECT = "CHANGE_EFFECT",
	CHANGE_EFFECT_INDEX = "CHANGE_EFFECT_INDEX",
	UPDATE_INSTRUMENT_STATE = "UPDATE_INSTRUMENT_STATE",
	INC_DEC_INST_PROP = "INC_DEC_STATE_INST_PROP",
	INC_DEC_EFFECT_PROP = "INC_DEC_STATE_EFFECT_PROP",
	UPDATE_EFFECT_STATE = "UPDATE_EFFECT_STATE",
	ENVELOPE_ATTACK = "ENVELOPE_ATTACK",
	UPDATE_ENVELOPE_CURVE = "UPDATE_ENVELOPE_CURVE",
	REMOVE_MIDI_DEVICE = "REMOVE_MIDI_DEVICE",
	SET_SAMPLE = "SET_SAMPLE", 
	SET_OPTION_ARRAY = "SET_OPTION_ARRAY",
	SET_TRACK = "SET_TRACK",
	SET_NAME = "SET_NAME"
}

export interface resetDeviceAction {
	type: trackActions.RESET_DEVICE,
	payload: {
		trackIndex: number,
		fxIndex?: number,
	}
}

export interface setOptionArrayAction {
	type: trackActions.SET_OPTION_ARRAY,
	payload: {
		type: 'instrument' | 'effect',
		options: any,
		trackIndex: number,
		fxIndex?: number,
	}
}

export interface setNameAction {
	type: trackActions.SET_NAME,
	payload: {
		type: 'instrument' | 'effect',
		name: string,
		trackIndex: number,
		fxIndex?: number,
	}
}

export interface setTrackAction {
	type: trackActions.SET_TRACK,
	payload: {
		track: Track,
	}
}

export interface setSampleAction {
	type: trackActions.SET_SAMPLE,
	payload: {
		trackIndex: number,
		pad: number,
		sample: string,
	}
}

export interface removeMidiDeviceAction {
	type: trackActions.REMOVE_MIDI_DEVICE,
	payload: {
		device: string,
	}
};

export interface updateEnvelopeCurveAction {
	type: trackActions.UPDATE_ENVELOPE_CURVE,
	payload: {
		trackIndex: number,
		target: 'envelope' | 'modulationEnvelope' | 'drumrack',
		curve: curveTypes,
		padIdx?: number,
	}
};


export interface changeInstrumentAction {
	type: trackActions.CHANGE_INSTRUMENT;
	payload: {
		trackIndex: number;
		instrument: xolombrisxInstruments;
	};
}

export interface envelopeAttackAction {
	type: trackActions.ENVELOPE_ATTACK,
	payload: {
		trackIndex: number,
		amount: number,
	}
}

export interface updateEffectStateAction {
	type: trackActions.UPDATE_EFFECT_STATE,
	payload: {
		trackIndex: number,
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

export type generalEffectOptions = RecursivePartial<
	DelayOptions |
	ChorusOptions |
	FilterOptions |
	PhaserOptions |
	AutoWahOptions |
	LimiterOptions |
	TremoloOptions |
	VibratoOptions |
	GateOptions |
	FreeverbOptions |
	JCReverbOptions |
	ChebyshevOptions |
	AutoFilterOptions |
	AutoPannerOptions |
	BiquadFilterOptions |
	StereoWidenerOptions |
	CompressorOptions |
	PingPongDelayOptions |
	PitchShiftOptions |
	BitCrusherOptions |
	DistortionOptions>


export interface increaseDecreaseInstrumentPropertyAction {
	type: trackActions.INC_DEC_INST_PROP,
	payload: {
		trackIndex: number,
		property: string,
		movement: number,
		cc?: boolean,
		isContinuous?: boolean,
	}
}

export interface increaseDecreaseEffectPropertyAction {
	type: trackActions.INC_DEC_EFFECT_PROP,
	payload: {
		trackIndex: number,
		fxIndex: number,
		property: string,
		movement: number,
		cc?: boolean,
		isContinuous?: boolean,
	}
}

export interface updateInstrumentStateAction {
	type: trackActions.UPDATE_INSTRUMENT_STATE,
	payload: {
		trackIndex: number,
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
		trackIndex: number;
	};
}

export interface selectTrackAction {
	type: trackActions.SELECT_INSTRUMENT;
	payload: {
		trackIndex: number;
	};
}

export interface selectMidiDeviceAction {
	type: trackActions.SELECT_MIDI_DEVICE;
	payload: {
		trackIndex: number;
		device: string;
	};
}

export interface selectMidiChannelAction {
	type: trackActions.SELECT_MIDI_CHANNEL;
	payload: {
		trackIndex: number;
		channel: number | "all";
	};
}

export interface insertEffectAction {
	type: trackActions.ADD_EFFECT;
	payload: {
		effectIndex: number;
		trackIndex: number;
		effect: effectTypes;
	};
}

export interface changeEffectAction {
	type: trackActions.CHANGE_EFFECT,
	payload: {
		trackIndex: number,
		effect: effectTypes,
		effectIndex: number,
	}
}

export interface deleteEffectAction {
	type: trackActions.DELETE_EFFECT;
	payload: {
		effectIndex: number;
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
	| selectTrackAction
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
	| removeMidiDeviceAction
	| setSampleAction
	| setTrackAction
	| setNameAction
	| setOptionArrayAction
	| resetDeviceAction
	| changeEffectIndexAction;
