import { xolombrisxInstruments, effectTypes } from "../../store/Track";
import { initialsArray, effectsInitialsArray } from '../../containers/Track/Instruments';
import { onlyValues } from "../objectDecompose";
import DrumRackInstrument from './DrumRack';
import * as Tone from 'tone';

export const returnInstrument = (voice: xolombrisxInstruments, opt: initialsArray) => {
    let options = onlyValues(opt);

    switch (voice) {
        case xolombrisxInstruments.AMSYNTH:
            return new Tone.PolySynth(Tone.AMSynth, options);
        case xolombrisxInstruments.FMSYNTH:
            return new Tone.PolySynth(Tone.FMSynth, options);
        case xolombrisxInstruments.MEMBRANESYNTH:
            return new Tone.PolySynth(Tone.MembraneSynth, options);
        case xolombrisxInstruments.METALSYNTH:
            return new Tone.PolySynth(Tone.MetalSynth, options);
        case xolombrisxInstruments.NOISESYNTH:
            return new Tone.NoiseSynth(options);
        // case xolombrisxInstruments.PLUCKSYNTH:
        //     return new Tone.PluckSynth(options);
        case xolombrisxInstruments.DRUMRACK:
            // return new DrumRackInstrument(opt)
            return new DrumRackInstrument(options)
        default:
            return new Tone.Sampler();
    }
}

export const returnEffect = (type: effectTypes, opt: effectsInitialsArray) => {
    let options = onlyValues(opt);

    switch (type) {
        case effectTypes.AUTOFILTER:
            return new Tone.AutoFilter(options);
        case effectTypes.AUTOPANNER:
            return new Tone.AutoPanner(options);
        case effectTypes.BITCRUSHER:
            return new Tone.BitCrusher(options);
        case effectTypes.CHEBYSHEV:
            return new Tone.Chebyshev(options);
        case effectTypes.CHORUS:
            return new Tone.Chorus(options);
        case effectTypes.COMPRESSOR:
            return new Tone.Compressor(options);
        case effectTypes.DISTORTION:
            return new Tone.Distortion(options);
        case effectTypes.EQ3:
            return new Tone.EQ3(options);
        case effectTypes.FEEDBACKDELAY:
            return new Tone.FeedbackDelay(options);
        case effectTypes.FILTER:
            return new Tone.Filter(options);
        case effectTypes.FREEVERB:
            return new Tone.Freeverb(options);
        case effectTypes.FREQUENCYSHIFTER:
            return new Tone.FrequencyShifter(options);
        case effectTypes.GATE:
            return new Tone.Gate(options);
        case effectTypes.JCREVERB:
            return new Tone.JCReverb(options);
        case effectTypes.LIMITER:
            return new Tone.Limiter(options);
        case effectTypes.MULTIBANDCOMPRESSOR:
            return new Tone.MultibandCompressor(options);
        case effectTypes.PHASER:
            return new Tone.Phaser(options)
        case effectTypes.PINGPONGDELAY:
            return new Tone.PingPongDelay(options)
        case effectTypes.PITCHSHIFT:
            return new Tone.PitchShift(options)
        case effectTypes.STEREOWIDENER:
            return new Tone.StereoWidener(options)
        case effectTypes.TREMOLO:
            return new Tone.Tremolo(options)
        case effectTypes.VIBRATO:
            return new Tone.Vibrato(options)
        default:
            return new Tone.Vibrato(options)
    }
}