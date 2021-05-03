import React, { useState, useContext, MouseEvent } from 'react';
import { midi, xolombrisxInstruments } from '../../../../store/Track';
import styles from './instrumentTab.module.scss';
import MenuButton from './MenuButton';
import InstrumentMenu from './InstrumentMenu';
import MenuEmitter, { menuEmitterEventTypes } from '../../../../lib/MenuEmitter';
import MenuContext from '../../../../context/MenuContext';

// import midi interfce handlers 

interface InstrumentTabProps {
    midi: midi,
    instrument: xolombrisxInstruments,
    first: boolean;
    selectTrack: () => void;
    changeInstrument: (instrument: xolombrisxInstruments) => void,
    removeInstrument: () => void;
    trackIndex: number,
    trackId: number,
    setMIDIInput: {
        device: (trackIndex: number, device: string) => void;
        channel: (trackIndex: number, channel: number) => void;
    }
}

const InstrumentTab: React.FC<InstrumentTabProps> = ({
    instrument, 
    midi, 
    selectTrack,
    changeInstrument,
    first,
    trackId,
    trackIndex,
    removeInstrument,
    setMIDIInput, 
}) => {
    const radius = first ? styles.border : ''
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuContext = useContext(MenuContext);
    const indicatorId = `menu:track:${trackId}`
    

    const toggleMenu = () => {
        setMenuOpen(state => !state);
    }

    const setMIDIChannel = (channel: number) => {
        setMIDIInput.channel(trackIndex, channel-1)
    }

    const setMIDIDevice = (device: string) => {
        setMIDIInput.device(trackIndex, device)
    }

    const onContextMenu = (e: MouseEvent) => {
        const id = menuContext.current?.[0]
        if (!id) {
            toggleMenu()
            MenuEmitter.emit(
                menuEmitterEventTypes.OPEN, 
                {id: indicatorId, close: toggleMenu}
            )
        } else {
            MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
            if (id !== indicatorId) {
                toggleMenu()
                MenuEmitter.emit(menuEmitterEventTypes.OPEN, 
                    {id: indicatorId, close: toggleMenu}
                )
            }
        }
    }


    return (
        <li onClick={selectTrack} className={`${styles.tab} ${radius}`}>
            {instrument}
            <span>
                <MenuButton onClick={toggleMenu}/> 
            </span>
            { isMenuOpen
            ? <InstrumentMenu
                setMIDIChannel={setMIDIChannel} 
                setMIDIDevice={setMIDIDevice}
                changeInstrument={changeInstrument}
                removeInstrument={removeInstrument}
                instrument={instrument}
                midi={midi}
            /> 
            : null
            }
        </li>
    )

}

export default InstrumentTab;