import { onlyValues } from "../../lib/objectDecompose";
import { instrumentTypes } from "../../store/Track";
export enum indicators {
    KNOB = 'knob',
    VERTICAL_SLIDER = 'slider',
    DROPDOWN = 'dropdown',
    RADIO = 'radio',
    HORIZONTAL_SLIDER = 'horizontal_slider'
}

export enum curveTypes {
    EXPONENTIAL = 'exponential',
    LINEAR = 'linear',
};


// format [defaultValue, [min, max], typeofHandler, extraInfo]
export const noiseTypeIndicator = indicators.RADIO;
export const attackNoiseIndicator = indicators.VERTICAL_SLIDER // exponential 
export const volumeIndicator = indicators.VERTICAL_SLIDER; // exponential 
export const detuneIndicator = indicators.HORIZONTAL_SLIDER; // linear  
export const portamentoIndicator = indicators.KNOB; // exponential 
export const harmonicityIndicator = indicators.KNOB; // exponential 
export const oscillatorTypeIndicator = indicators.DROPDOWN;
export const envelopeTimeIndicator = indicators.KNOB; // exponential 
export const envelopeCurveIndicator = indicators.RADIO;
export const modulationIndicator = indicators.KNOB; // exponential
export const frequencyIndicator = indicators.KNOB; // exponential 
export const resonanceIndicator = indicators.KNOB; // exponential

export const volumeRange = [-100, 6];
export const detuneRange = [-1200, 1200];
export const portamentoRange = [0, 3];
export const harmonicityRange = [0.1, 10];
export const envelopeTimeRange = [0, 10];
export const normalRange = [0, 1];
export const audioRange = [0, 1];
export const modulationRange = [0, 100];
export const membraneSynthOctaveRange = [0.5, 8];
export const metalSynthOctaveRange = [0, 8]
export const dampeningRange = [0, 7000];
export const attackNoiseRange = [0.1, 20]
export const noiseTypeOptions = ['white', 'brown', 'pink']
export const oscillatorTypeOptions = ['sine', 'square', 'saw', 'triangle'];
export const envelopeCurveOptions = ['linear', 'exponential'];

// data that will be used to generate the indicators/selectors
// that will lay in the state of each track.
// envelopes

export const envelope = {
    attack: [0.01, envelopeTimeRange, envelopeTimeIndicator],
    attackCurve: ["linear", envelopeCurveOptions, envelopeCurveIndicator],
    decay: [0.01, envelopeTimeRange, envelopeCurveIndicator],
    decayCurve: ["exponential", envelopeCurveOptions, envelopeCurveIndicator],
    release: [0.5, envelopeTimeRange, envelopeTimeIndicator],
    releaseCurve: ["exponential", envelopeCurveOptions, envelopeCurveIndicator],
    sustain: [1, normalRange, envelopeTimeIndicator]
};

export const metalSynthEnvelope = {
    attack: [0.001, envelopeTimeRange, envelopeTimeIndicator],
    attackCurve: ["linear", envelopeCurveOptions, envelopeCurveIndicator],
    decay: [1.4, envelopeTimeRange, envelopeCurveIndicator],
    decayCurve: ["exponential", envelopeCurveOptions, envelopeCurveIndicator],
    release: [0.2, envelopeTimeRange, envelopeTimeIndicator],
    releaseCurve: ["exponential", envelopeCurveOptions, envelopeCurveIndicator],
    sustain: [0, normalRange, envelopeTimeIndicator]
}

export const membraneSynthEnvelope = {
    attack: [0.001, envelopeTimeRange, envelopeTimeIndicator],
    attackCurve: ["exponential", envelopeCurveOptions, envelopeCurveIndicator],
    decay: [0.4, envelopeTimeRange, envelopeTimeIndicator],
    decayCurve: ["exponential", envelopeCurveOptions, envelopeCurveIndicator],
    release: [1.4, envelopeTimeRange, envelopeTimeIndicator],
    releaseCurve: ["exponential", envelopeCurveOptions, envelopeCurveIndicator],
    sustain: [0.01, normalRange, envelopeTimeIndicator]
}

export const modulationEnvelope = {
    attack: [0.5, envelopeTimeRange, envelopeTimeIndicator],
    attackCurve: ["linear", envelopeCurveOptions, envelopeCurveIndicator],
    decay: [0, envelopeTimeRange, envelopeTimeIndicator],
    decayCurve: ["exponential", envelopeCurveOptions, envelopeCurveIndicator],
    release: [0.5, envelopeTimeRange, envelopeTimeIndicator],
    releaseCurve: ["exponential", envelopeCurveOptions, envelopeCurveIndicator],
    sustain: [1, normalRange, envelopeTimeIndicator]
};

export const oscillator = {
    // partialCount: [0, 0, 8, 'dropdown', [1,2,3,4,5,6,7,8]],
    // partials: [],
    // phase: 0,
    type: ["sine", oscillatorTypeOptions, oscillatorTypeIndicator]
};

export const modulation = {
    // partialCount: 0,
    // partials: [],
    // phase: 0,
    type: ["square", oscillatorTypeOptions, oscillatorTypeIndicator]
}

export const noise = {
    fadeIn: [0, envelopeTimeRange, envelopeTimeIndicator],
    fadeOut: [0, envelopeTimeRange, envelopeTimeIndicator],
    playbackRate: [1, modulationRange, modulationRange],
    type: ['white', noiseTypeOptions, noiseTypeIndicator]
}

const volume = [0, volumeRange, volumeIndicator, curveTypes.EXPONENTIAL];
const detune = [0, detuneRange, detuneIndicator, curveTypes.LINEAR];
const portamento = [0, portamentoRange, portamentoIndicator, curveTypes.EXPONENTIAL];
const modSynthHarmonicity = [3, harmonicityRange, harmonicityIndicator, curveTypes.EXPONENTIAL];
const metalSynthHarmonicity = [5.1, harmonicityRange, harmonicityIndicator, curveTypes.EXPONENTIAL];
const modSynthModulationIndex = [10, modulationRange, modulationIndicator, curveTypes.EXPONENTIAL];
const metalSynthModulationIndex = [32, modulationRange, modulationIndicator, curveTypes.EXPONENTIAL];
const membraneSynthOctaves = [10, membraneSynthOctaveRange, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const membraneSynthPitchDecay = [1.4, envelopeTimeRange, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const metalSynthOctaves = [1.5, metalSynthOctaveRange, envelopeTimeIndicator, curveTypes.EXPONENTIAL];
const metalSynthResonance = [4000, dampeningRange, resonanceIndicator, curveTypes.EXPONENTIAL];
const attackNoise = [1, attackNoiseRange, attackNoiseIndicator]
const dampening = [4000, dampeningRange, frequencyIndicator]
const pluckResonance = [0.7, normalRange, frequencyIndicator]
const pluckRelease = [1, envelopeTimeRange, envelopeTimeIndicator]

export type instrumentOptions<T> =
    T extends instrumentTypes.AMSYNTH
    ? {
        volume: typeof volume,
        detune: typeof detune,
        portamento: typeof portamento,
        harmonicity: typeof modSynthHarmonicity,
        oscillator: typeof oscillator,
        envelope: typeof envelope,
        modulation: typeof modulation,
        modulationEnvelope: typeof modulationEnvelope,
        modulationIndex: typeof modSynthModulationIndex
    }
    : T extends instrumentTypes.AMSYNTH
    ? {
        volume: typeof volume,
        detune: typeof detune,
        portamento: typeof portamento,
        harmonicity: typeof modSynthHarmonicity,
        oscillator: typeof oscillator,
        envelope: typeof envelope,
        modulation: typeof modulation,
        modulationEnvelope: typeof modulationEnvelope,
    }
    : T extends instrumentTypes.MEMBRANESYNTH
    ? {
        volume: typeof volume,
        detune: typeof detune,
        portamento: typeof portamento,
        envelope: typeof membraneSynthEnvelope,
        oscillator: typeof oscillator,
        octaves: typeof membraneSynthOctaves,
        pitchDecay: typeof membraneSynthPitchDecay,
    }
    : T extends instrumentTypes.METALSYNTH
    ? {
        volume: typeof volume,
        detune: typeof detune,
        portamento: typeof portamento,
        envelope: typeof metalSynthEnvelope,
        harmonicity: typeof metalSynthHarmonicity,
        modulationIndex: typeof metalSynthModulationIndex,
        octaves: typeof metalSynthOctaves,
        resonance: typeof metalSynthResonance
    }
    : T extends instrumentTypes.NOISESYNTH
    ? {
        volume: typeof volume,
        envelope: typeof envelope,
        noise: typeof noise,
    }
    : T extends instrumentTypes.PLUCKSYNTH
    ? {
        volume: typeof volume,
        attackNoise: typeof attackNoise,
        dampening: typeof dampening,
        resonance: typeof pluckResonance,
        release: typeof pluckRelease
    }
    : {
        volume: typeof volume,
        attack: typeof samplerAttack,
        baseUrl: string,
        curve: typeof curve,
        release: typeof samplerRelase,
        urls: { [url: string]: any },
    }

const samplerAttack = [0, envelopeTimeRange, envelopeTimeIndicator]
const curve = ['exponential', envelopeCurveOptions, envelopeCurveIndicator]
const samplerRelase = [0.1, envelopeTimeRange, envelopeTimeIndicator]


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
                attackNoise: [1, attackNoiseRange, attackNoiseIndicator],
                dampening: [4000, dampeningRange, frequencyIndicator],
                resonance: [0.7, normalRange, frequencyIndicator],
                release: [1, envelopeTimeRange, envelopeTimeIndicator]
            }
        case instrumentTypes.SAMPLER:
            return {
                volume: volume,
                attack: [0, envelopeTimeRange, envelopeTimeIndicator],
                baseUrl: " ",
                curve: ['exponential', envelopeCurveOptions, envelopeCurveIndicator],
                release: [0.1, envelopeTimeRange, envelopeTimeIndicator],
                urls: {},
            }
        case instrumentTypes.DRUMRACK:
            return {
                volume: volume,
                attack: [0, envelopeTimeRange, envelopeTimeIndicator],
                baseUrl: " ",
                curve: ['exponential', envelopeCurveOptions, envelopeCurveIndicator],
                release: [0.1, envelopeTimeRange, envelopeTimeIndicator],
                urls: {},
            }
        default:
            return {}
    }
}