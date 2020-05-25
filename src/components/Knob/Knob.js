import React, {useState, useEffect, useContext} from 'react';
import Radium from 'radium';
import AppContext from './../../context/appContext';

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
}
  
function describeArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;       
}

const radProps = (value, min, max) => {
    return (320.00 / (min-max))*(-value+min) - 160
}

const Knob = (props) => {
    // Initialize State, refs and variables that control conditional measures
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const [isMoving, setMovement] = useState(false);
    let shouldRemove = false;
    let appRef = useContext(AppContext);

    // Set event event listeners in the appRef if the Knob is started being dragged
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    useEffect(() => {
        let main = appRef.current
        if (isMoving && !shouldRemove) {
            main.onmousemove = mouseMove;
            main.onmouseup = stopDrag;
        }
        return () => {
            if (!isMoving || shouldRemove) {
            main.onmousemove = null;
            main.onmouseup = null;
            }
        }
    }, [isMoving])

    // Handlers for the beggining and end of the mouse dragging (set and remove 
    // PointerLock) - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const stopDrag = (e) => {
        document.exitPointerLock();
        setMovement(false);
        shouldRemove = true;
    };

    const captureStart = (e) => {
        console.log('Knob', e.button);
        if (e.button === 0) {
            setMovement(true);
            appRef.current.requestPointerLock = appRef.current.requestPointerLock || appRef.current.mozRequestPointerLock;
            appRef.current.exitPointerLock = appRef.current.exitPointerLock || appRef.current.mozExitPointerLock;
            appRef.current.requestPointerLock();
        }
    };

    // Handlers that call back parent functions as props, and deal with its state.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const mouseMove = (e) => {
        props.calcValue(e);
    }

    const wheelMove = (e) => {
        e.persist();
        e.preventDefault();
        if (e.deltaY >= 7) {
            props.value + 7*props.curveFunction(props.value) < props.max ? props.calcValue('add', 7*props.curveFunction(props.value)) : props.calcValue('max') ;
        } else if (e.deltaY <= -7) {
            props.value - 7*props.curveFunction(props.value) > props.min ? props.calcValue('sub', 7*props.curveFunction(props.value)) : props.calcValue('min');
        } else if (e.deltaY > 0 && e.deltaY < 7) {
            props.value + e.deltaY*props.curveFunction(props.value) < props.max ? props.calcValue('add', e.deltaY*props.curveFunction(props.value)) : props.calcValue('max');
        } else if (e.deltaY < 0 && e.deltaY > -7) {
            props.value + e.deltaY*props.curveFunction(props.value) > props.min ? props.calcValue('sub', -e.deltaY*props.curveFunction(props.value)) : props.calcValue('min');
        } else {
            return
        }
    }

    const keyHandle = (e) => {
        if (e.keyCode === 40) {
            props.calcValue('sub', props.curveFunction(props.value))
        }
        if (e.keyCode === 38) {
            props.calcValue('add', props.curveFunction(props.value));
        }
    }

    // Components styles - - - - - - - - - - - - - - - - 
    const divStyle = {
        width: '50px',
        heigth: '50px',
        ':focus': {
            outline: 'none' ,
        }
    }


    return (
        <div tabIndex={0} onKeyDown={keyHandle} style={divStyle} onWheel={wheelMove} onContextMenu={(e) => props.midiLearn(e, props.label)}>
            <svg onPointerDown={captureStart} style={{height: `${props.size}px`, alignSelf: "center", width: `${props.size}px`}}>
            <path id="arc1" fill="none" stroke={props.colorOuter} strokeWidth="5" d={describeArc(props.size/2, props.size/2, props.radius, -160, 160)}/>
            <path id="arc2" fill="none" stroke={props.colorInner} strokeWidth="5" d={describeArc(props.size/2, props.size/2, props.radius, radProps(props.value, props.min, props.max), 160)}/>
            </svg>
            <div className='KnobValue' style={{width: 'inherit'}}>{props.label}</div>
        </div>
    )
}

export default Radium(Knob);
// export default Knob;

// size - width and height
// calcValue - switch case function with add, sub, min, max (stepWheel function)
// colorInner - color dry
// colorOuter - color wet
// value - value (as function of state)
// min - min value can hold
// max - max value can hold
// radius - arc radius
// curve function - presents the curve to add or subtract depending on the value
// label - name of property


// calcValue = (e) => {
// if (e.movementY < 0 && this.state.value < this.state.max) {
//     this.setState((state) => ({
//     value: state.value - e.movementY < state.max ? state.value - e.movementY : state.max
//     })) } else if (e.movementY > 0 && this.state.value > this.state.min) {
//     this.setState((state) => ({
//         value: state.value - e.movementY > state.min ? state.value - e.movementY : state.min,
//     }))
//     }
// }
