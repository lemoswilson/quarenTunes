import React, { useState, useEffect, WheelEvent, useContext, MutableRefObject } from 'react';
import { curveTypes } from '../../../containers/Track/defaults';
import { propertiesToArray } from '../../../lib/objectDecompose';
// import styles from './knob.module.scss';
import Knob from './Knob';
import Slider from './Slider';
import appContext from '../.././../context/AppContext';

interface continuousIndicator {
    className?: string;
    value: number | '*';
    min: number;
    max: number;
    ccMouseCalculationCallback: (e: any) => void;
    valueUpdateCallback: (value: any) => void;
    label: string;
    midiLearn: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, property: string) => void,
    type: 'knob' | 'slider';
    detail?: 'port' | 'detune' | 'envelopeZero' | 'volume'
    unit: string;
    selectedLock: boolean,
    curve?: curveTypes;
}

export interface indicatorProps {
    wheelMove: (e: WheelEvent) => void,
    curve?: curveTypes,
    captureStart?: (e: React.PointerEvent<SVGSVGElement>) => void,
    captureStartDiv?: (e: React.MouseEvent) => void,
    label: string,
    selectedLock: boolean,
    indicatorData: string,
    className?: string,
    unit?: string,
    value: number | '*';
    display: boolean;
    setDisplay: () => void;
}

const ContinuousIndicator: React.FC<continuousIndicator> = ({
    className,
    curve,
    ccMouseCalculationCallback,
    valueUpdateCallback,
    label,
    selectedLock,
    max,
    min,
    value,
    detail,
    midiLearn,
    type,
    unit
}) => {
    const [isMoving, setMovement] = useState(false)
    const [display, setDisplay] = useState(true);
    const appRef = useContext<MutableRefObject<HTMLDivElement>>(appContext);
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
            // appRef.current.exitPointerLock = appRef.current.exitPointerLock || appRef.current.mozExitPointerLock;
            appRef.current.requestPointerLock();
            setMovement(true);
            setDisplay(false);
        }
    };

    const captureStartDiv = (e: React.MouseEvent) => {
        setMovement(true);
        appRef.current.requestPointerLock();
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
        // e.preventDefault();
        const k = {
            movementY: e.deltaY <= 7 && e.deltaY >= -7
                ? e.deltaY
                : e.deltaY < -7
                    ? -7
                    : 7
        }
        // console.log('moving wheel', k)
        if (k.movementY) {
            ccMouseCalculationCallback(k)
        }
    };

    function keyHandle(this: Document, e: KeyboardEvent): void {
        let char: string = e.key.toLowerCase();
        if (char === 'arrowdown') {
            // valueUpdateCallback(value - curveFunction(value));
        } else if (char === 'arrowup') {
            // valueUpdateCallback(value + curveFunction(value));
        }
    }

    const rrr = () => {
        let ccc = min === 0 ? 0.01 : min
        if (typeof value === 'number') {
            if (curve === curveTypes.LINEAR && (detail === 'detune' && type === 'knob')) {
                return rotate(140 * ((value + 1200) - (mid + 1200) / (mid + 1200)))
            } else if (curve === curveTypes.EXPONENTIAL && (detail === 'envelopeZero' || detail === 'port')) {
                // return value === 0 ? rotate(-140) : rotate(280 * ((Math.log(value / min) / Math.log(max / min)) - 0.5))
                return value === 0 ? rotate(-140) : rotate(280 * ((Math.log(value / ccc) / Math.log(max / ccc)) - 0.5))
            } else if (label === 'volume') {
                return value === -Infinity
                    ? '3%'
                    : `${(86 / (max - ccc) * value + 101)}`;
            } else if (detail === 'port') {
                return value === 0 ? rotate(-140) : rotate(280 * ((Math.log(value / ccc) / Math.log(max / ccc)) - 0.5))
            } else if ((curve === curveTypes.LINEAR || !curve) && type === 'knob') {
                return rotate(140 * (value - (mid)) / mid)
            } else if ((curve === curveTypes.LINEAR || !curve) && type === 'slider') {
                return `${(86 / (max - ccc)) * value + 3}%`;
            } else {
                return rotate(280 * ((Math.log(value / ccc) / Math.log(max / ccc)) - 0.5))
            }
        }

    }

    const rotate = (angle: number) => `rotate(${angle} 33.64 33.64)`
    const mid = (max - min) / 2
    // const rotateBy = curve === curveTypes.LINEAR || !curve
    //     ? rotate(140 * (value - (mid)) / mid)
    //     : rotate(280 * ((Math.log(value / min) / Math.log(max / min)) - 0.5));
    const rotateBy =
        value === '*'
            ? rotate(0)
            : detail === 'volume'
                ? rotate((((value + 101) - 54) / 53) * 140)
                : curve === curveTypes.LINEAR || !curve
                    ? rotate(140 * (value - (mid)) / mid)
                    : rotate(280 * ((Math.log(value / min) / Math.log(max / min)) - 0.5));
    // const rotateBy = rotate(0)
    const heightPercentage = value === "*" ? '40%' : `${(86 / (max - min)) * value + 3}%`

    const knob = <Knob
        captureStart={captureStart}
        // indicatorData={rotateBy}
        indicatorData={
            detail === 'detune'
                ? rotate((Number(value) / 1200) * 140)
                : rotateBy}
        // indicatorData={detail === 'detune' ? rotate((0) * 140) : rotateBy}
        // indicatorData={rrr()}
        label={label}
        wheelMove={wheelMove}
        className={className}
        selectedLock={selectedLock}
        value={value}
        unit={unit}
        display={display}
        curve={curve}
        setDisplay={() => setDisplay(state => !state)}
    ></Knob>

    // wheelMove={wheelMove}>
    const slider = <Slider
        value={value}
        curve={curve}
        unit={unit}
        selectedLock={selectedLock}
        wheelMove={wheelMove}
        display={display}
        className={className}
        captureStartDiv={captureStartDiv}
        // indicatorData={detail === 'volume' ? rrr() : heightPercentage}
        indicatorData={detail === 'volume' ? `${(1 / 106) * ((83 * Number(value)) + 8618)}%` : heightPercentage}
        // indicatorData={rrr()}
        label={label}
        setDisplay={() => setDisplay(state => !state)} />

    const indicator = type === 'knob' ? knob : slider;

    return indicator
}


export default ContinuousIndicator;

