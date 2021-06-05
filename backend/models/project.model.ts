import mongoose, { Schema, Document } from 'mongoose';
import { UserModelType } from './user.model';
// import { initialState as trackInit } from '../../src/store/Track';
// import { initialState as seqInit } from '../../src/store/Track';

export interface Project {
    user: UserModelType['_id'],
    sequencer: {
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
    track: {
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
                name: string,
            },
            fxCounter: number,
            options: any,
            name: string
        }[],
    },
    name: string,
};

export interface ProjectModel extends Document, Project {}

const SeqEventsSchema: Schema = new Schema({
    instrument: { type: Schema.Types.Mixed, required: false },
    fx: { type: Schema.Types.Mixed, required: false},
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
    patterns: { type: [PatternSchema], required: true },
    activePattern: { type: Number, required: true },
    step: { type: Schema.Types.Mixed, required: true },
    counter: { type: Number, required: true },
})

const FxInfoSchema: Schema = new Schema({
    fx: { type: String, required: true },
    id: { type: Number, required: true },
    options: { type: Schema.Types.Mixed, required: true },
    name: {type: String, required: true}
});

const TrackInfoSchema: Schema = new Schema({
    instrument: { type: String, required: true },
    id: { type: Number, required: true },
    midi: {
        device: { type: String, required: true },
        channel: { type: Schema.Types.Mixed, required: true },
    },
    fx: { type: [FxInfoSchema], required: true },
    fxCounter: { type: Number, required: true },
    options: { type: Schema.Types.Mixed, required: true },
    name: {type: String, required: true}
});

const TrackSchema: Schema = new Schema({
    selectedTrack: { type: Number, required: true },
    trackCount: { type: Number, required: true },
    instrumentCounter: { type: Number, required: true },
    tracks: { type: [TrackInfoSchema], required: true },
});


const ProjectSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true },
    sequencer: { type: SequencerSchema, required: true },
    track: { type: TrackSchema, required: true },
    name: { type: String, required: true }
}, { timestamps: true })


export default mongoose.model<ProjectModel>('Project', ProjectSchema);

export const defaultProject = {
    track: {"instrumentCounter":0,"selectedTrack":0,"trackCount":1,"tracks":[{"instrument":"MetalSynth","options":{"volume":[0,[-100,6],"dB","slider","linear"],"detune":[0,[-1200,1200],"c","knob","linear"],"portamento":[0,[0.01,3],"s","knob","linear"],"envelope":{"attackCurve":["linear",["linear","exponential"],null,"CURVE_TYPE"],"decayCurve":["linear",["linear","exponential"],null,"CURVE_TYPE"],"releaseCurve":["linear",["linear","exponential"],null,"CURVE_TYPE"],"attack":[0.001,[0.001,10],"s","knob","exponential"],"decay":[1.4,[0.001,10],"s","knob","exponential"],"release":[0.2,[0.001,10],"s","knob","exponential"],"sustain":[0,[0,1],"","knob","linear"]},"harmonicity":[5.1,[0.1,10],"","slider","linear"],"modulationIndex":[32,[0.01,100],"","slider","exponential"],"octaves":[1.5,[0,8],"","knob","linear"],"resonance":[4000,[20,7000],"hz","knob","exponential"]},"id":0,"fx":[{"fx":"Compressor","id":0,"options":{"attack":[0.003,[0,1],"s","knob","linear"],"release":[0.25,[0,1],"s","knob","linear"],"ratio":[4,[1,20],":1","knob","exponential"],"threshold":[-24,[-100,0],"dB","knob","linear"],"knee":[30,[0,40],"dB","knob","linear"]}}],"fxCounter":0,"midi":{"device":"onboardKey","channel":"all"}}]},
    sequencer: {"activePattern":0,"counter":1,"patterns":{"0":{"name":"pattern 1","patternLength":16,"tracks":[{"events":[{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0},{"instrument":{"note":[]},"fx":[{}],"offset":0}],"length":16,"noteLength":"16n","page":0,"selected":[],"velocity":60,"fxCount":1}]}},"step":0}
}