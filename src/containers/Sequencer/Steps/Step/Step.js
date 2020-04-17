import React from 'react';
import './Step.scss'

const Step = (props) => {

    return(
        <React.Fragment>
            <div className="step">
                { props.value.time }
            </div>
        </React.Fragment>
    )
}

export default Step;