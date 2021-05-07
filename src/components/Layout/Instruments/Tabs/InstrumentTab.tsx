import React, { useState, useContext } from 'react';
import { midi, xolombrisxInstruments } from '../../../../store/Track';
import styles from './instrumentTab.module.scss';
import MenuButton from './MenuButton';
import InstrumentMenu from './InstrumentMenu';
import MenuEmitter, { menuEmitterEventTypes } from '../../../../lib/MenuEmitter';
import MenuContext from '../../../../context/MenuContext';
import { TypeFlags } from 'typescript';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../containers/Xolombrisx';
import { StateTimeline } from 'tone';

// import midi interfce handlers 

interface InstrumentTabProps {
    midi: midi,
    instrument: xolombrisxInstruments,
    first: boolean;
    selectTrack: () => void;
    changeInstrument: (instrument: xolombrisxInstruments) => void,
    count: number,
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
    count
}) => {
    const radius = first ? styles.radius : ''
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuContext = useContext(MenuContext);
    const indicatorId = `menu:track:${trackId}`
    const selectedTrack = useSelector((state: RootState) => state.track.present.selectedTrack)
    

    const toggleMenu = () => {
        setMenuOpen(state => !state);
    }

    function onContextMenu(this: SVGSVGElement, e: MouseEvent){
        e.stopPropagation()
        selectTrack()
        const id = menuContext.current?.[0]
        if (!id) {
            setMenuOpen(state => !state);
            MenuEmitter.emit(
                menuEmitterEventTypes.OPEN, 
                {id: indicatorId, close: toggleMenu}
            )
        } else {
            MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
            if (id !== indicatorId) {
                setMenuOpen(state => !state);
                MenuEmitter.emit(menuEmitterEventTypes.OPEN, 
                    {id: indicatorId, close: toggleMenu}
                )
            }
        }
    }

    const setMIDIChannel = (channel: number) => {
        setMIDIInput.channel(trackIndex, channel-1)
    }

    const setMIDIDevice = (device: string) => {
        setMIDIInput.device(trackIndex, device)
    }


    return (
        <li className={`${styles.tab} ${radius}`}>
            <div style={{border: selectedTrack === trackIndex ? '1px solid rgba(166, 215, 230, 0.781)' : '1px solid #ededed' }} className={`${styles.border} ${radius}`}>
                <div onClick={selectTrack} className={styles.instrumentTitle}>
                    { `${trackIndex + 1}. ${instrument} `}
                </div>
                <div className={styles.menuButton}>
                    <MenuButton onClickSVG={onContextMenu}/>
                { isMenuOpen
                ? <InstrumentMenu
                    setMIDIChannel={setMIDIChannel}
                    setMIDIDevice={setMIDIDevice}
                    changeInstrument={changeInstrument}
                    removeInstrument={removeInstrument}
                    instrument={instrument}
                    midi={midi}
                    count={count}
                />
                : null
                }
                </div>
            </div>
        </li>
    )

}

export default InstrumentTab;