import EventEmitter from 'eventemitter3';
import { ExtractEventParameters } from './triggEmitter';

export enum menuEmitterEventTypes {
    OPEN = "OPEN",
    CLOSE = "CLOSE",
}

type MenuEvents =
    | {
        event: menuEmitterEventTypes.OPEN,
        id: string, 
        close: () => void,
    }
    | {
        event: menuEmitterEventTypes.CLOSE,
    }

type MenuTypes = MenuEvents['event'];

export type ExtractMenuPayload<T> = ExtractEventParameters<MenuEvents, T>
type PayloadType<T> = [T, (payload: ExtractMenuPayload<T>) => void];

const eventEmitter = new EventEmitter();


function on<T extends MenuTypes>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.on(event, fn)
}

function once<T extends MenuTypes>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.once(event, fn);
}

function off<T extends MenuTypes>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.off(event, fn);
}

function emit<T extends MenuTypes>(event: T, payload: ExtractEventParameters<MenuEvents, T>): boolean {
    return eventEmitter.emit(event, payload);
}

const MenuEmitter = {
    on: on,
    once: once,
    off: off,
    emit: emit
};

Object.freeze(MenuEmitter);

export default MenuEmitter;