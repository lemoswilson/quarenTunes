import React, { useEffect, useState, useContext, useRef } from 'react';
import Radium from 'radium';
import './Fader.scss'
import appContext from '../../context/appContext';

const Fader = (props) => {
    const [isMovingFader, setMovementFader] = useState(false);
    const [isMovingPan, setMovementPan] = useState(false);
    let shouldRemoveFader = false;
    let shouldRemovePan = false;
    let appRef = useContext(appContext) ;
    let soloRef = useRef();
    let muteRef = useRef();

   useEffect(() => {
       let main = appRef.current;
       if (isMovingFader && !shouldRemoveFader) {
           main.onmousemove = mouseMoveFader;
           main.onmouseup = stopDrag;
       }
       return () => {
           if (!isMovingFader || shouldRemoveFader) {
               main.onmousemove = null;
               main.onmouseup = null;
           }
       }
   }, [isMovingFader]);

   useEffect(() => {
       let main = appRef.current;
       if (isMovingPan && !shouldRemovePan) {
           main.onmousemove = mouseMovePan;
           main.onmouseup = stopDrag;
       }
       return () => {
           if (!isMovingPan || shouldRemovePan) {
            main.onmousemove = null;
            main.onmouseup = null;
           }
       }
   }, [isMovingPan])


   const stopDrag = (e) => {
       document.exitPointerLock()
       shouldRemoveFader = true;
       shouldRemovePan = true;
       setMovementFader(false);
       setMovementPan(false);
   }

   const mouseMoveFader = (e) => {
    //    if (e.movementY < 0 && props.volume < props.max) {
    //        props.volume - e.movementY * 0.1 < props.max ? props.volumeChange('add', -e.movementY) : props.volumeChange('max')
    //    } else if (e.movementY > 0 && props.volume > props.min) {
    //        props.volume - e.movementY * 0.1 > props.min ? props.volumeChange('sub', e.movementY) : props.volumeChange('min')
    //    } else if (e.movementY === 0) {
    //        return
    //    }
       props.volumeChange(e);
   }

   const mouseMovePan = (e) => {
       props.panChange(e);
   }

   const captureStartFader = (e) => {
        if (e.target.classList.contains('indicator')) {
            setMovementFader(true);
            appRef.current.requestPointerLock = appRef.current.requestPointerLock || appRef.current.mozRequestPointerLock;
            appRef.current.exitPointerLock = appRef.current.exitPointerLock || appRef.current.mozExitPointerLock;
            appRef.current.requestPointerLock();
        }
   }

   const captureStartPan = (e) => {
       if (e.target.classList.contains('indicator')) {
           setMovementPan(true);
            appRef.current.requestPointerLock = appRef.current.requestPointerLock || appRef.current.mozRequestPointerLock;
            appRef.current.exitPointerLock = appRef.current.exitPointerLock || appRef.current.mozExitPointerLock;
            appRef.current.requestPointerLock();
       }
   }

   const getIndicatorTop = (volume) =>  {
       if (volume >= 0 && volume <= 6) {
        return `${(-3/2)*volume + 7.2}%`;
       } else if (volume < 0 && volume >= -60) {
        return  `${(-848/600)*volume + 7.2}%`;
       } else if (volume < -60) {
        return `${(-1/8)*volume + 84.5}%`;
       }
   }

   const muteHandle = (e) => {
        if ([...muteRef.current.classList].includes('grey')) {
            muteRef.current.classList.remove('grey');
        } else {
            muteRef.current.classList.add('grey');
        }
        props.toggleMute();
   }

   const soloHandle = (e) => {
        if ([...soloRef.current.classList].includes('blue')) {
            soloRef.current.classList.remove('blue');
        } else {
            soloRef.current.classList.add('blue');
        }
        props.toggleSolo();
   }
   
    return(
        <div className='fader-wrapper'>
            <div className="volume-wrapper" onPointerDown={captureStartFader}>
                <div className="indicator" style={{top: getIndicatorTop(props.volume)}}></div>
                <div className="volume-bar left"></div>
                <div className="volume-bar right"></div>
                <ul className="meter">
                    <li className="level">-0</li>
                    <li className="level">-</li>
                    <li className="level">-12</li>
                    <li className="level">-</li>
                    <li className="level">-24</li>
                    <li className="level">-</li>
                    <li className="level">-36</li>
                    <li className="level">-</li>
                    <li className="level">-48</li>
                    <li className="level">-</li>
                    <li className="level">-60</li>
                    <li className="level">-<span className="infinity">∞</span></li>
                </ul>
            </div>
            <div className="crossPan" onPointerDown={captureStartPan}>
                <div className="indicator" style={{left: `${props.pan}%`}}></div>
                <div className="midPoint"></div>
            </div>
            <div className="mixControls">
                <div className="mute" onClick={muteHandle} ref={muteRef}><p>M</p></div>
                <div className="solo" onClick={soloHandle} ref={soloRef}><p>S</p></div>
            </div>
        </div>
    )
}


export default Radium(Fader);

// toggleSolo
// toggleMute
// min
// max
// volumeChange
// volume={this.state.volume}
// pan}
// panChange


//   volumeHandler = (e) => {
//     if (e.movementY < 0 && this.state['volume'] < this.state.volMax) {
//       this.setState((state) => ({
//         volume: state.volume - e.movementY * 0.1 < state.volMax ? state.volume - e.movementY * 0.1 : state.volMax,
//       }));
//     } else if (e.movementY > 0 & this.state.volume > this.state.volMin) {
//       this.setState((state) => ({
//         volume: state.volume - e.movementY * 0.1 > this.state.volMin ? state.volume - e.movementY * 0.1 : state.volMin,
//       }));
//     } else if (e.movementY === 0) {
//       return
//     } 
//   };


// panHandler = (e) => {
// if (e.movementX > 0 && this.state.pan < this.state.panMax) {
//     this.setState((state) => ({
//     pan: state.pan + e.movementX < state.panMax ? state.pan + e.movementX : state.panMax
//     }))
// }
// if (e.movementX < 0 && this.state.pan > this.state.panMin) {
//     this.setState((state) => ({
//     pan: state.pan + e.movementX > state.panMin ? state.pan + e.movementX : state.panMin
//     }))
// }
// }