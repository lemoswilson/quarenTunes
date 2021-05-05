import React, { useState } from 'react';
import Polygon from '../../Dropdown/Polygon';
import styles from './instrumentMenu.module.scss';
import { xolombrisxInstruments } from '../../../../store/Track'
import OptionList from './OptionList';
import optionListStyles from './optionList.module.scss';
import { midi } from '../../../../store/Track'
import { useSelector }  from 'react-redux';
import { RootState } from '../../../../containers/Xolombrisx';
import { startEndRange } from '../../../../lib/utility';

interface MenuProps {
    setMIDIChannel: (channel: number) => void;
    setMIDIDevice: (device: string) => void;
    changeInstrument: (instrument: xolombrisxInstruments) => void;
    removeInstrument: () => void; 
    instrument: xolombrisxInstruments,
    midi: midi, 
    count: number,
}

const InstrumentMenu: React.FC<MenuProps> = ({
    removeInstrument,
    changeInstrument,
    setMIDIChannel,
    count, 
    setMIDIDevice,
    instrument,
    midi,
}) => {
    const availableMIDIDevices = useSelector((state: RootState) =>  Object.keys(state.midi.devices))
    const midiChannel =  
        midi.channel === 'all' 
        ? midi.channel 
        : typeof midi.channel === 'number' && !Number.isNaN(Number(midi.channel)) 
        ? midi.channel + 1 
        : undefined

    return (
        <ul className={styles.menu} >
            <OptionList 
                // open={instrumentListOpen}
                label={'Instrument'} 
                list={Object.values(xolombrisxInstruments)} 
                onAction={changeInstrument} 
                selected={instrument}
            />
            <OptionList 
                // open={midiDeviceListOpen}
                label={'Midi Device'} 
                list={availableMIDIDevices} 
                onAction={setMIDIDevice} 
                selected={midi.device}
            />
            <OptionList 
                // open={midiChannelListOpen}
                label={'Midi Channel'} 
                list={midi.device !== 'onboardKey' ? startEndRange(1, 16) : []} 
                onAction={setMIDIChannel} 
                selected={midiChannel}
            />
            {
                count > 1 
                ? <li 
                    style={{border: 'none' , cursor: 'pointer'}} 
                    className={optionListStyles.listElement} 
                    onClick={removeInstrument}><span style={{width: '0.6rem'}}
                ></span>Remove Device</li>
                : null
            }
        </ul>
    )
}

export default InstrumentMenu;