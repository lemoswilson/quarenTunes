import mongoose, { Schema, Document } from 'mongoose';
import { UserModelType } from './user.model'

interface instrument {
    User: UserModelType['_id'],
    volume: any[],
    detune: any[],
    portamento: any[],
    harmonicity: any[],
    oscillator: {
        type: any[],
    },
    envelope: {
        attack: any[],
        attackCurve: any[],
        decay: any[],
        decayCurve: any[],
        release: any[],
        releasecurve: any[],
        sustain: any[],
    },
    modulation: {
        type: any[],
    },
    modulationEnvelope: {
        attack: any[],
        attackCurve: any[],
        decay: any[],
        decayCurve: any[],
        release: any[],
        releasecurve: any[],
        sustain: any[],
    },
    modulationIndex: any[],
    octaves: any[],
    pithcDecay: any[],
    resonance: any[],
    noise: {
        fadeIn: any[],
        fadeOut: any[],
        playbackRate: any[],
        type: any[],
    },
    attackNoise: any[],
    dampening: any[],
    release: any[],
    attack: any[],
    baseUrl: any[],
    curve: any[],
    urls: any[]
}

export interface InstrumentModel extends instrument, Document { }

const InstrumentSchema: Schema = new Schema({
    User: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
    volume: Schema.Types.Mixed,
    detune: Schema.Types.Mixed,
    portamento: Schema.Types.Mixed,
    harmonicity: Schema.Types.Mixed,
    oscillator: {
        type: { type: Schema.Types.Mixed },
    },
    envelope: {
        attack: Schema.Types.Mixed,
        attackCurve: Schema.Types.Mixed,
        decay: Schema.Types.Mixed,
        decayCurve: Schema.Types.Mixed,
        release: Schema.Types.Mixed,
        releaseCurve: Schema.Types.Mixed,
        sustain: Schema.Types.Mixed,
    },
    modulation: {
        type: { type: Schema.Types.Mixed },
    },
    modulationEnvelope: {
        attack: Schema.Types.Mixed,
        attackCurve: Schema.Types.Mixed,
        decay: Schema.Types.Mixed,
        decayCurve: Schema.Types.Mixed,
        release: Schema.Types.Mixed,
        releaseCurve: Schema.Types.Mixed,
        sustain: Schema.Types.Mixed,
    },
    modulationIndex: Schema.Types.Mixed,
    octaves: Schema.Types.Mixed,
    pitchDecay: Schema.Types.Mixed,
    resonance: Schema.Types.Mixed,
    noise: {
        fadeIn: Schema.Types.Mixed,
        fadeOut: Schema.Types.Mixed,
        playbackRate: Schema.Types.Mixed,
        type: { type: Schema.Types.Mixed },
    },
    attackNoise: Schema.Types.Mixed,
    dampening: Schema.Types.Mixed,
    curve: Schema.Types.Mixed,
    baseUrl: Schema.Types.Mixed,
    release: Schema.Types.Mixed,
    urls: Schema.Types.Mixed,
}, { timestamps: true })


export default mongoose.model<InstrumentModel>('Instrument', InstrumentSchema);