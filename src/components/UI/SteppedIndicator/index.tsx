import React, { useState, useEffect, WheelEvent, useContext, useCallback } from 'react';
import { propertiesToArray } from '../../../lib/objectDecompose';
// import {} from '../../'
// import styles from './knob.module.scss';
import Knob from './Knob';
import AppContext from '../../../context/AppContext';

interface SteppedIndicator {
    className?: string;
    selected: string;
    titleClassName?: string,
    options: string[];
    ccMouseCalculationCallback: (e: any) => void;
    tabIndex: number,
    valueUpdateCallback: (value: any) => void;
    label: string;
    midiLearn: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, property: string) => void,
    unit: string;
}

export interface indicatorProps {
    wheelMove: (e: WheelEvent) => void,
    titleClassName?: string,
    tabIndex: number,
    captureStart?: (e: React.PointerEvent<SVGSVGElement>) => void,
    valueUpdateCallback: (value: any) => void,
    captureStartDiv?: (e: React.MouseEvent) => void,
    label: string,
    options: string[],
    className?: string,
    unit?: string,
    selected: string;
    display: boolean;
    setDisplay: () => void;
}

const SteppedIndicator: React.FC<SteppedIndicator> = ({
    className,
    ccMouseCalculationCallback,
    tabIndex, 
    valueUpdateCallback,
    label,
    selected,
    titleClassName,
    options,
    midiLearn,
    unit
}) => {

    const appRef = useContext(AppContext);
    const [isMoving, setMovement] = useState(false)
    const [display, setDisplay] = useState(true);
    const [internalValue, setInternal] = useState(15);

    // const [selectedOption, setOption] = useState('xola');
    let shouldRemove = false;

    // const mouseMove = useCallback((e: MouseEvent) => {

    //     if (
    //         ( internalValue === 30 && e.movementY < 0 )
    //         || (internalValue === 0 && e.movementY > 0)
    //     ){
    //         ccMouseCalculationCallback(e);

    //     }
    // }, [ccMouseCalculationCallback]);

    const mouseMove = (e: MouseEvent) => {
        console.log(`calling mouse move, internal value is ${internalValue}, e.movementY is ${e.movementY}, abs movy is ${Math.abs(e.movementY)}`)
        const x = 5 

        if (
            ( internalValue === x * 2 && e.movementY < 0 )
            || (internalValue === 0 && e.movementY > 0)
        ){
            setInternal(x);
            ccMouseCalculationCallback(e);
        } else if (e.movementY !== 0) {
            setInternal(v => v - e.movementY/Math.abs(e.movementY))
        } else if ( internalValue > 2 * x || internalValue < 0){
            setInternal(x);
            ccMouseCalculationCallback(e);
        }

    };

    useEffect(() => {
        const main = appRef.current
        if (isMoving && !shouldRemove) {
            // document.addEventListener('mousemove', mouseMove);
            // document.addEventListener('mouseup', stopDrag);
            // appRef.current.addEventListener('mousemove', mouseMove);
            // appRef.current.addEventListener('mouseup', stopDrag);
            main.addEventListener('mousemove', mouseMove);
            main.addEventListener('mouseup', stopDrag);

            return () => {
                // document.removeEventListener('mousemove', mouseMove);
                // document.removeEventListener('mouseup', stopDrag);
                // appRef.current.removeEventListener('mousemove', mouseMove);
                // appRef.current.removeEventListener('mouseup', stopDrag);
                main.removeEventListener('mousemove', mouseMove);
                main.removeEventListener('mouseup', stopDrag);
            }
        }
    }, [isMoving, appRef, mouseMove, shouldRemove])



    const captureStart = (e: React.PointerEvent<SVGSVGElement>) => {
        if (e.button === 0) {
            setMovement(true);
            setDisplay(false);
            appRef.current.requestPointerLock = appRef.current.requestPointerLock || appRef.current.mozRequestPointerLock;
            appRef.current.exitPointerLock = appRef.current.exitPointerLock || appRef.current.mozExitPointerLock;
            appRef.current.requestPointerLock();
        }
    };

    const captureStartDiv = (e: React.MouseEvent) => {
        setMovement(true);
        setDisplay(false);
    }
    const stopDrag = (e: MouseEvent) => {
        // console.log('should be stopping drag');
        setMovement(false);
        setDisplay(true);
        shouldRemove = true;
        document.exitPointerLock();
    };

    const wheelMove = (e: WheelEvent) => {
        e.persist();
        e.preventDefault();
        if (e.deltaY >= 7) {
            //
        } else if (e.deltaY <= -7) {
            //
        } else if (e.deltaY < 0 && e.deltaY > -7) {
            //
        } else if (e.deltaY < 0 && e.deltaY > -7) {
            //
        }
    };

    function keyHandle(this: Document, e: KeyboardEvent): void {
        let char: string = e.key.toLowerCase();
        if (char === 'arrowdown') {
            //
        } else if (char === 'arrowup') {
            //
        }
    }

    const rotate = (angle: number) => `rotate(${angle} 33.64 33.64)`
    // const mid = (max - min) / 2
    // const rotateBy = rotate(140 * (value - (mid)) / mid);
    // const heightPercentage = `${(86 / (max - min)) * value + 3}%`

    const knob = <Knob
        captureStart={captureStart}
        options={options}
        label={label}
        titleClassName={titleClassName}
        wheelMove={wheelMove}
        className={className}
        selected={selected}
        valueUpdateCallback={valueUpdateCallback}
        unit={unit}
        tabIndex={tabIndex}
        display={display}
        setDisplay={() => setDisplay(state => !state)}
    ></Knob>



    return knob;
}


export default SteppedIndicator;

