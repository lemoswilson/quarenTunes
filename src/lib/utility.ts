import { indicators } from "../containers/Track/defaults";

export function range(size: number, startAt: number = 0): number[] {
    return [...Array(size).keys()].map(i => i + startAt);
};

export function timeObjFromEvent(s: number, ev: any): any {
    return {
        '16n': s,
        '128n': ev.offset ? ev.offset : 0,
    };
}

export function extendObj(entry: any, extension: any): any {
    return {
        ...entry,
        ...extension
    };
};

export function typeMovement(ind: indicators, e: any): number {
    if (ind === indicators.HORIZONTAL_SLIDER)
        return - e.movementX
    else
        return e.movementY
};

// let time = {
//     '16n': s,
//     '128n': ev.offset ? ev.offset : 0,
// };