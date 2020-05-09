import React from 'react';
import './Step.scss'

const Step = (props) => {

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