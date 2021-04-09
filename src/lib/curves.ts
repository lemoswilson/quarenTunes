import { curveTypes } from "../containers/Track/defaults";

export default function valueFromCC(value: number, min: number, max: number, curveType: curveTypes): number {
    return curveType === curveTypes.EXPONENTIAL
        ? exponentialScale(value, min, max)
        : linearScale(value, min, max);
};

export function optionFromCC(value: number, options: any[]): string {
    let l = options.length
    return options[Math.round(value * l)];
};

export function steppedCalc(mouseMovement: number, parameterOptions: string[], stateValue: string) {
    const idx = parameterOptions.findIndex(p => p === stateValue);
    // console.log('mouseMovement', mouseMovement);
    if (mouseMovement <= 0 && idx !== parameterOptions.length - 1) {
        return parameterOptions[idx + 1];
    } else if (mouseMovement >= 0 && idx !== 0) {
        return parameterOptions[idx - 1];
    } else {
        return parameterOptions[idx];
    }
}

export function valueFromMouse(
    prevValue: number,
    mouseMovement: number,
    min: number,
    max: number,
    curveType: curveTypes
): number {
    let c;
    let k = prevValue === 0 ? 0.001 : prevValue

    if (curveType == curveTypes.EXPONENTIAL) {
        c = k * (1 / 10) * mouseMovement;
    } else {
        c = ((max - min) / 127) * mouseMovement;
    }

    let r = prevValue - c
    return r < max && r > min
        ? r
        : r >= max
            ? max
            : min

}

function getBaseLog(base: number, number: number): number {
    return Math.log(number) / Math.log(base)
};

function linearScale(value: number, min: number, max: number): number {
    return (min - max) * value + min
};

function exponentialScale(value: number, min: number, max: number): number {
    value = 127 * value;
    let c = getBaseLog(127, max - min);
    return min + value ** c;
};