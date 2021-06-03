import mongoose, { Schema, Document } from 'mongoose';
import { UserModelType } from './user.model';

export interface Project {
    user: UserModelType['_id'],
    Sequencer: {
        patterns: {
            [key: number]: {
                name: string,
                patternLength: number,
                tracks: {
                    length: number,
                    velocity: number,
                    noteLength: number | string,
                    events: {
                        instrument: any,
                        fx: any[],
                        offset: number,
                    },
                    page: number,
                    selected: number[],
                },
                patternId: number,
            }
        },
        activePattern: number,
        step: number,
        counter: number,
    },
    Track: {
        selectedTrack: number,
        trackCount: number,
        instrumentCounter: number,
        tracks: {
            instrument: string,
            id: number,
            midi: {
                device?: string,
                channel?: number,
            },
            fx: {
                fx: string,
                id: number,
                options: any,
            },
            fxCounter: number,
            options: any
        }[],
    },
    name: string,
};

export interface ProjectModel extends Document, Project {}

const SeqEventsSchema: Schema = new Schema({
    instrument: { type: String, required: false },
    fx: { type: String, required: false},
    offset: { type: Number, required: true }
});

const TrSchema: Schema = new Schema({
    length: { type: Number, required: true },
    velocity: { type: Number, required: true },
    noteLength: { type: Schema.Types.Mixed, required: true },
    events: { type: [SeqEventsSchema], required: true },
    page: { type: Number, required: true },
    selected: { type: [Number], required: true }
});

const PatternSchema: Schema = new Schema({
    name: { type: String, required: true },
    patternLength: { type: Number, required: true },
    tracks: { type: [TrSchema], required: true },
    patternId: { type: Number, required: true },
});

const SequencerSchema: Schema = new Schema({
    patterns: { type: [{key: Number, value: PatternSchema}], required: true },
    activePattern: { type: Number, required: true },
    step: { type: Schema.Types.Mixed, required: true },
    counter: { type: Number, required: true },
    override: { type: Boolean, required: true },
    quantizeRecording: { type: Boolean, required: true }
})

const FxInfoSchema: Schema = new Schema({
    fx: { type: String, required: true },
    id: { type: Number, required: true },
    options: { type: [Schema.Types.ObjectId], required: true }
});

const TrackInfoSchema: Schema = new Schema({
    instrument: { type: String, required: true },
    id: { type: Number, required: true },
    midi: {
        device: { type: String, required: true },
        channel: { type: Number, required: true },
    },
    fx: { type: [FxInfoSchema], required: true },
    fxCounter: { type: Number, required: true },
    options: { type: Schema.Types.ObjectId, required: true }
});

const TrackSchema: Schema = new Schema({
    selectedTrack: { type: Number, required: true },
    trackCount: { type: Number, required: true },
    instrumentCounter: { type: Number, required: true },
    tracks: { type: [TrackInfoSchema], required: true },
});


const ProjectSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, unique: true },
    Sequencer: { type: SequencerSchema, required: true },
    Track: { type: TrackSchema, required: true },
    name: { type: String, required: true }
}, { timestamps: true })


export default mongoose.model<ProjectModel>('Project', ProjectSchema);