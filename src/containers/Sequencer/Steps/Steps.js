import React, { useContext, useEffect, useState} from 'react';
import Step from './Step/Step';
import './Steps.scss';
import trackContext from '../../../context/trackContext';
import { range } from '../../MainWindow/MainWindow';

const Steps = (props) => { 
    // Initializing Context - - - - - - - - - - - - - - - - - - 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    let TrackContext = useContext(trackContext);
        

    // Calculate the last step to show in the sequencer, dependening on which page is selected.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const finalStep = () => {
        if ((props.page === 0 && props.length <= 16)  
        ||  (props.page === 1 && props.length <= 32) 
        ||  (props.page === 2 && props.length <= 48)){
            return props.length - 1
        }  else if (props.page === 1 & props.length > 32) {
            return 31
        } else if (props.page === 2 & props.length > 48) {
            return 47 
        } else if (props.page === 0 && props.length > 16) {
            return 15
        }
    };

    // Conditional components and styles - - - - - - - - - - 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    return(
        <div className="steps">
            { range(parseInt(props.page)*16, finalStep()).map(index => {
                return <Step event={props.events[index]}
                key={`Seq ${props.activePattern} Track${TrackContext.selectedTrack} Step${index}`}
                tempo={parseInt(index) + 1}
                stepIndex={index}
                selectStep={props.selectStep}
                selected={props.selected}
                // onClick={() => console.log('kaka')}
                ></Step>
            })}
        </div>
    )
};

export default Steps;
