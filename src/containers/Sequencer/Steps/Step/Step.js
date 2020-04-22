import React from 'react';
import './Step.scss'
import sequencerContext from '../../../../context/sequencerContext';
import trackContext from '../../../../context/trackContext';

const Step = (props) => {
    // Initializing Context - - - - - - - - - - - - - - - - - - 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    let SeqCtx = React.useContext(sequencerContext),
        TrkCtx = React.useContext(trackContext);

    const selectStep = () => {
        props.selectStep(props.stepIndex);
    };


    const selected = () => {
        if ((props.selected && props.selected.includes(props.stepIndex)) 
        ||  (props.selected && props.selected === props.stepIndex)){
           return ' selected'  
        } else {
            return ''
        } 
    }

    return(
        <div className={`step${selected()}`} onClick={selectStep}>
            { props.tempo }
        </div>
    )
}

export default Step;