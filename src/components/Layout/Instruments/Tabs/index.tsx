import React, { useState, useContext, MutableRefObject, useRef, useEffect } from 'react';
import { trackInfo, xolombrisxInstruments } from '../../../../store/Track'
import styles from './style.module.scss';
import InstrumentTab from './InstrumentTab';
import { trackMax } from '../../../../containers/Track/defaults';
import mais from '../../../../assets/plus.svg';
import OptionList from './OptionList';
import MenuContext from '../../../../context/MenuContext';
import MenuEmitter, { menuEmitterEventTypes } from '../../../../lib/MenuEmitter';
import menuStyles from './instrumentMenu.module.scss';



interface TabsProps {
    Tracks: trackInfo[]
    selectInstrument: (trackIndex: number) => void;
    removeInstrument: (trackIndex: number, trackId: number) => void;
    changeInstrument: (instrument: xolombrisxInstruments) => void;
    addInstrument: (instrument: xolombrisxInstruments) => void;
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
    addInstrument,
    setMIDIInput,
}) => {
    const [isAddOpen, setAdd] = useState(false);
    const onAction = (item: xolombrisxInstruments) => {
        MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
        addInstrument(item)
    }
    const instrumentListPicker = (
        <ul 
            className={menuStyles.menu}
            style={{
                left: 0,
                top: 0,
            }}
        >
            <OptionList label={'instrument'} list={Object.values(xolombrisxInstruments)} onAction={onAction} selected={''}/>
        </ul>
    )
    const menuContext = useContext(MenuContext)
    const listRef: MutableRefObject<HTMLLIElement | null> = useRef(null)


    const toggleMenu = () => {
        setAdd(state => !state);
    }

    function onContextMenu(this: HTMLLIElement, e: MouseEvent){
        e.stopPropagation()
        const id = menuContext.current?.[0]
        if (!id) {
            setAdd(state => !state);
            MenuEmitter.emit(
                menuEmitterEventTypes.OPEN, 
                {id: 'addInstrumentButton', close: toggleMenu}
            )
        } else {
            MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
            if (id !== 'addInstrumentButton') {
                setAdd(state => !state);
                MenuEmitter.emit(menuEmitterEventTypes.OPEN, 
                    {id: 'addInstrumentButton', close: toggleMenu}
                )
            }
        }
    }

    useEffect(() => {
        listRef.current?.addEventListener('click', onContextMenu)
        return () => {
            listRef.current?.removeEventListener('click', onContextMenu)
        }
    }, [])

    return (
        <nav className={`${styles.tabs} ${className}`}>
            <ul className={styles.ul}>
            { Tracks.map((track, idx, arr) => {
                return <InstrumentTab 
                    key={`tab:instrument:${track.id}`}
                    first={ idx === 0 }
                    instrument={track.instrument}
                    changeInstrument={changeInstrument}
                    midi={track.midi}
                    selectTrack={() => selectInstrument(idx)}
                    removeInstrument={() => removeInstrument(idx, track.id)}
                    setMIDIInput={setMIDIInput}
                    trackId={track.id}
                    trackIndex={idx}
                    count={arr.length}
                    />
            })}
            { 
                Tracks.length < trackMax 
                ? <li ref={listRef} className={styles.plus}>
                    <img className={styles.svg} src={mais} alt='plus' width={'100%'} height={'100%'} /> 
                    { isAddOpen ? instrumentListPicker : null }
                </li> 
                : null 
            }
            </ul>
        </nav>
    )
}

export default Tabs;