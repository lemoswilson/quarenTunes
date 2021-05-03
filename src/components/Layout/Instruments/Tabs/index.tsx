import React from 'react';
import { trackInfo, xolombrisxInstruments } from '../../../../store/Track'
import styles from './style.module.scss';
import InstrumentTab from './InstrumentTab';

interface TabsProps {
    Tracks: trackInfo[]
    selectInstrument: (trackIndex: number) => void;
    removeInstrument: (trackIndex: number, trackId: number) => void;
    changeInstrument: (instrument: xolombrisxInstruments) => void;
    className?: string,
    setMIDIInput: {
        device: (trackIndex: number, device: string) => void;
        channel: (trackIndex: number, channel: number) => void;
    }
}

const Tabs: React.FC<TabsProps> = ({ 
    Tracks, 
    className, 
    selectInstrument,
    changeInstrument,
    removeInstrument,
    setMIDIInput,
}) => {

    return (
        <nav className={`${styles.tabs} ${className}`}>
            <ul>
            { Tracks.map((track, idx, arr) => {
                return <InstrumentTab 
                    key={`tab:instrument:${track.id}`}
                    first={ idx === 0}
                    instrument={track.instrument}
                    changeInstrument={changeInstrument}
                    midi={track.midi}
                    selectTrack={() => selectInstrument(idx)}
                    removeInstrument={() => removeInstrument(idx, track.id)}
                    setMIDIInput={setMIDIInput}
                    trackId={track.id}
                    trackIndex={idx}
                    />
            })}
            </ul>
        </nav>
    )
}

export default Tabs;