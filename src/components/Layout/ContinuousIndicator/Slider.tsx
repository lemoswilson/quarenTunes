import React, { MutableRefObject, useState, useRef, useEffect } from 'react';
import styles from './slider.module.scss';
import { indicatorProps } from './index';
import InputBox from './InputBox';
import ContextMenu from './ContextMenu';

// const Slider: React.FC<indicatorProps> = ({ captureStartDiv, indicatorData, label, wheelMove, className, unit, value, setDisplay, display }) => {
const Slider: React.FC<indicatorProps> = ({ 
    captureStartDiv, 
    indicatorData, 
    label, 
    className, 
    unit, 
    value, 
    setDisplay, 
    display, 
    contextMenu,
    wheelMove,
    onKeyDown,
    menuOptions,
    MenuPosisiton, 
    onBlur,
    onSubmit,
    tabIndex,
    onContextMenu,
    input,
}) => {
    
    const c = `${styles.wrapper} ${className}`;
    const divRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

    useEffect(() => {
        divRef.current?.addEventListener('keydown', onKeyDown)
        return () => {
            divRef.current?.removeEventListener('keydown', onKeyDown)
        }
    }, [])

    const displayComponent = (
        <div 
            onClick={setDisplay} 
            className={styles.text}>
                {display ? label : `${value} ${unit}`}
        </div>
    )

    const contextMenuComponent = 
    <ContextMenu
        MenuPosition={MenuPosisiton}
        menuOptions={menuOptions}
    />

    const displayOrInput = 
        input 
        ? <InputBox 
            onBlur={onBlur} 
            onSubmit={onSubmit}
            value={value}
        /> 
        : displayComponent

    return (
        <div tabIndex={tabIndex} ref={divRef} onContextMenu={onContextMenu} className={c} onWheel={wheelMove}>
            { displayOrInput }
            { contextMenu ? contextMenuComponent : null}
            <div onPointerDown={captureStartDiv} className={styles.indicatorWrapper}>
                <div style={{ height: indicatorData }} className={styles.value}></div>
            </div>
        </div>
    )
}

export default Slider;
