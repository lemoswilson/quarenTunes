import React, { useEffect, useRef, MutableRefObject } from 'react';
import styles from './knob.module.scss';
import { indicatorProps } from './index';
import InputBox from './InputBox';
import ContextMenu from './ContextMenu';



const Knob: React.FC<indicatorProps> = ({ 
    captureStart, 
    label, 
    wheelMove, 
    indicatorData, 
    className, 
    keyFunction,
    tabIndex,
    unit, 
    onSubmit,
    onBlur,
    display, 
    value, 
    setDisplay,
    contextMenu,
    menuOptions,
    onContextMenu,
    onKeyDown,
    input,
    MenuPosisiton,
}) => {
    const c = `${styles.wrapper} ${className}`
    const divRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
    const trueValue = keyFunction ? keyFunction(value) : value


    const displayComponent = (
        <div onPointerDown={setDisplay} className={styles.title}>
            {display ? label : `${trueValue} ${unit}`}
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
    
    useEffect(() => {
        const div = divRef.current
        div?.addEventListener('keydown', onKeyDown)

        return () => {
            div?.removeEventListener('keydown', onKeyDown)
        }
    }, [onKeyDown])


    return (
        <div tabIndex={tabIndex} ref={divRef} onContextMenu={onContextMenu} className={c} onWheel={wheelMove}>
            <svg className={styles.svg} onPointerDown={captureStart} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 71.93 73.39">
                <defs>
                    <linearGradient id="a" x1="18.39" y1="10.37" x2="53.26" y2="63.58" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#f0f0f0" stopOpacity="0.3" />
                        <stop offset="0.98" stopColor="#ededed" stopOpacity="0.3" />
                    </linearGradient>
                </defs>
                <title>{label}</title>
                <g style={{ isolation: "isolate" }}>
                    <g>
                        <g>
                            <circle cx="33.64" cy="33.64" r="33.64" className={styles.knob} />
                            <g>
                                <image width="69" height="69" transform="translate(2.93 4.39)" xlinkHref="data:image/png;base64,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" style={{ opacity: 0.5, mixBlendMode: "multiply" }} />
                                <circle cx="33.64" cy="33.64" r="22.14" style={{ fill: "#fff" }} />
                            </g>
                            <g>
                                <g>
                                    <image x="21.94" y="5.39" width="27" height="28" transform={indicatorData} xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAdCAYAAAC5UQwxAAAACXBIWXMAAAsSAAALEgHS3X78AAACNElEQVRIS72WbW7bMAyGn3w2aZN1K7CT+P5HyFW2danjxonj/SBpUbJsZ0ARAoSUWNbjVyIpzdq25ZE2nxrw1bacGpDa4XCYWb8oiv9entnUkjpAB9K+f7GF+z5gEKigITdrcz4GzgIdbK6+cH17ZoCbeuP6g9AeUGEetARW2i4JUINd1S/aduAcNAI6ZR705Hyt/xvwCtTA2bkH95SmUWrqFghsAzwDL9puEegcUVEDFXACSsL++uWOgJ1Cp86UbRHQN+BV2x3yEQtEwSfwAfwF3rUtkY8wpZHKVKHt3RJR8oyA3tS/638GPAF/dLwt8UW90bkaD8glvgdugT3wA/iJQHf6/IqoWyEwW96KsJc980CfZ+ke7hF1b4jiFTLhGtmnCjjq+JW+7+cbXFKIoaZ0g6jdqRvwhuzZhhDBHtaze2pprggsEFhaDCYtB/Qh3RCCwPLtk5ASZ219oFgqZCuNB/p6aBWkRgAlskdP+syW9Khe6rha3/PQ0cSHGFYhkfhOiMaKOEp/6fMPfeahPUuBqTqLPsuzMxK1Bjwhyf5bx6XAyVpqQWA11CJzr/5Cv9LYch8JKi0Pb0VRREpzCltkspoQefa7RD7GaukFgZ4QkO1jQ2b/YPx48ifGGlFsSW1Ai2Ifrd0RlTuehvLQVPr+hQDz52FDgJhnUwLGT3wIk8+d+wQ3aHfSazt4vxm9RCX3GpI+xPvUwvh9BiaAZv5qqBYVZLjvxgZ3Ar/SHn7zfjjwHy8VLmXg+cprAAAAAElFTkSuQmCC" style={{ opacity: 0.5, mixBlendMode: "multiply" }} />
                                </g>
                                <circle cx="33.64" cy="18.96" r="2.97" className={styles.dank} transform={indicatorData} /> 
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
            { displayOrInput }
            { contextMenu ? contextMenuComponent : null}
        </div>
    )
}

export default Knob;