import EventEmitter from 'eventemitter3';

export enum triggEventTypes {
    ADD_TRACK = 'ADD_TRACK',
    REMOVE_TRACK = 'REMOVE_TRACK',
    ADD_PATTERN = 'ADD_PATTERN',
    REMOVE_PATTERN = 'REMOVE_PATTERN'
}

const eventEmitter = new EventEmitter();

const triggEmitter = {
    on: (event: triggEventTypes, fn: () => any | undefined) => eventEmitter.on(event, fn),
    once: (event: triggEventTypes, fn: () => any | undefined) => eventEmitter.once(event, fn),
    off: (event: triggEventTypes, fn: () => any | undefined) => eventEmitter.off(event, fn),
    emitt: (event: triggEventTypes, payload: { track?: number, pattern?: number }) => eventEmitter.emit(event, payload)
};

Object.freeze(triggEmitter);

export default triggEmitter;