import { getInitials } from '../defaults'
import { instrumentTypes, midi } from '../../../store/Track'

export interface InstrumentProps<T extends instrumentTypes> {
    id: number,
    voice: T,
    maxPolyphony?: number,
    midi: midi,
    options: RecursivePartial<ReturnType<typeof getInitials>>,
    // options: VoiceOptions<VoiceFromType<T>>,
    index: number
}

// export declare type parcialInstrumentProp<T extends instrumentTypes> = Pick<InstrumentProps<T>, "voice" | "options">

// declare type typeFromVoice<T> = T extends  
// declare type VoiceFromType<T> = T extends instrumentTypes.AMSYNTH ? AMSynth : T extends instrumentTypes.DRUMRACK ? Sampler : T extends instrumentTypes.FMSYNTH ? FMSynth : T extends instrumentTypes.MEMBRANESYNTH ? MembraneSynth : T extends instrumentTypes.METALSYNTH ? MetalSynth : T extends instrumentTypes.NOISESYNTH ? NoiseSynth : T extends instrumentTypes.PLUCKSYNTH ? PluckSynth : T extends instrumentTypes.SAMPLER ? Sampler : never
// declare type VoiceOptions<T> = T extends PolyInstruments ? Pick<PolySynthOptions<T>, "options">['options'] : T extends Sampler ? Partial<SamplerOptions> : T extends DuoSynth ? Partial<DuoSynthOptions> : T extends NoiseSynth ? Partial<NoiseSynthOptions> : T extends PluckSynth ? Partial<PluckSynthOptions> : never;
export declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<RecursivePartial<U>> : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};