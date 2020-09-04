export enum indicators {
    KNOB = 'knob',
    SLIDER = 'slider',
    DROPDOWN = 'dropdown',
    RADIO = 'radio',
}

import { instrumentTypes } from "../../store/Track";

// format [defaultValue, min, max, typeofHandler]
export const noiseTypeIndicator = indicators.RADIO;
export const attackNoiseIndicator = indicators.SLIDER
export const volumeIndicator = indicators.SLIDER;
export const detuneIndicator = indicators.KNOB;
export const portamentoIndicator = indicators.KNOB;
export const harmonicityIndicator = indicators.KNOB;
export const oscillatorTypeIndicator = indicators.DROPDOWN;
export const envelopeTimeIndicator = indicators.KNOB;
export const envelopeCurveIndicator = indicators.RADIO;
export const modulationIndictaor = indicators.KNOB;
export const octaveIndictaor = indicators.SLIDER;
export const frequencyIndicator = indicators.KNOB;
export const resonanceIndicator = indicators.KNOB;

export const volumeRange = [-100, 6];
export const detuneRange = [-1200, 1200];
export const portamentoRange = [0, 3];
export const harmonicityRange = [0, 100];
export const envelopeTimeRange = [0, 10];
export const normalRange = [0, 1];
export const audioRange = [0, 1];
export const modulationRange = [0, 100];
export const octaveRange = [0, 12];
export const frequencyRange = [0, 22000];
export const resonanceRange = [20, 20000];
export const attackNoiseRange = [0.1, 20]
export const noiseTypeOptions = ['white', 'brown', 'pink']
export const oscillatorTypeOptions = ['sine', 'square', 'saw', 'triangle'];
export const envelopeCurveOptions = ['linear', 'exponential'];

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

export const volume = [0, volumeRange, volumeIndicator];
export const detune = [0, detuneRange, detuneIndicator];
export const portamento = [0, portamentoRange, portamentoIndicator];
export const modSynthHarmonicity = [3, harmonicityRange, harmonicityIndicator];
export const metalSynthHarmonicity = [5.1, harmonicityRange, harmonicityIndicator];
export const modSynthModulationIndex = [10, modulationRange, modulationIndictaor];
export const metalSynthModulationIndex = [32, modulationRange, modulationIndictaor];
export const membraneSynthOctaves = [10, octaveRange, octaveIndictaor];
export const membraneSynthPitchDecay = [1.4, envelopeTimeRange, envelopeTimeIndicator];
export const metalSynthOctaves = [1.5, octaveRange, octaveIndictaor];
export const metalSynthResonance = [4000, resonanceRange, resonanceIndicator];

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
                dampening: [4000, frequencyRange, frequencyIndicator],
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

export var FMSynthInitials = {
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

export var AMSynthInitials = {
    volume: volume,
    detune: detune,
    portamento: portamento,
    harmonicity: modSynthHarmonicity,
    oscillator: oscillator,
    envelope: envelope,
    modulation: modulation,
    modulationEnvelope: modulationEnvelope,
}

export var MetalSynthInitials = {
    volume: volume,
    detune: detune,
    portamento: portamento,
    envelope: metalSynthEnvelope,
    harmonicity: metalSynthHarmonicity,
    modulationIndex: metalSynthModulationIndex,
    octaves: metalSynthOctaves,
    resonance: metalSynthResonance
}

export var MembraneSynthInitials = {
    volume: volume,
    detune: detune,
    portamento: portamento,
    envelope: membraneSynthEnvelope,
    oscillator: oscillator,
    octaves: membraneSynthOctaves,
    pitchDecay: membraneSynthPitchDecay,
}

export var NoiseSynthInitials = {
    volume: volume,
    envelope: envelope,
    noise: noise,
}

export var PluckSynthInitials = {
    volume: volume,
    attackNoise: [1, attackNoiseRange, attackNoiseIndicator],
    dampening: [4000, frequencyRange, frequencyIndicator],
    resonance: [0.7, normalRange, frequencyIndicator],
    release: [1, envelopeTimeRange, envelopeTimeIndicator]
}

export var SamplerInitials = {
    volume: volume,
    attack: [0, envelopeTimeRange, envelopeTimeIndicator],
    baseUrl: " ",
    curve: ['exponential', envelopeCurveOptions, envelopeCurveIndicator],
    release: [0.1, envelopeTimeRange, envelopeTimeIndicator],
    urls: {},
}

export var DrumRackInitials = {
    volume: volume,
    attack: [0, envelopeTimeRange, envelopeTimeIndicator],
    baseUrl: " ",
    curve: ['exponential', envelopeCurveOptions, envelopeCurveIndicator],
    release: [0.1, envelopeTimeRange, envelopeTimeIndicator],
    urls: {},
} 