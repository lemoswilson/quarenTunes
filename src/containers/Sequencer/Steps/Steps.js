import React, { useContext} from 'react';
import Step from './Step/Step';
import './Steps.scss';
import trackContext from '../../../context/trackContext';

const Steps = (props) => { 
    let TrackContext = useContext(trackContext)

    return(
        <div className="steps">
            { props.pattern.map((e, index) => {
                return <Step value={e.value} key={`Seq${props.activePattern} Track${TrackContext[TrackContext.selectedTrack][2]} ${index}`}></Step>
            })}
        </div>
    )
};

export default Steps;
