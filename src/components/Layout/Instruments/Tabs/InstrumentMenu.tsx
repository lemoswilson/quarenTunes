import React from 'react';
import Polygon from '../../Dropdown/Polygon';
import styles from './style.module.scss';
import { xolombrisxInstruments } from '../../../../store/Track'
import OptionList from './OptionList';
import { midi } from '../../../../store/Track'
import { useSelector }  from 'react-redux';
import { RootState } from '../../../../containers/Xolombrisx';
import { startEndRange } from '../../../../lib/utility';

interface InstrumentMenuProps {
    setMIDIChannel: (channel: number) => void;
    setMIDIDevice: (device: string) => void;
    changeInstrument: (instrument: xolombrisxInstruments) => void;
    removeInstrument: () => void; 
    instrument: xolombrisxInstruments,
    midi: midi, 
}

const InstrumentMenu: React.FC<InstrumentMenuProps> = ({
    removeInstrument,
    changeInstrument,
    setMIDIChannel,
    setMIDIDevice,
    instrument,
    midi,
}) => {
    const midiDevices = useSelector((state: RootState) =>  Object.keys(state.midi.devices))
    const midiChannel = 
        midi.channel === 'all' 
        ? midi.channel 
        : midi.channel && !Number.isNaN(Number(midi.channel)) 
        ? midi.channel + 1 
        : undefined
     

    return (
        <ul>
            <OptionList label={'Instrument'} list={Object.values(xolombrisxInstruments)} onAction={changeInstrument} selected={instrument}/>
            <OptionList label={'Midi Device'} list={midiDevices} onAction={setMIDIDevice} selected={midi.device}/>
            <OptionList label={'Midi Channel'} list={startEndRange(1, 16)} onAction={setMIDIChannel} selected={midiChannel}/>
            <li onClick={removeInstrument}>Remove Device </li>
        </ul>
    )
}

export default InstrumentMenu;