import EventEmitter from 'eventemitter3';
import { toneEffects } from '../store/Track';
import { PolySynth } from 'tone';
import { ExtractEventParameters } from './triggEmitter'

export enum trackEventTypes {
    ADD_INSTRUMENT = "ADD_INSTRUMENT",
    REMOVE_INSTRUMENT = "REMOVE_INSTRUMENT",
    CHANGE_INSTRUMENT = "CHANGE_INSTRUMENT",
    ADD_EFFECT = "ADD_EFFECT",
    CHANGE_EFFECT = "CHANGE_EFFECT",
    CHANGE_EFFECT_INDEX = "CHANGE_EFFECT_INDEX",
    REMOVE_EFFECT = "REMOVE_EFFECT",
};

export type TrackEvent =
    | {
        event: trackEventTypes.ADD_EFFECT,
        trackIndex: number,
        effect: toneEffects,
        effectIndex: number,
    }
    | {
        event: trackEventTypes.ADD_INSTRUMENT,
        trackIndex: number,
        instrument: any,
        // instrument: PolySynth,
    }
    | {
        event: trackEventTypes.CHANGE_EFFECT,
        trackId: number,
        effect: toneEffects,
        effectsIndex: number,
    }
    | {
        event: trackEventTypes.CHANGE_EFFECT_INDEX,
        trackIndex: number,
        from: number,
        to: number,
    }
    | {
        event: trackEventTypes.CHANGE_INSTRUMENT,
        trackIndex: number,
        instrument: any,
        // instrument: PolySynth,
    }
    | {
        event: trackEventTypes.REMOVE_EFFECT,
        trackIndex: number,
        effectsIndex: number,
    }
    | {
        event: trackEventTypes.REMOVE_INSTRUMENT,
        trackIndex: number,
    }

type EventType = TrackEvent['event']

export type ExtractTrackPayload<T> = ExtractEventParameters<TrackEvent, T>

type PayloadType<T> = [T, (payload: ExtractTrackPayload<T>) => void];

const eventEmitter = new EventEmitter();

export interface toneRefsPayload {
    instrument?: PolySynth,
    trackId?: number,
    effectsIndex?: number,
    effect?: toneEffects,
    from?: number,
    to?: number,
}

function on<T extends EventType>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.on(event, fn)
}

function once<T extends EventType>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.once(event, fn);
}

function off<T extends EventType>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.off(event, fn);
}

function emit<T extends EventType>(event: T, payload: ExtractEventParameters<TrackEvent, T>): boolean {
    return eventEmitter.emit(event, payload);
}

const toneRefsEmitter = {
    on: on,
    once: once,
    off: off,
    emit: emit,
}

Object.freeze(toneRefsEmitter);

export default toneRefsEmitter;