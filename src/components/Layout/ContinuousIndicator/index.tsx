import React, { useState, useEffect, WheelEvent } from 'react';
import { propertiesToArray } from '../../../lib/objectDecompose';
// import styles from './knob.module.scss';
import Knob from './Knob';
import Slider from './Slider';

interface continuousIndicator {
    className?: string;
    value: number;
    min: number;
    max: number;
    ccMouseCalculationCallback: (e: any) => void;
    valueUpdateCallback: (value: any) => void;
    curveFunction: (input: number) => number;
    label: string;
    midiLearn: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, property: string) => void,
    type: 'knob' | 'slider';
    unit: string;
}

export interface indicatorProps {
    wheelMove: (e: WheelEvent) => void,
    captureStart?: (e: React.PointerEvent<SVGSVGElement>) => void,
    captureStartDiv?: (e: React.MouseEvent) => void,
    label: string,
    indicatorData: string,
    className?: string,
    unit?: string,
    value: number;
    display: boolean;
    setDisplay: () => void;
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
    type,
    unit
}) => {
    const [isMoving, setMovement] = useState(false)
    const [display, setDisplay] = useState(true);
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
            setDisplay(false);
        }
    };

    const captureStartDiv = (e: React.MouseEvent) => {
        setMovement(true);
        setDisplay(false);
    }
    const stopDrag = (e: MouseEvent) => {
        document.exitPointerLock();
        setMovement(false);
        setDisplay(true);
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
        value={value}
        unit={unit}
        display={display}
        setDisplay={() => setDisplay(state => !state)}
    ></Knob>

    const slider = <Slider
        value={value}
        unit={unit}
        display={display}
        className={className}
        captureStartDiv={captureStartDiv}
        indicatorData={heightPercentage}
        label={label}
        setDisplay={() => setDisplay(state => !state)}
        wheelMove={wheelMove}>
        {/* value={value} */}
        {/* unit={unit} */}
    </Slider>

    const indicator = type === 'knob' ? knob : slider;

    return indicator
}


export default ContinuousIndicator;

