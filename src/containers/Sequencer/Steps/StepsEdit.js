import React, { useRef } from 'react';
import './StepsEdit.scss';

const StepsEdit = (props) => {
    let patternNameInput = useRef();

    const changePatternName = (e) => {
        e.preventDefault();
        props.changePatternName(patternNameInput.current.value)
    };
    
    return(
        <div className="stepsEdit">
            <div className="sequence-options">
                <div className="addPattern" >
                    <p onClick={props.addPattern}>
                        +
                    </p>
                </div>
                <div className="active-pattern">
                    <select onChange={props.selectPattern} value={props.activePattern}>
                        { Object.keys(props.sequencerState).map(key => {
                            if (key && key !== 'activePattern' && typeof props.sequencerState[key] === 'object'){
                                return <option value={props.sequencerState[key]['name']} key={props.sequencerState[key]['name']} > { props.sequencerState[key]['name']}</option>
                            } else {
                                return null
                            }
                        }) 
                        }             
                    </select>
                    <div className="editName">
                            <form onSubmit={changePatternName} >
                                <label className='patternNameLabel' htmlFor="patternName">Change Name</label>
                                <input className='patternNameSelector' 
                                    type="text" id='patternName' 
                                    name='patternName' 
                                    placeholder={props.sequencerState[props.sequencerState['activePattern']]['name']}
                                    ref={patternNameInput}/>
                            </form>
                    </div>
                </div>
                <div className="pattern-length">
                    <form>
                        <div className="value-button" id="decrease" value="Decrease Value">-</div>
                        <input type="number" id="number" defaultValue={props.sequencerState[props.sequencerState['activePattern']]['patternLength']} />
                        <div className="value-button" id="increase" value="Increase Value">+</div>
                    </form>
                </div>
                <div className="track-length">
    
                </div>
                <div className="page">
                    
                </div>
            </div>
            <div className="note-options">
                <div className="notes">

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