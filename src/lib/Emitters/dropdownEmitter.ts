import EventEmitter from 'eventemitter3';
import { ExtractEventParameters } from './triggEmitter';

export enum dropdownEventTypes {
    OPEN = "OPEN",
    ESCAPE = "ESCAPE",
    REMOVE = "REMOVE",
    SAVE_DEVICE = "SAVE_DEVICE",
}

type DropdownEvents =
    | {
        event: dropdownEventTypes.ESCAPE,
    }
    | {
        event: dropdownEventTypes.OPEN,
        id: string,
        openClose: () => void,
    }
    | {
        event: dropdownEventTypes.REMOVE,
        id: string,
    } 
    | {
        event: dropdownEventTypes.SAVE_DEVICE,
        trackIndex: number,
        fxIndex?: number,
    }

type DropdownType = DropdownEvents['event'];

export type ExtractDropdownPayload<T> = ExtractEventParameters<DropdownEvents, T>
type PayloadType<T> = [T, (payload: ExtractDropdownPayload<T>) => void];

const eventEmitter = new EventEmitter();


function on<T extends DropdownType>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.on(event, fn)
}

function once<T extends DropdownType>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.once(event, fn);
}

function off<T extends DropdownType>(...[event, fn]: PayloadType<T>): EventEmitter<string | symbol, any> {
    return eventEmitter.off(event, fn);
}

function emit<T extends DropdownType>(event: T, payload: ExtractEventParameters<DropdownEvents, T>): boolean {
    return eventEmitter.emit(event, payload);
}

const dropdownEmitter = {
    on: on,
    once: once,
    off: off,
    emit: emit
};

Object.freeze(dropdownEmitter);

export default dropdownEmitter;