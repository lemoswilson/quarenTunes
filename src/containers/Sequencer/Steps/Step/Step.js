import React from 'react';
import './Step.scss'

const Step = (props) => {

    return(
        <React.Fragment>
            <div className="step">
                { `${parseInt(props.value.time.split(":")[2], 10) + 1}` }
            </div>
        </React.Fragment>
    )
}

export default Step;