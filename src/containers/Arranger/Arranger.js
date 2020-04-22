import React, { useEffect, useContext, useState } from 'react';
import './Arranger.scss'
import trackContext from '../../context/trackContext';
import sequencerContext from '../../context/sequencerContext';
import arrangerContext from '../../context/arrangerContext';

const Arranger = (props) => {
    // Initializing contexts and state and necessary variables- - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    let TrkCtx = useContext(trackContext),
        SeqCtx = useContext(sequencerContext),
        ArrCtx = useContext(arrangerContext);

    const [arrangerState, setArranger] = useState({
        mode: 'pattern',
        following: false,
    }),
        modes = ['pattern', 'chain', 'song'];

    // Subscribing Arranger Context to any changes in the arranger
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    useEffect(() => {
        ArrCtx.updateArrCtx(arrangerState);

    }, [arrangerState]);

    // State changing methods - - - - - - - - - - - - - - - - - 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const setMode = (newMode) => {
        setArranger(state => ({
            ...state,
            mode: newMode,
        }));
    } ;

    return(
        <div className="arranger">
            <div className="modes">
                { modes.map(mode => {
                    return <div key={mode} 
                        className={mode}
                        onClick={() => setMode(mode)}>
                        { mode.charAt(0).toUpperCase() + mode.slice(1) }</div>
                }) }
            </div>
        </div>
    )
}

export default Arranger;