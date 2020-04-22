import React, { useRef, useContext, useEffect } from 'react';
import './StepsEdit.scss';
import trackContext from '../../../context/trackContext';

const StepsEdit = (props) => {
    // Initializing refs and context - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    let patternNameInput = useRef(),
        TrkCtx = useContext(trackContext),
        tlRef = useRef(),
        tlInputRef = useRef(),
        plRef = useRef(),
        plInputRef = useRef(),
        noteInRef = useRef(),
        velocityRef = useRef();

    
    // Callbacks for handling parents state - - - - - - - - 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    const changePatternName = (e) => {
        e.preventDefault();
        props.changePatternName(patternNameInput.current.value);
        e.target.reset();
    };

    const changeTrackLength = (e) => {
        e.preventDefault();
        let newLength = tlInputRef.current.value;
        props.changeTrackLength(newLength, tlRef);
    };

    const changePatternLength = (e) => {
        e.preventDefault();
        let newLength = plInputRef.current.value;
        props.changePatternLength(newLength, plRef);
    };

    const inputNoteForm = (e) => {
        e.preventDefault();
        const selected = props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'];
        if (!selected) {
            alert('noStepSelected');
        } else {
            let value = noteInRef.current.value;
            value = value.split(',');
            let newValue = value.map(e => e.trim());
            props.setNote(newValue)
        }
        e.target.reset();
    };

    const inputVelocityForm = (e) => {
        e.preventDefault();
        const selected = props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'];
        if (!selected) {
            alert('noStepSelected');
        } else {
            let value = velocityRef.current.value;
            value = value.split(',');
            let newValue = value.map(e => e.trim());
            props.setVelocity(newValue)
        }
        e.target.reset();
    }

    // Setting conditional elements logic - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const patternAmount = () => {
        let patternAmount = Number();
        Object.keys(props.sequencerState).map(key => {
            if (parseInt(key) >= 0){
                patternAmount = patternAmount + 1;
            }
            return
        })
        return patternAmount 
    };

    const removePattern = patternAmount() > 1 ? <span onClick={props.removePattern}>-</span> : null;

    const pageStyle = (index) => {
        return index === props.page ? { backgroundColor: 'red' } : null
    }

    const TrkLengthPlaceHolder = props.sequencerState[props.sequencerState['activePattern']]['tracks'][TrkCtx.selectedTrack] ? props.sequencerState[props.sequencerState['activePattern']]['tracks'][TrkCtx.selectedTrack]['length'] : null;

    const notePlaceHolder = () => {
        const selected = props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'];
        if (selected && props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] &&
            selected.length > 1) {
                return '*';
            } else if (selected && props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] &&
            selected.length === 1) {
                return props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][selected[0]]['note'] ?
                props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][selected[0]]['note'].join(',') :
                '*'
            } else {
                return '';
            }
    }

    const velocityPlaceholder = () => {
        const selected = props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['selected'];
        if (selected && props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] &&
            selected.length > 1) {
                return '*';
            } else if (selected && props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack] &&
            selected.length === 1) {
                return props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][selected[0]]['velocity'] ?
                props.sequencerState[props.sequencerState.activePattern]['tracks'][TrkCtx.selectedTrack]['events'][selected[0]]['velocity'].join(',') :
                '*'
            } else {
                return '';
            }
    }


    return(
        <div className="stepsEdit">
            <div className="sequence-options">
                <div className="addPattern" >
                    <p>
                        <span onClick={props.addPattern} style={{marginRight: '10px'}}>+</span>
                        { removePattern }
                    </p>
                </div>

                <div className="active-pattern">
                    <select onChange={props.selectPattern} defaultValue={props.activePattern}>
                        { Object.keys(props.sequencerState).map(key => {
                            // if (key && key !== 'activePattern' && typeof props.sequencerState[key] === 'object'){
                            if (parseInt(key) >= 0){
                                return <option value={key} key={`Sequence${key}`} > { props.sequencerState[key]['name']}</option>
                            } else {
                                return null
                            }
                        }) 
                        }             
                    </select>
                    <div className="editName">
                            <form onSubmit={changePatternName}>
                                <label className='patternNameLabel' htmlFor="patternName">Change Name</label>
                                <input className='patternNameSelector' 
                                    type="text" id='patternName' 
                                    name='patternName' 
                                    placeholder={props.sequencerState[props.sequencerState['activePattern']]['name']}
                                    ref={patternNameInput}/>
                            </form>
                    </div>
                </div>

                <div className="track-length">
                    <p style={{fontSize: '12px'}}>Track Length</p>
                    <form ref={tlRef} onSubmit={changeTrackLength}>
                        <div className="value-button" id="decrease" value="Decrease Value" onClick={() => props.changeTrackLength(props.TrackLength - 1, tlRef)}>-</div>
                        <input type="number" id="numberTrack" ref={tlInputRef} placeholder={TrkLengthPlaceHolder} />
                        <div className="value-button" id="increase" value="Increase Value" onClick={() => props.changeTrackLength(props.TrackLength + 1, tlRef)}>+</div>
                    </form>
                    <div className="pages">
                        { [...Array(Math.ceil(props.TrackLength/16)).keys()].map(index => {
                            return (
                                <div className={`page ${index + 1}`} 
                                style={pageStyle(index)} 
                                value={index} 
                                key={`Seq${props.sequencerState.activePattern} Track${TrkCtx.selectedTrack} page${index}`} 
                                onClick={() => props.changePage(index)}></div>
                            )
                        })}
                    </div>
                </div>

                <div className="pattern-length">
                    <p style={{fontSize: '12px'}}>Pattern Length</p>
                    <form ref={plRef} onSubmit={changePatternLength}>
                        <div className="value-button" id="decrease" value="Decrease Value" onClick={() => props.changePatternLength(props.PatternLength - 1, plRef)}>-</div>
                        <input type="number" id="numberPattern" ref={plInputRef} placeholder={props.sequencerState[props.sequencerState['activePattern']]['patternLength']} />
                        <div className="value-button" id="increase" value="Increase Value" onClick={() => props.changePatternLength(props.PatternLength + 1, plRef)}>+</div>
                    </form>
                </div>
            </div>
            <div className="note-options">
                <div className="notes">
                    <form  onSubmit={inputNoteForm}>
                        <label htmlFor="noteInput">Notes</label>
                        <input type="text" ref={noteInRef} id='noteInput' placeholder={notePlaceHolder()}/>
                    </form>
                </div>
                <div className="velocity">
                    <form  onSubmit={inputVelocityForm}>
                        <label htmlFor="velocityInput">Velocity</label>
                        <input type="text" ref={velocityRef} id='velocity' placeholder={velocityPlaceholder()}/>
                    </form>
                </div>
                <div className="swing">

                </div>
                <div className="micrposition">

                </div>
            </div>
        </div>
    )
}

export default StepsEdit;