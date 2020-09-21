import React, { FunctionComponent, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../App'
import { instrumentTypes } from '../store/Track'
import { Instruments } from './Track/Instruments'
import DummyInstrument from './Track/Instruments/DummyInstrument';

const Dummy: FunctionComponent = () => {
    const options = useSelector((state: RootState) => state.track.tracks[0].options)
    const [v, vs] = useState(1)
    const up = () => {
        vs(t => t + 1);
    }

    return (
        <div>
            <button onClick={up}></button>
            <Instruments id={0} dummy={v} index={0} midi={{ channel: undefined, device: undefined }} options={options} voice={instrumentTypes.FMSYNTH}></Instruments>;
            {/* <DummyInstrument id={0} dummy={v} index={0} midi={{ channel: undefined, device: undefined }} {...options} voice={instrumentTypes.FMSYNTH}></DummyInstrument> */}
        </div>
    )
};

export default Dummy;