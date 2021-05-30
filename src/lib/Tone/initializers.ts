import { xolombrisxInstruments, effectTypes } from "../../store/Track";
import { initialsArray, effectsInitialsArray } from '../../containers/Track/Instruments';
import { onlyValues } from "../objectDecompose";
import DrumRackInstrument from './DrumRack';
import * as Tone from 'tone';
import { ToneObjectContextType } from "../../context/ToneObjectsContext";
import clap from '../../assets/drumkit/clap.mp3';
import hh1 from '../../assets/drumkit/hh1.mp3';
import hh2 from '../../assets/drumkit/hh2.mp3';
import snare from '../../assets/drumkit/snare.mp3';
import kick1 from '../../assets/drumkit/kick1.mp3'
import kick2 from '../../assets/drumkit/kick2.mp3'
import ohh1 from '../../assets/drumkit/ohh1.mp3'
import ohh2 from '../../assets/drumkit/ohh2.mp3'
import ohh3 from '../../assets/drumkit/ohh3.mp3'

export enum samples {
    CLAP_HIP_HOP = 'Clap 1',
    HI_HAT_1 = 'HH 1',
    HI_HAT_2 = 'HH 2',
    SNARE_HIP_HOP = 'Snare 1',
    KICK_1 = 'Kick 1',
    KICK_2 = 'Kick 2',
    OHH_1 = "OHH 1",
    OHH_2 = "OHH 2",
    OHH_3 = "OHH 3"
}

export const getSample = (sample: samples) => {
    switch(sample){
        case samples.CLAP_HIP_HOP:
            return clap
        case samples.HI_HAT_1:
            return hh1
        case samples.HI_HAT_2:
            return hh2
        case samples.SNARE_HIP_HOP:
            return snare
        case samples.KICK_1:
            return kick1
        case samples.KICK_2:
            return kick2
        case samples.OHH_1:
            return ohh1
        case samples.OHH_2:
            return ohh2
        case samples.OHH_3:
            return ohh3
        default:
            return kick1;
    }
}


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
            console.log(`returning drumrack, options is `, options) ;
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

export const reconnect = (ref_toneObjects: ToneObjectContextType, trackIndex: number) => {
if (ref_toneObjects.current){
    const chain = ref_toneObjects.current.tracks[trackIndex].chain
    
    ref_toneObjects.current.tracks[trackIndex].instrument?.disconnect()
    chain.in.disconnect()

    for (let i = 0; i < ref_toneObjects.current.tracks[trackIndex].effects.length ; i ++)
        ref_toneObjects.current.tracks[trackIndex].effects[i].disconnect()

    ref_toneObjects.current?.tracks[trackIndex].instrument?.chain(
        chain.in, 
        ...ref_toneObjects.current.tracks[trackIndex].effects, 
        chain.out
    )

}
}