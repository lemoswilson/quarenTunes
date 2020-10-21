import { onlyValues } from "../../lib/objectDecompose";
import { range } from "../../lib/utility";
import { effectTypes, instrumentTypes } from "../../store/Track";

export enum indicators {
    KNOB = 'knob',
    STEPPED_KNOB = 'STEPPED_KNOB',
    VERTICAL_SLIDER = 'slider',
    DROPDOWN = 'dropdown',
    RADIO = 'radio',
    HORIZONTAL_SLIDER = 'horizontal_slider'
}

export enum curveTypes {
    EXPONENTIAL = 'exponential',
    LINEAR = 'linear',
};



// Instruments options 
// format [defaultValue, [min, max], typeofHandler, extraInfo]
const noiseTypeIndicator = indicators.RADIO;
const attackNoiseIndicator = indicators.VERTICAL_SLIDER // exponential 
const volumeIndicator = indicators.VERTICAL_SLIDER; // exponential 
const detuneIndicator = indicators.HORIZONTAL_SLIDER; // linear  
const portamentoIndicator = indicators.KNOB; // exponential 
const harmonicityIndicator = indicators.KNOB; // exponential 
const oscillatorTypeIndicator = indicators.DROPDOWN;
const envelopeTimeIndicator = indicators.KNOB; // exponential 
const envelopeCurveIndicator = indicators.RADIO;
const modulationIndicator = indicators.KNOB; // exponential
const frequencyIndicator = indicators.KNOB; // exponential 
const resonanceIndicator = indicators.KNOB; // exponential

const volumeUnit = 'dB';
const detuneUnit = 'c';
const portamentoUnit = 's';
const harmonicityUnit = '';
const envelopeUnit = 's';
const normalUnit = '';
const audioRangeUnit = '';
const modulationUnit = '';
const membraneSynthOctaveRangeUnit = '';
const metalSynthOctaveRangeUnit = '';
const dampeningUnit = 'hz';
const attackNoiseUnit = '';

const volumeRange = [-100, 6];
const detuneRange = [-1200, 1200];
const portamentoRange = [0, 3];
const harmonicityRange = [0.1, 10];
const envelopeTimeRange = [0, 10];
const normalRange = [0, 1];
const audioRange = [0, 1];
const modulationRange = [0, 100];
const membraneSynthOctaveRange = [0.5, 8];
const metalSynthOctaveRange = [0, 8]
const dampeningRange = [0, 7000];
const attackNoiseRange = [0.1, 20]
const noiseTypeOptions = ['white', 'brown', 'pink']
const oscillatorTypeOptions = ['sine', 'square', 'saw', 'triangle'];
const envelopeCurveOptions = ['linear', 'exponential'];

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
    attackCurve: ["linear", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    decay: [0.01, envelopeTimeRange, envelopeUnit, envelopeCurveIndicator, curveTypes.EXPONENTIAL],
    decayCurve: ["exponential", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    release: [0.5, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    releaseCurve: ["exponential", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    sustain: [1, normalRange, normalUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]
};

const metalSynthEnvelope = {
    attack: [0.001, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    attackCurve: ["linear", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    decay: [1.4, envelopeTimeRange, envelopeUnit, envelopeCurveIndicator, curveTypes.EXPONENTIAL],
    decayCurve: ["exponential", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    release: [0.2, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    releaseCurve: ["exponential", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    sustain: [0, normalRange, normalUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]
}

const membraneSynthEnvelope = {
    attack: [0.001, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    attackCurve: ["exponential", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    decay: [0.4, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    decayCurve: ["exponential", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    release: [1.4, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    releaseCurve: ["exponential", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    sustain: [0.01, normalRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]
}

const modulationEnvelope = {
    attack: [0.5, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    attackCurve: ["linear", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    decay: [0, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    decayCurve: ["exponential", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    release: [0.5, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    releaseCurve: ["exponential", envelopeCurveOptions, undefined, envelopeCurveIndicator],
    sustain: [1, normalRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]
};

const oscillator = {
    // partialCount: [0, 0, 8, 'dropdown', [1,2,3,4,5,6,7,8]],
    // partials: [],
    // phase: 0,
    type: ["sine", oscillatorTypeOptions, undefined, oscillatorTypeIndicator]
};

const modulation = {
    // partialCount: 0,
    // partials: [],
    // phase: 0,
    type: ["square", oscillatorTypeOptions, undefined, oscillatorTypeIndicator]
}

const noise = {
    fadeIn: [0, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    fadeOut: [0, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
    playbackRate: [1, modulationRange, modulationUnit, modulationRange, curveTypes.EXPONENTIAL],
    type: ['white', noiseTypeOptions, undefined, noiseTypeIndicator]
}

const volume = [0, volumeRange, volumeUnit, volumeIndicator, curveTypes.EXPONENTIAL];
const detune = [0, detuneRange, detuneUnit, detuneIndicator, curveTypes.LINEAR];
const portamento = [0, portamentoRange, portamentoUnit, portamentoIndicator, curveTypes.EXPONENTIAL];
const modSynthHarmonicity = [3, harmonicityRange, harmonicityUnit, harmonicityIndicator, curveTypes.EXPONENTIAL];
const metalSynthHarmonicity = [5.1, harmonicityRange, harmonicityUnit, harmonicityIndicator, curveTypes.EXPONENTIAL];
const modSynthModulationIndex = [10, modulationRange, modulationUnit, modulationIndicator, curveTypes.EXPONENTIAL];
const metalSynthModulationIndex = [32, modulationRange, modulationUnit, modulationIndicator, curveTypes.EXPONENTIAL];
const membraneSynthOctaves = [10, membraneSynthOctaveRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const membraneSynthPitchDecay = [1.4, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const metalSynthOctaves = [1.5, metalSynthOctaveRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const metalSynthResonance = [4000, dampeningRange, dampeningUnit, resonanceIndicator, curveTypes.EXPONENTIAL];
const attackNoise = [1, attackNoiseRange, attackNoiseUnit, attackNoiseIndicator, curveTypes.EXPONENTIAL];
const dampening = [4000, dampeningRange, dampeningUnit, frequencyIndicator, curveTypes.EXPONENTIAL];
const pluckResonance = [0.7, normalRange, normalUnit, frequencyIndicator, curveTypes.EXPONENTIAL]
const pluckRelease = [1, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]
const samplerAttack = [0, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]
const curve = ['exponential', envelopeCurveOptions, envelopeCurveIndicator]
const samplerRelase = [0.1, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL]


// export type instrumentOptions<T> =
//     T extends instrumentTypes.AMSYNTH
//     ? {
//         volume: typeof volume,
//         detune: typeof detune,
//         portamento: typeof portamento,
//         harmonicity: typeof modSynthHarmonicity,
//         oscillator: typeof oscillator,
//         envelope: typeof envelope,
//         modulation: typeof modulation,
//         modulationEnvelope: typeof modulationEnvelope,
//         modulationIndex: typeof modSynthModulationIndex
//     }
//     : T extends instrumentTypes.AMSYNTH
//     ? {
//         volume: typeof volume,
//         detune: typeof detune,
//         portamento: typeof portamento,
//         harmonicity: typeof modSynthHarmonicity,
//         oscillator: typeof oscillator,
//         envelope: typeof envelope,
//         modulation: typeof modulation,
//         modulationEnvelope: typeof modulationEnvelope,
//     }
//     : T extends instrumentTypes.MEMBRANESYNTH
//     ? {
//         volume: typeof volume,
//         detune: typeof detune,
//         portamento: typeof portamento,
//         envelope: typeof membraneSynthEnvelope,
//         oscillator: typeof oscillator,
//         octaves: typeof membraneSynthOctaves,
//         pitchDecay: typeof membraneSynthPitchDecay,
//     }
//     : T extends instrumentTypes.METALSYNTH
//     ? {
//         volume: typeof volume,
//         detune: typeof detune,
//         portamento: typeof portamento,
//         envelope: typeof metalSynthEnvelope,
//         harmonicity: typeof metalSynthHarmonicity,
//         modulationIndex: typeof metalSynthModulationIndex,
//         octaves: typeof metalSynthOctaves,
//         resonance: typeof metalSynthResonance
//     }
//     : T extends instrumentTypes.NOISESYNTH
//     ? {
//         volume: typeof volume,
//         envelope: typeof envelope,
//         noise: typeof noise,
//     }
//     : T extends instrumentTypes.PLUCKSYNTH
//     ? {
//         volume: typeof volume,
//         attackNoise: typeof attackNoise,
//         dampening: typeof dampening,
//         resonance: typeof pluckResonance,
//         release: typeof pluckRelease
//     }
//     : {
//         volume: typeof volume,
//         attack: typeof samplerAttack,
//         baseUrl: string,
//         curve: typeof curve,
//         release: typeof samplerRelase,
//         urls: { [url: string]: any },
//     }

export function getInitialsValue(type: instrumentTypes) {
    return onlyValues(getInitials(type))
}


export function getInitials(type: instrumentTypes) {
    switch (type) {
        case instrumentTypes.AMSYNTH:
            return {
                volume: volume,
                detune: detune,
                portamento: portamento,
                harmonicity: modSynthHarmonicity,
                oscillator: oscillator,
                envelope: envelope,
                modulation: modulation,
                modulationEnvelope: modulationEnvelope,
            }
        case instrumentTypes.FMSYNTH:
            return {
                volume: volume,
                detune: detune,
                portamento: portamento,
                harmonicity: modSynthHarmonicity,
                oscillator: oscillator,
                envelope: envelope,
                modulation: modulation,
                modulationEnvelope: modulationEnvelope,
                modulationIndex: modSynthModulationIndex
            }
        case instrumentTypes.MEMBRANESYNTH:
            return {
                volume: volume,
                detune: detune,
                portamento: portamento,
                envelope: membraneSynthEnvelope,
                oscillator: oscillator,
                octaves: membraneSynthOctaves,
                pitchDecay: membraneSynthPitchDecay,
            }
        case instrumentTypes.METALSYNTH:
            return {
                volume: volume,
                detune: detune,
                portamento: portamento,
                envelope: metalSynthEnvelope,
                harmonicity: metalSynthHarmonicity,
                modulationIndex: metalSynthModulationIndex,
                octaves: metalSynthOctaves,
                resonance: metalSynthResonance
            }
        case instrumentTypes.NOISESYNTH:
            return {
                volume: volume,
                envelope: envelope,
                noise: noise,
            }
        case instrumentTypes.PLUCKSYNTH:
            return {
                volume: volume,
                attackNoise: attackNoise,
                dampening: dampening,
                resonance: pluckResonance,
                release: pluckRelease
            }
        case instrumentTypes.SAMPLER:
            return {
                volume: volume,
                attack: samplerAttack,
                baseUrl: " ",
                curve: curve,
                release: samplerRelase,
                urls: {},
            }
        case instrumentTypes.DRUMRACK:
            return {
                volume: volume,
                attack: [0, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
                baseUrl: " ",
                curve: ['exponential', envelopeCurveOptions, undefined, envelopeCurveIndicator],
                release: [0.1, envelopeTimeRange, envelopeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL],
                urls: {},
            }
        default:
            return {}
    }
}

const drywetRange = normalRange
export const timeIndicator = (type: 'frequency' | 'subdivision' | 'ms' = 'subdivision') => {
    if (type === "frequency" || type === 'ms') return indicators.KNOB
    else return indicators.STEPPED_KNOB
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
const rolloffIndicators = indicators.RADIO;
const bitIndicator = indicators.KNOB;
const filterTypeIndicator = indicators.RADIO;
const baseFrequnecyIndicator = indicators.KNOB;
const orderIndicator = indicators.KNOB;
const oversampleIndicator = indicators.RADIO;
const feedbackIndicator = indicators.KNOB;
const delayTimeIndicator = indicators.KNOB;
const spreadIndicator = indicators.KNOB;
const distortionIndicator = indicators.KNOB;
const roomSizeIndicator = indicators.KNOB;
const stageIndicator = indicators.KNOB;
const pitchIndicator = indicators.STEPPED_KNOB;
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
const stageRange = [1, 10]
const pitchRange = range(48, -48)
const windowSizeRange = [0.03, 0.1]
const ratioRange = [1, 40];
const thresholdRange = [-100, 0];
const kneeRange = [0, 40];
const gainRange = [-16, 16]

const oversampleOptions = ['2x', '4x', 'none'];
const filterTypeOptions = ["allpass", "bandpass", "highpass", "highshelf", "lowpass", "lowshelf", "notch", "peaking"]
const subdivisionOptions = ["1m", "1n", "1n.", "2n", "2n.", "2t", "4n", "4n.", "4t", "8n", "8n", "8t", "16n", "16n", "16t", "32n", "32n", "32t", "64n", "64n", "64t", "128n", "128n", "128t", "256n", "256n", "256t", '0']

const wet = [1, drywetRange, drywetUnit, drywetIndicator, curveTypes.LINEAR];
const halfwet = [0.5, drywetIndicator, drywetUnit, drywetIndicator, curveTypes.LINEAR]
const oscillatorType = ['sine', oscillatorTypeOptions, undefined, oscillatorTypeIndicator];
const effectsFrequency = [15, timeOptions('frequency'), timeUnit('frequency'), timeIndicator("frequency"), curveTypes.EXPONENTIAL, ['frequency', 'subdivision']];
const depth = [1, normalRange, normalUnit, frequencyIndicator, curveTypes.EXPONENTIAL];
const chorusDepth = [0.5, normalRange, normalUnit, frequencyIndicator, curveTypes.EXPONENTIAL];
const baseFrequency = [200, baseFrequencyRange, frequencyUnit, baseFrequnecyIndicator, curveTypes.EXPONENTIAL];
const phaserBaseFrequency = [350, baseFrequencyRange, frequencyUnit, baseFrequnecyIndicator, curveTypes.EXPONENTIAL];
const freqShifter = [0, baseFrequencyRange, frequencyUnit, baseFrequnecyIndicator, curveTypes.EXPONENTIAL];
const autoFilterOctaves = [2.6, ocatvesRange, octaveUnit, octavesIndicator, curveTypes.EXPONENTIAL];
const phaserOctaves = [3, ocatvesRange, octaveUnit, octavesIndicator, curveTypes.EXPONENTIAL];
const autoFilterQ = [1, qRange, qUnit, qIndicator, curveTypes.EXPONENTIAL];
const phaserQ = [10, qRange, qUnit, qIndicator, curveTypes.EXPONENTIAL]
const autoFilterRolloff = [-12, rolloffOptions, undefined, rolloffIndicators];
const filterRolloff = [-12, FilterrolloffOptions, undefined, rolloffIndicators];
const autoFilterType = ['lowpass', filterTypeOptions, undefined, filterTypeIndicator];
const bits = [4, bitRange, bitUnit, bitIndicator, curveTypes.LINEAR];
const order = [15, orderRange, orderUnit, orderIndicator, curveTypes.LINEAR];
const oversample = ['none', oversampleOptions, undefined, oversampleIndicator];
const chorusFeedback = [0, feedbackRange, feedbackUnit, feedbackIndicator, curveTypes.LINEAR];
const pitchShiftFeedback = [0, feedbackRange, feedbackUnit, feedbackIndicator, curveTypes.LINEAR];
const chorusFrequency = [4, timeOptions('frequency'), timeUnit('frequency'), timeIndicator('frequency'), curveTypes.EXPONENTIAL, ['frequency', 'subdivision']]
const phaserFrequency = [0.5, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.EXPONENTIAL];
const delayTime = [2.5, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.EXPONENTIAL, ['subdivision, ms']];
const feedbackDelayTime = [0.25, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.EXPONENTIAL, ['subdivision, ms']];
const pitchShiftDelayTime = [0, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.EXPONENTIAL, ['subdivision, ms']];
const tremoloFrequency = [10, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.EXPONENTIAL, ['subdivision, ms']];
const vibratoFrequency = [5, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.EXPONENTIAL, ['subdivision, ms']];
const spread = [180, spreadRange, spreadUnit, spreadIndicator, curveTypes.EXPONENTIAL];
const distortion = [0.4, normalRange, normalUnit, distortionIndicator, curveTypes.EXPONENTIAL];
const feedback = [0.125, feedbackRange, feedbackUnit, feedbackIndicator, curveTypes.EXPONENTIAL];
const maxDelay = [1, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.EXPONENTIAL]
const vibratoMaxDelay = [0.005, timeOptions('ms'), timeUnit('ms'), timeIndicator('ms'), curveTypes.EXPONENTIAL]
const freeverbDampening = [3000, dampeningRange, dampeningUnit, frequencyIndicator, curveTypes.EXPONENTIAL];
const roomSize = [0.7, normalRange, roomSizeUnit, roomSizeIndicator, curveTypes.EXPONENTIAL];
const stages = [10, stageRange, stageUnit, stageIndicator, curveTypes.LINEAR]
const pitch = [0, pitchRange, pitchUnit, pitchIndicator]
const windowSize = [0.1, windowSizeRange, windowSizeUnit, windowSizeIndicator, curveTypes.EXPONENTIAL];
const width = [0.5, normalRange, normalUnit, widthIndicator, curveTypes.EXPONENTIAL];
const compressorAttack = [0.003, envelopeTimeRange, compressorTimeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const compressorRelease = [0.25, envelopeTimeRange, compressorTimeUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const ratio = [4, ratioRange, ratioUnit, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const threshold = [-24, thresholdRange, decibel, thresholdIndicator, curveTypes.EXPONENTIAL];
const knee = [30, kneeRange, decibel, kneeIndicator, curveTypes.EXPONENTIAL];
const gainBoost = [0, gainRange, decibel, eqGainIndicator, curveTypes.EXPONENTIAL]
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
                type: oscillatorType,
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