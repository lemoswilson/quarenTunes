import React, { useRef, useContext } from 'react';
import './StepsEdit.scss';
import trackContext from '../../../context/trackContext';

const StepsEdit = (props) => {
    let patternNameInput = useRef();
    let TrkCtx = useContext(trackContext);

    const changePatternName = (e) => {
        e.preventDefault();
        props.changePatternName(patternNameInput.current.value);
        e.target.reset();
    };
    
    const patternAmount = () => {
        let patternAmount = Number();
        Object.keys(props.sequencerState).map(key => {
            if (parseInt(key) >= 0){
                patternAmount = patternAmount + 1;
            }
            return
        })
        return patternAmount 
    }

    const removePattern = patternAmount() > 1 ? <span onClick={props.removePattern}>-</span> : null;

    const pages = () => {

    }

    return(
        <div className="stepsEdit">
            <div className="sequence-options">
                <div className="addPattern" >
                    <p>
                        <span onClick={props.addPattern}style={{marginRight: '10px'}}>+</span>
                        { removePattern }
                    </p>
                </div>
                <div className="active-pattern">
                    <select onChange={props.selectPattern} defaultValue={props.activePattern}>
                        { Object.keys(props.sequencerState).map(key => {
                            if (key && key !== 'activePattern' && typeof props.sequencerState[key] === 'object'){
                                // return <option value={props.sequencerState[key]['name']} key={props.sequencerState[key]['name']} > { props.sequencerState[key]['name']}</option>
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
                <div className="pattern-length">
                    <p style={{fontSize: '12px'}}>Track Length</p>
                    <form>
                        <div className="value-button" id="decrease" value="Decrease Value">-</div>
                        <input type="number" id="number" defaultValue={props.sequencerState[props.sequencerState['activePattern']]['tracks'][TrkCtx.selectedTrack]['length']} />
                        <div className="value-button" id="increase" value="Increase Value">+</div>
                    </form>
                    <div className="pages">
                    </div>
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