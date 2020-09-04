import EventEmitter from 'eventemitter3';

export enum triggEventTypes {
    ADD_TRACK = 'ADD_TRACK',
    REMOVE_TRACK = 'REMOVE_TRACK',
    ADD_PATTERN = 'ADD_PATTERN',
    REMOVE_PATTERN = 'REMOVE_PATTERN',
    DUPLICATE_PATTERN = 'DUPLICATE_PATTERN',
}

export type TriggEvent =
    | {
        event: triggEventTypes.ADD_PATTERN
        pattern: number,
    }
    | {
        event: triggEventTypes.ADD_TRACK
    }
    | {
        event: triggEventTypes.DUPLICATE_PATTERN,
        pattern: number
    }
    | {
        event: triggEventTypes.REMOVE_PATTERN,
        pattern: number
    }
    | {
        event: triggEventTypes.REMOVE_TRACK,
        track: number
    }

type EventType = TriggEvent['event']

export type ExcludeEventKey<K> = K extends "event" ? never : K

export type ExcludeEventField<A> = { [K in ExcludeEventKey<keyof A>]: A[K] }

export type ExtractEventParameters<A, T> = ExcludeEventField<Extract<A, { event: T }>>;

export type ExtractTriggPayload<T> = ExtractEventParameters<TriggEvent, T>

type PayloadType<T> = [T, (payload: ExtractTriggPayload<T>) => void];


const eventEmitter = new EventEmitter();

function on<T extends EventType>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.on(event, fn)
}

function once<T extends EventType>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.once(event, fn);
}

function off<T extends EventType>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.off(event, fn);
}

function emit<T extends EventType>(event: T, payload: ExtractEventParameters<TriggEvent, T>): boolean {
    return eventEmitter.emit(event, payload);
}

const triggEmitter = {
    on: on,
    once: once,
    off: off,
    emit: emit
};

Object.freeze(triggEmitter);

export default triggEmitter;