import mongoose, { Schema, Document } from 'mongoose';
import { UserModelType } from './user.model'

export declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<RecursivePartial<U>> : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};



interface instrument {
    options: {
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
        baseUrl: string,
        curve: any[],
        urls: {[key: string]: any},
        name: string,
    }
}

interface Instrument extends RecursivePartial<instrument> {
    user: UserModelType['_id'],
    name: string,
    type: string,
}

export interface InstrumentModel extends  Instrument, Document { }

const InstrumentSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true },
    name: {type: String, required: true},
    type: {type: String, required: true},
    options: {
        name: { type: String, required: true},
        volume: { type: Schema.Types.Mixed, required: false },
        detune: {type: Schema.Types.Mixed, required: false },
        portamento: {type: Schema.Types.Mixed, required: false },
        harmonicity: {type: Schema.Types.Mixed, required: false },
        oscillator: {
            type: { type: Schema.Types.Mixed },
        },
        envelope: {
            attack: {type: Schema.Types.Mixed, required: false },
            attackCurve: {type: Schema.Types.Mixed, required: false },
            decay: {type: Schema.Types.Mixed, required: false },
            decayCurve: {type: Schema.Types.Mixed, required: false },
            release: {type: Schema.Types.Mixed, required: false },
            releaseCurve: {type: Schema.Types.Mixed, required: false },
            sustain: {type: Schema.Types.Mixed, required: false },
        },
        modulation: {
            type: { type: Schema.Types.Mixed, required: false },
        },
        modulationEnvelope: {
            attack: {type: Schema.Types.Mixed, required: false },
            attackCurve: {type: Schema.Types.Mixed, required: false },
            decay: {type: Schema.Types.Mixed, required: false },
            decayCurve: {type: Schema.Types.Mixed, required: false },
            release: {type: Schema.Types.Mixed, required: false },
            releaseCurve: {type: Schema.Types.Mixed, required: false },
            sustain: {type: Schema.Types.Mixed, required: false },
        },
        modulationIndex: {type: Schema.Types.Mixed, required: false },
        octaves: {type: Schema.Types.Mixed, required: false },
        pitchDecay: {type: Schema.Types.Mixed, required: false },
        resonance: {type: Schema.Types.Mixed, required: false },
        noise: {
            fadeIn: {type: Schema.Types.Mixed, required: false },
            fadeOut: {type: Schema.Types.Mixed, required: false },
            playbackRate: {type: Schema.Types.Mixed, required: false },
            type: { type: Schema.Types.Mixed },
        },
        attackNoise: {type: Schema.Types.Mixed, required: false },
        dampening: {type: Schema.Types.Mixed, required: false },
        curve: {type: Schema.Types.Mixed, required: false },
        baseUrl: {type: Schema.Types.Mixed, required: false },
        release: {type: Schema.Types.Mixed, required: false },
        urls: {type: Schema.Types.Mixed, required: false },
    }
}, { timestamps: true })


export default mongoose.model<InstrumentModel>('Instrument', InstrumentSchema);