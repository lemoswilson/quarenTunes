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

export function valueFromMouse(
    prevValue: number,
    mouseMovement: number,
    min: number,
    max: number,
    curveType: curveTypes
): number {
    if (curveType == curveTypes.EXPONENTIAL) {
        let c = getBaseLog(127, max - min);
        let x = (prevValue - min) ** (-c);
        let s = (c - 1) * x ** (c - 1)

        if (prevValue > max) {
            return max
        } else if (prevValue < min) {
            return min
        }

        if (mouseMovement === 0) {
            return prevValue
        } else if (mouseMovement > 0) {
            mouseMovement = mouseMovement - 1
            return valueFromMouse(prevValue - s, mouseMovement, min, max, curveType)
        } else {
            mouseMovement = mouseMovement + 1
            return valueFromMouse(prevValue + s, mouseMovement, min, max, curveType)
        }
    } else {
        let c = (max - min) / 127
        return prevValue - c * mouseMovement
    }
}

function getBaseLog(x: number, y: number): number {
    return Math.log(y) / Math.log(x)
};

function linearScale(value: number, min: number, max: number): number {
    return (min - max) * value + min
};

function exponentialScale(value: number, min: number, max: number): number {
    value = 127 * value;
    let c = getBaseLog(127, max - min);
    return min + value ** c;
};