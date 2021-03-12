import React, { useState, useEffect, WheelEvent } from 'react';
import { propertiesToArray } from '../../../lib/objectDecompose';
// import styles from './knob.module.scss';
import Knob from './Knob';
import Slider from './Slider';

interface continuousIndicator {
    className: string;
    value: number;
    min: number;
    max: number;
    ccMouseCalculationCallback: (e: any) => void;
    valueUpdateCallback: (value: any) => void;
    curveFunction: (input: number) => number;
    label: string;
    midiLearn: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, property: string) => void,
    type: 'knob' | 'slider';
}

export interface indicatorProps {
    wheelMove: (e: WheelEvent) => void,
    captureStart: (e: React.PointerEvent<SVGSVGElement>) => void,
    label: string,
    indicatorData: string,
    className: string,
}

const ContinuousIndicator: React.FC<continuousIndicator> = ({
    className,
    ccMouseCalculationCallback,
    valueUpdateCallback,
    curveFunction,
    label,
    max,
    min,
    value,
    midiLearn,
    type
}) => {
    const [isMoving, setMovement] = useState(false)
    let shouldRemove = false;

    useEffect(() => {
        if (isMoving && !shouldRemove) {
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', stopDrag);

            return () => {
                document.removeEventListener('mousemove', mouseMove);
                document.removeEventListener('mouseup', stopDrag);
            }
        }
    }, [isMoving])

    const mouseMove = (e: MouseEvent) => {
        ccMouseCalculationCallback(e);
    };

    const captureStart = (e: React.PointerEvent<SVGSVGElement>) => {
        if (e.button === 0) {
            setMovement(true);
        }
    };
    const stopDrag = (e: MouseEvent) => {
        document.exitPointerLock();
        setMovement(false);
        shouldRemove = true;
    };

    const wheelMove = (e: WheelEvent) => {
        e.persist();
        e.preventDefault();
        if (e.deltaY >= 7) {
            value + 7 * curveFunction(value) < max
                ? valueUpdateCallback(value + 7 * curveFunction(value))
                : valueUpdateCallback(max);
        } else if (e.deltaY <= -7) {
            value - 7 * curveFunction(value) > min
                ? valueUpdateCallback(value - 7 * curveFunction(value))
                : valueUpdateCallback(min)
        } else if (e.deltaY < 0 && e.deltaY > -7) {
            value + e.deltaY * curveFunction(value) < max
                ? valueUpdateCallback(value + e.deltaY * curveFunction(value))
                : valueUpdateCallback(max)
        } else if (e.deltaY < 0 && e.deltaY > -7) {
            value - e.deltaY * curveFunction(value) > min
                ? valueUpdateCallback(value - e.deltaY * curveFunction(value))
                : valueUpdateCallback(min)
        }
    };

    function keyHandle(this: Document, e: KeyboardEvent): void {
        let char: string = e.key.toLowerCase();
        if (char === 'arrowdown') {
            valueUpdateCallback(value - curveFunction(value));
        } else if (char === 'arrowup') {
            valueUpdateCallback(value + curveFunction(value));
        }
    }

    const rotate = (angle: number) => `rotate(${angle} 33.64 33.64)`
    const mid = (max - min) / 2
    const rotateBy = rotate(140 * (value - (mid)) / mid);
    const heightPercentage = `${(86 / (max - min)) * value + 3}%`

    const knob = <Knob
        captureStart={captureStart}
        indicatorData={rotateBy}
        label={label}
        wheelMove={wheelMove}
        className={className}
    ></Knob>

    const slider = <Slider
        className={className}
        captureStart={captureStart}
        indicatorData={heightPercentage}
        label={label}
        wheelMove={wheelMove}>
    </Slider>

    const indicator = type === 'knob' ? knob : slider;

    return indicator
}


export default ContinuousIndicator;

