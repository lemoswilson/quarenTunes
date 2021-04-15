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
    curveType: curveTypes,
    extra?: 'volume' | 'detune' | 'PAD_0.volume',
): number {
    let r;
    if (extra === 'volume' || extra === 'PAD_0.volume') {
        console.log('extra is volume');
        if (prevValue === -Infinity) {
            if (mouseMovement >= 0) {
                return prevValue
            } else if (mouseMovement < 0) {
                return -100 + (mouseMovement + 1) * 0.3
            }
        } else if (prevValue === -100) {
            if (mouseMovement > 0) {
                return -Infinity
            }
        }

        let volumeDelta = prevValue >= -20 && prevValue <= 6
            ? 0.1
            : 0.3
        // let volumeDelta = 0.1;

        r = prevValue - volumeDelta * mouseMovement
    } else if (extra === 'detune') {
        r = prevValue - 3 * mouseMovement
    } else {
        let c;
        let k = prevValue === 0 ? 0.001 : prevValue

        if (curveType == curveTypes.EXPONENTIAL) {
            c = k * (1 / 10) * mouseMovement;
        } else {
            c = ((max - min) / 127) * mouseMovement;
        }

        r = prevValue - c
        // return r < max && r > min
        //     ? r
        //     : r >= max
        //         ? max
        //         : min
    }

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