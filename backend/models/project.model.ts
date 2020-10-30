import mongoose, { Schema, Document } from 'mongoose';
import { UserModelType } from './user.model';
import { InstrumentModel } from './instrument.model';
import { EffectModel } from './effect.model';
import { Song } from '../../src/store/Arranger'
import { Pattern } from '../../src/store/Sequencer'
import { midi, instrumentTypes, effectTypes } from '../../src/store/Track';

interface SongWithId extends Song {
    id: number,
}

interface fxinfo {
    fx: effectTypes;
    id: number;
    options: EffectModel['_id'];
}

interface trackinfo {
    instrument: instrumentTypes;
    id: number;
    midi: midi;
    fx: fxinfo[];
    fxCounter: number;
    options: InstrumentModel['_id'];
}

interface Track {
    tracks: trackinfo[];
    selectedTrack: number;
    trackCount: number;
    instrumentCounter: number;
}

export interface Project {
    User: UserModelType['_id'],
    Arranger: {
        mode: string;
        following: boolean;
        selectedSong: number;
        counter: number;
        patternTracker: number[];
        songs: SongWithId[]
    },
    Sequencer: {
        patterns: Pattern[],
        activePattern: number,
        step: undefined | number,
        counter: number,
        override: boolean,
        quantizeRecording: boolean,
    },
    Track: Track,
    Transport: {
        bpm: number,
    }
};

const EventSchema: Schema = new Schema({
    pattern: { type: Number, required: true },
    repeat: { type: Number, required: true },
    mute: { type: [Number], required: true },
    id: { type: Number, required: true },
});

const SongSchema: Schema = new Schema({
    name: { type: String, required: true },
    events: { type: [EventSchema], required: true },
    counter: { type: Number, required: true },
    timer: { type: [Schema.Types.Mixed], required: true },
    id: { type: Number, required: true },
});

const ArrangerSchema: Schema = new Schema({
    mode: { type: String, required: true },
    following: { type: Boolean, required: true },
    selectedSong: { type: Number, required: true },
    counter: { type: Number, required: true },
    patternTracker: { type: [Number], required: true },
    songs: { type: [SongSchema], required: true }
});

const SeqEventsSchema: Schema = new Schema({
    instrument: {},
    fx: {},
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
        device: { type: Schema.Types.Mixed, required: true },
        channel: { type: Schema.Types.Mixed, required: true },
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


interface ProjectModel extends Project, Document { }

const ProjectSchema: Schema = new Schema({
    User: { type: Schema.Types.ObjectId, required: true, unique: true },
    Arranger: { type: ArrangerSchema, required: true },
    Sequencer: { type: SequencerSchema, required: true },
    Track: { type: TrackSchema, required: true },
    Transport: {
        bpm: { type: Number, required: true }
    }
}, { timestamps: true })


export default mongoose.model<ProjectModel>('Project', ProjectSchema);