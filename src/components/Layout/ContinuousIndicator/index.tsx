import React, { useState, useEffect, WheelEvent, useContext, MutableRefObject, MouseEvent as ME, FormEvent, useRef } from 'react';
import { curveTypes } from '../../../containers/Track/defaults';
import { propertiesToArray } from '../../../lib/objectDecompose';
// import styles from './knob.module.scss';
import Knob from './Knob';
import Slider from './Slider';
import appContext from '../.././../context/AppContext';
import MenuContext from '../../../context/MenuContext';
import MenuEmitter, { menuEmitterEventTypes } from '../../../lib/MenuEmitter';

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
    indicatorId: string,
    ccMap?: any,
}

export interface indicatorProps {
    wheelMove: (e: WheelEvent) => void,
    curve?: curveTypes,
    captureStart?: (e: React.PointerEvent<SVGSVGElement>) => void,
    captureStartDiv?: (e: React.MouseEvent) => void,
    label: string,
    selectedLock: boolean,
    indicatorData: string,
    min: number,
    max: number,
    className?: string,
    unit?: string,
    value: number | '*';
    display: boolean;
    onSubmit: (e: FormEvent) => void,
    onBlur: (e: FormEvent) => void,
    setDisplay: () => void;
    input?: boolean,
    toggleInput: (ref?: MutableRefObject<HTMLInputElement | null>) => void,
    contextMenu?: boolean,
    valueUpdateCallback: (value: any) => void,
    onContextMenu: (e: ME) => void,
    menuOptions: any[],
    MenuPosisiton?: {
        left: number,
        top: number,
    } 
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
    ccMap,
    type,
    unit,
    indicatorId
}) => {
    const [isMoving, setMovement] = useState(false)
    const [display, setDisplay] = useState(true);
    const appRef = useContext<MutableRefObject<HTMLDivElement>>(appContext);
    const [isMenuOpen, setMenu] = useState(false)
    const [isInputOpen, setInput] = useState(false)
    const [menuCoordinates, setCoordinates] = useState({left: 0, top:0})
    const menuContext = useContext(MenuContext);
    const indicatorRef: MutableRefObject<HTMLDivElement | null> = useRef(null)
    let shouldRemove = false;

    const toggleMenu = () => {
        setMenu(menu => !menu)
    };
    
    const toggleInput = (ref?: MutableRefObject<HTMLInputElement | null>) => {
        setInput(input => !input)
        if (isMenuOpen){
            MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
            // toggleMenu()
            if (ref && ref.current) {
                console.log('should be focusing');
            }
            ref?.current?.focus()
        }
    };


    const menuOptions = [
        ['Set value', toggleInput], 
        [
            ccMap 
            ? `Unmap from CC ${ccMap.cc}` 
            : 'Map to CC', midiLearn
        ]
    ]

    const onSubmit = (e: FormEvent) => {
        const inputElement = e.currentTarget.getElementsByTagName('input')[0]
        inputElement.focus()
        const val = Number(inputElement.value)

        if (!Number.isNaN(val) && val <= max && val >= min){
            valueUpdateCallback(val)
        } else {
            inputElement.value = String(value)
        }

        toggleInput()
    }

    const onBlur = (e: FormEvent) => {
        const input = e.currentTarget.getElementsByTagName('input')[0]
        input.value = String(value)
        toggleInput()
    }

    const onContextMenu = (e: ME) => {
        e.preventDefault()
        console.log('should be setting on contextMenu')
        let bound = e.currentTarget.getBoundingClientRect()
        const x = e.pageX - bound.x
        const y = e.pageY - bound.y

        setCoordinates({
            left: x,
            top: y
        }) 

        const id = menuContext.current?.[0]
        console.log(id)
        if (!id) {
            toggleMenu()
            MenuEmitter.emit(
                menuEmitterEventTypes.OPEN, 
                {id: indicatorId, close: toggleMenu}
            )
        } else {
            MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
            if (id !== indicatorId) {
                toggleMenu()
                MenuEmitter.emit(menuEmitterEventTypes.OPEN, 
                    {id: indicatorId, close: toggleMenu}
                )
            }
        }
    };

    const onSetValue = () => {
        MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
        toggleInput() 
    };



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
        e.stopPropagation()
        MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
        if (e.button === 0) {
            if (isInputOpen){
                toggleInput()
            }
            // if (isMenuOpen) {
            //     toggleInput()
            // }
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

    const indicator = type === 'knob' 
    ? <Knob
        captureStart={captureStart}
        // indicatorData={rotateBy}
        indicatorData={
            detail === 'detune'
                ? rotate((Number(value) / 1200) * 140)
                : rotateBy}
        // indicatorData={detail === 'detune' ? rotate((0) * 140) : rotateBy}
        // indicatorData={rrr()}
        label={label}
        onContextMenu={onContextMenu}
        onBlur={onBlur}
        onSubmit={onSubmit}
        menuOptions={menuOptions}
        toggleInput={toggleInput}
        wheelMove={wheelMove}
        className={className}
        selectedLock={selectedLock}
        value={value}
        max={max}
        min={min}
        unit={unit}
        display={display}
        curve={curve}
        MenuPosisiton={menuCoordinates}
        valueUpdateCallback={valueUpdateCallback}
        contextMenu={isMenuOpen}
        input={isInputOpen}
        setDisplay={() => setDisplay(state => !state)}
    ></Knob> 
    : <Slider
        value={value}
        curve={curve}
        unit={unit}
        onBlur={onBlur}
        onSubmit={onSubmit}
        selectedLock={selectedLock}
        menuOptions={menuOptions}
        max={max}
        min={min}
        valueUpdateCallback={valueUpdateCallback}
        onContextMenu={onContextMenu}
        toggleInput={toggleInput}
        wheelMove={wheelMove}
        display={display}
        className={className}
        captureStartDiv={captureStartDiv}
        contextMenu={isMenuOpen}
        input={isInputOpen}
        // indicatorData={detail === 'volume' ? rrr() : heightPercentage}
        indicatorData={detail === 'volume' ? `${(1 / 106) * ((83 * Number(value)) + 8618)}%` : heightPercentage}
        // indicatorData={rrr()}
        label={label}
        setDisplay={() => setDisplay(state => !state)} />;

    return indicator
}


export default ContinuousIndicator;

