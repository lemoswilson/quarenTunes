import mongoose, { Schema, Document } from 'mongoose';
import { UserModelType } from './user.model'
import { RecursivePartial } from './instrument.model';

interface effect {
    options: {
        wet: any[],
        frequency: any[],
        type: any[],
        depth: any[],
        baseFrequency: any[],
        octaves: any[],
        filter: {
            Q: any[],
            rolloff: any[],
            type: any[],
        },
        bits: any[],
        order: any[],
        oversample: any[],
        feedback: any[],
        delayTime: any[],
        spread: any[],
        distortion: any[],
        maxDelay: any[],
        dampening: any[],
        roomSize: any[],
        stages: any[],
        phaserQ: any[],
        pitch: any[],
        windowSize: any[],
        width: any[],
        attack: any[],
        release: any[],
        ratio: any[],
        threshold: any[],
        knee: any[],
        high: any,
        low: any,
        lowFrequency: any[],
        highFrequency: any[],
        rolloff: any[],
        smoothing: any[],
    }
}

interface Effect extends RecursivePartial<effect> {
    user: UserModelType['_id'],
    name: string,
    type: string,
}

export interface EffectModel extends Effect, Document { }

const EffectSchema: Schema = new Schema({
    User: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true},
    type: { type: String, required: true},
    options: {
        wet: {type: Schema.Types.Mixed, required: false },
        frequency: {type: Schema.Types.Mixed, required: false },
        type: {type: Schema.Types.Mixed, required: false },
        depth: {type: Schema.Types.Mixed, required: false },
        baseFrequency: {type: Schema.Types.Mixed, required: false },
        octaves: {type: Schema.Types.Mixed, required: false },
        filter: {
            Q: {type: Schema.Types.Mixed, required: false },
            rolloff: {type: Schema.Types.Mixed, required: false },
            type: {type: Schema.Types.Mixed, required: false },
        },
        bits: {type: Schema.Types.Mixed, required: false },
        order: {type: Schema.Types.Mixed, required: false },
        oversample: {type: Schema.Types.Mixed, required: false },
        feedback: {type: Schema.Types.Mixed, required: false },
        delayTime: {type: Schema.Types.Mixed, required: false },
        spread: {type: Schema.Types.Mixed, required: false },
        distortion: {type: Schema.Types.Mixed, required: false },
        maxDelay: {type: Schema.Types.Mixed, required: false },
        dampening: {type: Schema.Types.Mixed, required: false },
        roomSize: {type: Schema.Types.Mixed, required: false },
        stages: {type: Schema.Types.Mixed, required: false },
        phaserQ: {type: Schema.Types.Mixed, required: false },
        pitch: {type: Schema.Types.Mixed, required: false },
        windowSize: {type: Schema.Types.Mixed, required: false },
        width: {type: Schema.Types.Mixed, required: false },
        attack: {type: Schema.Types.Mixed, required: false },
        release: {type: Schema.Types.Mixed, required: false },
        ratio: {type: Schema.Types.Mixed, required: false },
        threshold: {type: Schema.Types.Mixed, required: false },
        knee: {type: Schema.Types.Mixed, required: false },
        high: {type: Schema.Types.Mixed, required: false },
        low: {type: Schema.Types.Mixed, required: false },
        lowFrequency: {type: Schema.Types.Mixed, required: false },
        highFrequency: {type: Schema.Types.Mixed, required: false },
        rolloff: {type: Schema.Types.Mixed, required: false },
        smoothing: {type: Schema.Types.Mixed, required: false },
    }
}, { timestamps: true })


export default mongoose.model<EffectModel>('Effect', EffectSchema);