import DrumRack from "../../components/Layout/Instruments/DrumRack";
import { onlyValues } from "../../lib/objectDecompose";
import { range, startEndRange } from "../../lib/utility";
import { effectTypes, xolombrisxInstruments } from "../../store/Track";

export const trackMax = 4;
export const effectMax = 4;
export const widgetTabIndexTrkStart = 6

export enum indicators {
    KNOB = 'knob',
    STEPPED_KNOB = 'STEPPED_KNOB',
    VERTICAL_SLIDER = 'slider',
    DROPDOWN = 'dropdown',
    WAVEFORM = "WAVEFORM",
    CURVE_TYPE = "CURVE_TYPE"
}

export enum curveTypes {
    EXPONENTIAL = 'exponential',
    LINEAR = 'linear',
};



// Instruments options 
// format [defaultValue, [min, max], typeofHandler, extraInfo]
const noiseTypeIndicator = indicators.STEPPED_KNOB;
const attackNoiseIndicator = indicators.KNOB // exponential 
const volumeIndicator = indicators.VERTICAL_SLIDER; // exponential 
const detuneIndicator = indicators.KNOB; // linear  
const portamentoIndicator = indicators.KNOB; // exponential 
const harmonicityIndicator = indicators.VERTICAL_SLIDER; // exponential 
const oscillatorTypeIndicator = indicators.WAVEFORM;
const envelopeTimeIndicator = indicators.KNOB; // exponential 
const envelopeCurveIndicator = indicators.CURVE_TYPE;
const modulationIndicator = indicators.VERTICAL_SLIDER; // exponential
const frequencyIndicator = indicators.KNOB; // exponential 
const resonanceIndicator = indicators.KNOB; // exponential

export const volumeUnit = 'dB';
export const detuneUnit = 'c';
export const portamentoUnit = 's';
export const harmonicityUnit = '';
export const envelopeUnit = 's';
export const normalUnit = '';
const audioRangeUnit = '';
export const modulationUnit = '';
const membraneSynthOctaveRangeUnit = '';
const metalSynthOctaveRangeUnit = '';
const dampeningUnit = 'hz';
const attackNoiseUnit = '';

export const volumeRange = [-100, 6];
export const detuneRange = [-1200, 1200];
export const portamentoRange = [0.01, 3];
export const harmonicityRange = [0.1, 10];
export const envelopeTimeRange = [0.001, 10];
// export const compressorAttackRange = [0, 1];
const samplerEnvelopeTimeRange = [0, 3];
export const fadeRange = [0, 10];
export const normalRange = [0, 1];
const pluckResonanceRange = [0, 0.9999]
const audioRange = [0, 1];
export const modulationRange = [0.01, 100];
const membraneSynthOctaveRange = [0.5, 8];
const metalSynthOctaveRange = [0, 8]
const dampeningRange = [20, 7000];
const attackNoiseRange = [0.1, 20]
export const noiseTypeOptions = ['white', 'brown', 'pink']
const oscillatorTypeOptions = ['sine', 'pulse', 'sawtooth', 'triangle'];
const vibratoOscillatorTypeOptions = ['sine', 'square', 'sawtooth', 'triangle'];
const envelopeCurveOptions = [curveTypes.LINEAR, curveTypes.EXPONENTIAL];

// data that will be used to generate the indicators/selectors
// that will lay in the state of each track.
// envelopes

// const envelopeCreator = (time: number) => {
//     return [time, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]
// }

// const curveCreator = (type: 'exponential' | 'linear') => {
//     return [, envelopeCurveOptions, envelopeCurveIndicator]
// } 

const envelope = {
    attack: [0.01, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    attackCurve: [curveTypes.LINEAR, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    decay: [0.01, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    decayCurve: [curveTypes.LINEAR, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    release: [0.5, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    releaseCurve: [curveTypes.LINEAR, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    sustain: [1, normalRange, normalUnit, envelopeTimeIndicator, curveTypes.LINEAR]
};

const metalSynthEnvelope = {
    attackCurve: [curveTypes.LINEAR, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    decayCurve: [curveTypes.LINEAR, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    releaseCurve: [curveTypes.LINEAR, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    attack: [0.001, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    decay: [1.4, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    release: [0.2, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    sustain: [0, normalRange, normalUnit, envelopeTimeIndicator, curveTypes.LINEAR]
}

const membraneSynthEnvelope = {
    attackCurve: [curveTypes.EXPONENTIAL, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    decayCurve: [curveTypes.EXPONENTIAL, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    releaseCurve: [curveTypes.EXPONENTIAL, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    attack: [0.001, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    decay: [0.4, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    release: [1.4, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    sustain: [0.01, normalRange, envelopeUnit, envelopeTimeIndicator, curveTypes.LINEAR]
}

const modulationEnvelope = {
    attackCurve: [curveTypes.LINEAR, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    decayCurve: [curveTypes.LINEAR, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    releaseCurve: [curveTypes.LINEAR, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    attack: [0.5, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    decay: [0.01, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    release: [0.5, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    sustain: [1, normalRange, envelopeUnit, envelopeTimeIndicator, curveTypes.LINEAR]
};

const oscillator = {
    // partialCount: [0, 0, 8, 'dropdown', [1,2,3,4,5,6,7,8]],
    // partials: [],
    // phase: 0,
    width: [1, audioRange, audioRangeUnit, indicators.KNOB, curveTypes.LINEAR],
    type: ["sine", oscillatorTypeOptions, undefined, oscillatorTypeIndicator]
};

const modulation = {
    // partialCount: 0,
    // partials: [],
    // phase: 0,
    width: [1, audioRange, audioRangeUnit, indicators.KNOB, curveTypes.LINEAR],
    type: ["pulse", oscillatorTypeOptions, undefined, oscillatorTypeIndicator]
}

const noise = {
    fadeIn: [0, fadeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.LINEAR],
    fadeOut: [0, fadeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.LINEAR],
    playbackRate: [1, modulationRange, modulationUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    type: ['white', noiseTypeOptions, undefined, noiseTypeIndicator]
}

const volume = [0, volumeRange, volumeUnit, volumeIndicator, curveTypes.LINEAR];
const detune = [0, detuneRange, detuneUnit, detuneIndicator, curveTypes.LINEAR];
const portamento = [0, portamentoRange, portamentoUnit, portamentoIndicator, curveTypes.LINEAR];
const modSynthHarmonicity = [3, harmonicityRange, harmonicityUnit, harmonicityIndicator, curveTypes.LINEAR];
const metalSynthHarmonicity = [5.1, harmonicityRange, harmonicityUnit, harmonicityIndicator, curveTypes.LINEAR];
const modSynthModulationIndex = [10, modulationRange, modulationUnit, modulationIndicator, curveTypes.LINEAR];
const metalSynthModulationIndex = [32, modulationRange, modulationUnit, modulationIndicator, curveTypes.EXPONENTIAL];
export const membraneSynthOctaves = [10, membraneSynthOctaveRange, '', envelopeTimeIndicator, curveTypes.EXPONENTIAL];
export const membraneSynthPitchDecay = [1.4, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const metalSynthOctaves = [1.5, metalSynthOctaveRange, '', envelopeTimeIndicator, curveTypes.LINEAR];
const metalSynthResonance = [4000, dampeningRange, dampeningUnit, resonanceIndicator, curveTypes.EXPONENTIAL];
const attackNoise = [1, attackNoiseRange, attackNoiseUnit, attackNoiseIndicator, curveTypes.EXPONENTIAL];
const dampening = [4000, dampeningRange, dampeningUnit, frequencyIndicator, curveTypes.EXPONENTIAL];
const pluckResonance = [0.7, pluckResonanceRange, normalUnit, frequencyIndicator, curveTypes.LINEAR]
const pluckRelease = [1, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]
const samplerAttack = [0, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]
const curve = ['exponential', envelopeCurveOptions, envelopeCurveIndicator]
const samplerRelase = [0.1, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]

export function getInitialsValue(type: xolombrisxInstruments) {
    return onlyValues(getInitials(type))
}

export const DrumRackSlotInitials = {
    volume: volume,
    attack: [0, samplerEnvelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.LINEAR],
    baseUrl: [" "],
    curve: [curveTypes.EXPONENTIAL, envelopeCurveOptions, undefined, envelopeCurveIndicator],
    release: [0.1, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    urls: {
        C3: [''],
    },
    pitch: 0,
}

export function getInitials(type: xolombrisxInstruments) {
    switch (type) {
        case xolombrisxInstruments.AMSYNTH:
            return {
                volume: volume,
                detune: detune,
                portamento: portamento,
                harmonicity: modSynthHarmonicity,
                oscillator: oscillator, // oscillator.type
                envelope: envelope, // envelope.attack, decay, sustain, release, and curves
                modulation: modulation, // modulation.type
                modulationEnvelope: modulationEnvelope, // modulationEnvelope.attack, decay, sustain
            }
        // return AMSynthInitials
        case xolombrisxInstruments.FMSYNTH:
            return {
                volume: volume,
                detune: detune,
                portamento: portamento,
                harmonicity: modSynthHarmonicity,
                oscillator: oscillator, // oscillator.type
                envelope: envelope, // envelope.attack, decay, sustain, release, and curves
                modulation: modulation, // modulation.type
                modulationEnvelope: modulationEnvelope, // modulationEnvelope.attack, decay, sustain...
                modulationIndex: modSynthModulationIndex
            }
        // return FMSynthInitials
        case xolombrisxInstruments.MEMBRANESYNTH:
            return {
                volume: volume,
                detune: detune,
                portamento: portamento,
                envelope: membraneSynthEnvelope, // envelope.attack, decay, sustain, release, and curves
                oscillator: oscillator, // oscilator.type
                octaves: membraneSynthOctaves,
                pitchDecay: membraneSynthPitchDecay,
            }
        // return MembraneSynthInitials
        case xolombrisxInstruments.METALSYNTH:
            return {
                volume: volume,
                detune: detune,
                portamento: portamento,
                envelope: metalSynthEnvelope, // envelope.attack, decay, sustain, release, and curves
                harmonicity: metalSynthHarmonicity,
                modulationIndex: metalSynthModulationIndex,
                octaves: metalSynthOctaves,
                resonance: metalSynthResonance
            }
        // return MetalSynthInitials
        case xolombrisxInstruments.NOISESYNTH:
            return {
                volume: volume,
                envelope: envelope, // envelope.attack, decay, sustain, release, and curves
                noise: noise, //noise.fadeIn, fadeOut, playbackRate, type
            }
        // return NoiseSynthInitials
        // case xolombrisxInstruments.PLUCKSYNTH:
        //     return {
        //         volume: volume,
        //         attackNoise: attackNoise,
        //         dampening: dampening,
        //         resonance: pluckResonance,
        //         release: pluckRelease,
        //         // envelope: undefined,
        //     }
        // return PluckSynthInitials
        case xolombrisxInstruments.SAMPLER:
            return {
                volume: volume,
                attack: samplerAttack,
                baseUrl: " ",
                curve: curve,
                release: samplerRelase,
                urls: {},
            }
        case xolombrisxInstruments.DRUMRACK:
            const DrumRack: { [key: number]: typeof DrumRackSlotInitials } = {};
            [...Array(4).keys()].forEach(i => { DrumRack[i] = DrumRackSlotInitials })
            return {
                // drumRack: DrumRack
                // drumRack: {
                'PAD_0': DrumRackSlotInitials,
                'PAD_1': DrumRackSlotInitials,
                'PAD_2': DrumRackSlotInitials,
                'PAD_3': DrumRackSlotInitials
                // }
            }
        // return {
        //     volume: volume,
        //     attack: [0, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
        //     baseUrl: " ",
        //     curve: [curveTypes.EXPONENTIAL, envelopeCurveOptions, undefined, envelopeCurveIndicator],
        //     release: [0.1, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
        //     urls: {},
        //     // envelope: undefined,
        // }
        // const DrumRack: DrumRack = {};
        // [...Array(4).keys()].forEach(i => { DrumRack[i] = DrumRackSlotInitials })
        // return {
        //     drumRack: DrumRack
        // }

        default:
            return {}
    }
}

const drywetRange = normalRange
export const timeIndicator = (type: 'frequency' | 'subdivision' | 'ms' = 'subdivision') => {
    if (type === "frequency" || type === 'ms') return indicators.KNOB
    else return indicators.DROPDOWN
}
export const timeOptions = (type: 'frequency' | 'subdivision' | 'ms' = 'subdivision') => {
    if (type === "frequency") return frequencySpectrum
    else if (type === "ms") return delayTimeRange
    else return subdivisionOptions
};
export const timeUnit = (type: 'frequency' | 'subdivision' | 'ms' = 'subdivision') => {
    if (type === "frequency") return frequencyUnit
    else if (type === 'ms') return delayTimeUnit
    else return subdivisionUnit
};

const drywetIndicator = indicators.KNOB;
const octavesIndicator = indicators.KNOB;
const qIndicator = indicators.KNOB;
const rolloffIndicators = indicators.STEPPED_KNOB;
const bitIndicator = indicators.KNOB;
const filterTypeIndicator = indicators.STEPPED_KNOB;
const baseFrequnecyIndicator = indicators.KNOB;
const orderIndicator = indicators.KNOB;
const oversampleIndicator = indicators.STEPPED_KNOB;
const feedbackIndicator = indicators.KNOB;
const delayTimeIndicator = indicators.KNOB;
const spreadIndicator = indicators.KNOB;
const distortionIndicator = indicators.KNOB;
const roomSizeIndicator = indicators.KNOB;
const stageIndicator = indicators.STEPPED_KNOB;
const pitchIndicator = indicators.DROPDOWN;
const windowSizeIndicator = indicators.KNOB;
const widthIndicator = indicators.KNOB
const thresholdIndicator = indicators.KNOB;
const kneeIndicator = indicators.KNOB;
const eqGainIndicator = indicators.KNOB;


const drywetUnit = '%';
const frequencyUnit = 'hz';
const subdivisionUnit = '';
const octaveUnit = '';
const qUnit = '';
const bitUnit = '';
const orderUnit = '';
const feedbackUnit = '';
const delayTimeUnit = 'ms';
const spreadUnit = '°';
const distortionUnit = '';
const roomSizeUnit = '';
const stageUnit = '';
const pitchUnit = 'st';
const windowSizeUnit = 's';
const compressorTimeUnit = 's';
const ratioUnit = ':1';
const decibel = 'dB';

const feedbackRange = normalRange;
const delayTimeRange = [0, 10];
// const delayTimeRange = [0, 1];
const frequencySpectrum = [15, 22000];
const ocatvesRange = [1, 12];
const qRange = [0.1, 18];
const rolloffOptions = [-12, -24, -48, -96]
const FilterrolloffOptions = [-12, -24, -48]
const baseFrequencyRange = frequencySpectrum;
const bitRange = [1, 16]
const orderRange = [1, 100];
const spreadRange = [0, 360];
const stageRange = [1,2,3,4,5,6]
const pitchRange = startEndRange(-12, 12)
const windowSizeRange = [0.03, 0.1]
const ratioRange = [1, 20];
const thresholdRange = [-100, 0];
const kneeRange = [0, 40];
const gainRange = [-16, 16]

const oversampleOptions = ['2x', '4x', 'none'];
const filterTypeOptions = ["allpass", "bandpass", "highpass", "highshelf", "lowpass", "lowshelf", "notch", "peaking"]
export const subdivisionOptions = ["1m", "1n", "1n.", "2n", "2n.", "2t", "4n", "4n.", "4t", "8n", "8n.", "8t", "16n", "16n.", "16t", "32n", "32n.", "32t", "64n", "64n.", "64t"]

const wet = [1, drywetRange, drywetUnit, drywetIndicator, curveTypes.LINEAR];
const halfwet = [0.5, drywetIndicator, drywetUnit, drywetIndicator, curveTypes.LINEAR]
const oscillatorType = ['sine', oscillatorTypeOptions, undefined, oscillatorTypeIndicator];
const vibratoOscillatorType = ['sine', vibratoOscillatorTypeOptions, undefined, oscillatorTypeIndicator];
const effectsFrequency = [15, timeOptions('frequency'), timeUnit('frequency'), timeIndicator("frequency"), curveTypes.EXPONENTIAL, ['frequency', 'subdivision']];
const depth = [1, normalRange, normalUnit, frequencyIndicator, curveTypes.LINEAR];
const chorusDepth = [0.5, normalRange, normalUnit, frequencyIndicator, curveTypes.EXPONENTIAL];
const baseFrequency = [200, baseFrequencyRange, frequencyUnit, baseFrequnecyIndicator, curveTypes.EXPONENTIAL];
const phaserBaseFrequency = [350, baseFrequencyRange, frequencyUnit, baseFrequnecyIndicator, curveTypes.EXPONENTIAL];
const freqShifter = [0, baseFrequencyRange, frequencyUnit, baseFrequnecyIndicator, curveTypes.EXPONENTIAL];
const autoFilterOctaves = [2.6, ocatvesRange, octaveUnit, octavesIndicator, curveTypes.EXPONENTIAL];
const phaserOctaves = [3, ocatvesRange, octaveUnit, octavesIndicator, curveTypes.EXPONENTIAL];
const autoFilterQ = [1, qRange, qUnit, qIndicator, curveTypes.EXPONENTIAL];
const phaserQ = [10, qRange, qUnit, qIndicator, curveTypes.LINEAR]
const autoFilterRolloff = [-12, rolloffOptions, undefined, rolloffIndicators];
const filterRolloff = [-12, FilterrolloffOptions, undefined, rolloffIndicators];
const autoFilterType = ['lowpass', filterTypeOptions, undefined, filterTypeIndicator];
const bits = [4, bitRange, bitUnit, bitIndicator, curveTypes.LINEAR];
const order = [15, orderRange, orderUnit, orderIndicator, curveTypes.LINEAR];
const oversample = ['none', oversampleOptions, undefined, oversampleIndicator];
const chorusFeedback = [0, feedbackRange, feedbackUnit, feedbackIndicator, curveTypes.LINEAR];
const pitchShiftFeedback = [0, feedbackRange, feedbackUnit, feedbackIndicator, curveTypes.LINEAR];
const chorusFrequency = [4, timeOptions('frequency'), timeUnit('frequency'), timeIndicator('frequency'), curveTypes.EXPONENTIAL, ['frequency', 'subdivision']]
const phaserFrequency = [0.5, timeOptions('frequency'), timeUnit('frequency'), timeIndicator('frequency'), curveTypes.LINEAR];
const delayTime = [2.5, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.EXPONENTIAL, ['subdivision, ms']];
// const feedbackDelayTime = [0.25, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.LINEAR, ['subdivision, ms']];
const feedbackDelayTime = [0.25, [0,1], timeUnit('ms'), timeIndicator('ms'), curveTypes.LINEAR, ['subdivision, ms']];
const pitchShiftDelayTime = [0, [0,1], timeUnit('ms'), timeIndicator('ms'), curveTypes.LINEAR, ['subdivision, ms']];
const tremoloFrequency = [10, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.EXPONENTIAL, ['subdivision, ms']];
const vibratoFrequency = [5, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.LINEAR, ['subdivision, ms']];
const spread = [180, spreadRange, spreadUnit, spreadIndicator, curveTypes.LINEAR];
const distortion = [0.4, normalRange, normalUnit, distortionIndicator, curveTypes.EXPONENTIAL];
const feedback = [0.125, feedbackRange, feedbackUnit, feedbackIndicator, curveTypes.LINEAR];
const maxDelay = [1, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.LINEAR]
const vibratoMaxDelay = [0.005, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.LINEAR]
const freeverbDampening = [3000, dampeningRange, dampeningUnit, frequencyIndicator, curveTypes.LINEAR];
const roomSize = [0.7, normalRange, roomSizeUnit, roomSizeIndicator, curveTypes.LINEAR];
const stages = [10, stageRange, undefined, stageIndicator]
// type: ['white', noiseTypeOptions, undefined, noiseTypeIndicator]
const pitch = [0, pitchRange, pitchUnit, pitchIndicator]
const windowSize = [0.1, windowSizeRange, windowSizeUnit, windowSizeIndicator, curveTypes.EXPONENTIAL];
const width = [0.5, normalRange, normalUnit, widthIndicator, curveTypes.LINEAR];
const compressorAttack = [0.003, normalRange, compressorTimeUnit, envelopeTimeIndicator, curveTypes.LINEAR];
const compressorRelease = [0.25, envelopeTimeRange, compressorTimeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const ratio = [4, ratioRange, ratioUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const threshold = [-24, thresholdRange, decibel, thresholdIndicator, curveTypes.LINEAR];
const knee = [30, kneeRange, decibel, kneeIndicator, curveTypes.LINEAR];
const gainBoost = [0, gainRange, decibel, eqGainIndicator, curveTypes.LINEAR]
const lowFrequency = [400, frequencySpectrum, frequencyUnit, baseFrequnecyIndicator, curveTypes.EXPONENTIAL];
const highFrequency = [2500, frequencySpectrum, frequencyUnit, baseFrequnecyIndicator, curveTypes.EXPONENTIAL];
const filterFrequency = [350, frequencySpectrum, frequencyUnit, baseFrequnecyIndicator, curveTypes.EXPONENTIAL];
const smoothingTime = [0.1, envelopeTimeRange, compressorTimeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const mono = [0.1, envelopeTimeRange, compressorTimeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];


export const getEffectsInitials = (type: effectTypes) => {
    switch (type) {
        case effectTypes.AUTOPANNER:
            return {
                wet: wet,
                frequency: effectsFrequency,
                type: oscillatorType,
                depth: depth,
            }
        case effectTypes.AUTOFILTER:
            return {
                wet: wet,
                frequency: effectsFrequency,
                type: oscillatorType,
                depth: depth,
                baseFrequency: baseFrequency,
                octaves: autoFilterOctaves,
                filter: {
                    Q: autoFilterQ,
                    rolloff: autoFilterRolloff,
                    type: autoFilterType,
                }
            }
        case effectTypes.BITCRUSHER:
            return {
                wet: wet,
                bits: bits,
            }
        case effectTypes.CHEBYSHEV:
            return {
                wet: wet,
                order: order,
                oversample: oversample,
            }
        case effectTypes.CHORUS:
            return {
                wet: halfwet,
                feedback: chorusFeedback,
                frequency: chorusFrequency,
                delayTime: delayTime,
                depth: chorusDepth,
                type: oscillatorType,
                spread: spread,
            }
        case effectTypes.DISTORTION:
            return {
                wet: wet,
                distortion: distortion,
                oversample: oversample,
            }
        case effectTypes.FEEDBACKDELAY:
            return {
                wet: wet,
                feedback: feedback,
                delayTime: feedbackDelayTime,
                maxDelay: maxDelay,
            }
        case effectTypes.FREEVERB:
            return {
                wet: wet,
                dampening: freeverbDampening,
                roomSize: roomSize,
            }
        case effectTypes.JCREVERB:
            return {
                wet: wet,
                roomSize: roomSize
            }
        // parei aqui
        case effectTypes.PHASER:
            return {
                wet: wet,
                frequency: phaserFrequency,
                octaves: phaserOctaves,
                stages: stages,
                Q: phaserQ,
                baseFrequency: phaserBaseFrequency
            }
        case effectTypes.PINGPONGDELAY:
            return {
                wet: wet,
                feedback: feedback,
                delayTime: feedbackDelayTime,
                maxDelay: maxDelay
            }
        case effectTypes.PITCHSHIFT:
            return {
                wet: wet,
                feedback: pitchShiftFeedback,
                pitch: pitch,
                delayTime: pitchShiftDelayTime,
                windowSize: windowSize,
            }
        case effectTypes.FREQUENCYSHIFTER:
            return {
                wet: wet,
                frequency: freqShifter,
            }
        case effectTypes.STEREOWIDENER:
            return {
                wet: wet,
                width: width,
            }
        case effectTypes.TREMOLO:
            return {
                wet: wet,
                frequency: tremoloFrequency,
                type: oscillatorType,
                depth: depth,
                spread: spread
            }
        case effectTypes.VIBRATO:
            return {
                wet: wet,
                frequency: vibratoFrequency,
                // type: oscillatorType,
                type: vibratoOscillatorType,
                depth: depth,
                spread: spread,
                maxDelay: vibratoMaxDelay,
            }
        case effectTypes.COMPRESSOR:
            return {
                attack: compressorAttack,
                release: compressorRelease,
                ratio: ratio,
                threshold: threshold,
                knee: knee,
            }
        case effectTypes.EQ3:
            return {
                high: gainBoost,
                mid: gainBoost,
                low: gainBoost,
                lowFrequency: lowFrequency,
                highFrequency: highFrequency
            }
        case effectTypes.FILTER:
            return {
                Q: autoFilterQ,
                detune: detune,
                frequency: filterFrequency,
                gain: gainBoost,
                rolloff: filterRolloff,
                type: autoFilterType
            }
        case effectTypes.GATE:
            return {
                smoothing: smoothingTime,
                threshold: threshold
            }
        case effectTypes.LIMITER:
            return {
                threshold: threshold,
            }
        case effectTypes.MULTIBANDCOMPRESSOR:
            return {
                lowFrequency: lowFrequency,
                highFrequency: highFrequency,
                low: {
                    attack: compressorAttack,
                    release: compressorRelease,
                    ratio: ratio,
                    threshold: threshold,
                    knee: knee,
                },
                high: {
                    attack: compressorAttack,
                    release: compressorRelease,
                    ratio: ratio,
                    threshold: threshold,
                    knee: knee,
                },
                mid: {
                    attack: compressorAttack,
                    release: compressorRelease,
                    ratio: ratio,
                    threshold: threshold,
                    knee: knee,
                }
            }
        default:
            return {
                wet: wet,
                frequency: vibratoFrequency,
                type: oscillatorType,
                depth: depth,
                spread: spread,
                maxDelay: vibratoMaxDelay,
            }
    }
}