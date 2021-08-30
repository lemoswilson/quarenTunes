import React, { useState, useEffect, WheelEvent, useContext, MutableRefObject, MouseEvent as ME, FormEvent, useRef } from 'react';
import { curveTypes } from '../../../containers/Track/defaults';
import Knob from './Knob';
import Slider from './Slider';
import appContext from '../../../context/AppContext';
import MenuContext from '../../../context/MenuContext';
import MenuEmitter, { menuEmitterEventTypes } from '../../../lib/Emitters/MenuEmitter';

interface continuousIndicator {
    className?: string;
    value: number | '*';
    min: number;
    max: number;
    tabIndex: number;
    ccMouseCalculationCallback: (e: any) => void;
    removePropertyLock: () => void;
    valueUpdateCallback: (value: any) => void;
    label: string;
    midiLearn: () => void,
    type: 'knob' | 'slider';
    detail?: 'port' | 'detune' | 'envelopeZero' | 'volume'
    unit: string;
    selectedLock?: boolean,
    curve?: curveTypes;
    indicatorId: string,
    ccMap?: any,
    property?: string,
    keyFunction?: (value: number | '*') => number | '*',
}

export interface indicatorProps {
    wheelMove: (e: WheelEvent) => void,
    curve?: curveTypes,
    captureStart?: (e: React.PointerEvent<SVGSVGElement>) => void,
    tabIndex: number,
    captureStartDiv?: (e: React.MouseEvent) => void,
    onKeyDown: (this: HTMLDivElement, e: KeyboardEvent) =>  void,
    label: string,
    selectedLock?: boolean,
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
    keyFunction?: (value: number | '*') => number | '*',
    MenuPosisiton?: {
        left: number,
        top: number,
    } 
}

const ContinuousIndicator: React.FC<continuousIndicator> = ({
    className,
    curve,
    tabIndex,
    ccMouseCalculationCallback,
    removePropertyLock,
    keyFunction,
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
    property,
    indicatorId
}) => {
    const [isMoving, setMovement] = useState(false)
    const [display, setDisplay] = useState(true);
    const appRef = useContext<MutableRefObject<HTMLDivElement>>(appContext);
    const [isMenuOpen, setMenu] = useState(false)
    const [isInputOpen, setInput] = useState(false)
    const [menuCoordinates, setCoordinates] = useState({left: 0, top:0})
    const menuContext = useContext(MenuContext);
    let shouldRemove = false;

    const toggleMenu = () => {
        setMenu(menu => !menu)
    };
    
    const toggleInput = (ref?: MutableRefObject<HTMLInputElement | null>) => {
        setInput(input => !input)
        if (isMenuOpen){
            MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
            ref?.current?.focus()
        }
    };

    const learn = () => {
        MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
        midiLearn();
    }


    const menuOptions = [
        ['Set value', toggleInput], 
        [
            ccMap 
            ? `Unmap from CC ${ccMap.cc}` 
            : 'Map to CC', learn
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
        let bound = e.currentTarget.getBoundingClientRect()
        const x = e.pageX - bound.x
        const y = e.pageY - bound.y

        setCoordinates({
            left: x,
            top: y
        }) 

        const id = menuContext.current?.[0]
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

        if (e.shiftKey){
            removePropertyLock?.()
            return;
        }

        MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
        if (e.button === 0) {
            if (isInputOpen){
                toggleInput()
            }
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
        const k = {
            movementY: e.deltaY <= 7 && e.deltaY >= -7
                ? e.deltaY
                : e.deltaY < -7
                    ? -7
                    : 7
        }
        if (k.movementY) {
            ccMouseCalculationCallback(k)
        }

    };

    function keyHandle(this: HTMLDivElement, e: KeyboardEvent): void {
        let char: string = e.key.toLowerCase();
        let isShift = e.shiftKey ? 9 : 0;
        let k = {
            movementY:
                char === 'arrowdown' 
                ? 1 + isShift 
                : char === 'arrowup'
                ? -1 - isShift
                : undefined 
        }
        if (k.movementY){
            ccMouseCalculationCallback(k)
        }
    }

    const rotate = (angle: number) => `rotate(${angle} 33.64 33.64)`
    const mid = (max - min) / 2
    const rotateBy =
        value === '*'
            ? rotate(0)
            : detail === 'volume'
                ? rotate((((value + 101) - 54) / 53) * 140)
                : curve === curveTypes.LINEAR || !curve
                    ? rotate(140 * (value - (mid)) / mid)
                    : rotate(280 * ((Math.log(value / min) / Math.log(max / min)) - 0.5));

    const heightPercentage = value === "*" ? '40%' : `${(86 / (max - min)) * value + 3}%`

    const indicator = type === 'knob' 
    ? <Knob
        captureStart={captureStart}
        onKeyDown={keyHandle}
        indicatorData={
            detail === 'detune'
                ? rotate((Number(value) / max) * 140)
                : rotateBy}
        label={label}
        tabIndex={tabIndex}
        onContextMenu={onContextMenu}
        onBlur={onBlur}
        onSubmit={onSubmit}
        menuOptions={menuOptions}
        toggleInput={toggleInput}
        wheelMove={wheelMove}
        className={className}
        selectedLock={selectedLock}
        value={value}
        keyFunction={keyFunction}
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
        tabIndex={tabIndex}
        curve={curve}
        unit={unit}
        onKeyDown={keyHandle}
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
        indicatorData={detail === 'volume' ? `${(1 / 106) * ((83 * Number(value)) + 8618)}%` : heightPercentage}
        label={label}
        setDisplay={() => setDisplay(state => !state)} />;

    return indicator
}


export default ContinuousIndicator;

