import React, { useContext } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

import { arrangerMode, Song } from '../../../store/Arranger';
import * as Tone from 'tone';

import Event, { pattsObj } from './Event';
import Dropdown from '../../UI/Dropdown';
import Plus from '../../UI/Plus';
import Minus from '../../UI/Minus'

import styles from './style.module.scss'
import ToneObjectsContext from '../../../context/ToneObjectsContext';

interface ArrangerLayoutProps {
    arrangerDispatchers: {
        _addSong: () => void,
        _renameSong: (event: React.FormEvent<HTMLFormElement>) => void ,
        _removeSong: () => void,
        _selectSong: (song: number) => void,
        _addRow: (eventIndex: number) => void,
        _removeRow: (eventIndex: number) => void,
        _incDecRepeat: (amount: number, song: number, eventIndex: number) => void,
        _setEventPattern: (eventIndex: number, pattern: number) => void,
        _setRepeat: (repeat: number, eventIndex: number) => void,
        onDragEnd: (result: DropResult) => void,
    },
    pattsObj: pattsObj,
    activeSongObj: Song,
    isPlay: boolean,
    currentSong: number,
    songs: {[key: number]: Song},
    arrgMode: arrangerMode,
}

const Arranger: React.FC<ArrangerLayoutProps> = ({
    arrangerDispatchers,
    activeSongObj,
    pattsObj,
    arrgMode,
    currentSong,
    isPlay,
    songs
}) => {
    const ref_toneObjects = useContext(ToneObjectsContext);

    return (
        <div className={styles.border}>
        <div className={styles.top}>
            <div className={styles.title}><h1>Songs</h1></div>
            <div className={styles.songSelector}>
                <div className={styles.selector}>
                    <Dropdown
                        onSubmit={arrangerDispatchers._renameSong}
                        renamable={true}
                        selected={String(currentSong)}
                        dropdownId={`song ${currentSong} selector`}
                        className={styles.dropdown}
                        select={
                            (value) => {arrangerDispatchers._selectSong(Number(value)) }
                        }
                        keyValue={
                            Object.keys(songs).map(song => [song, songs[Number(song)].name])
                        }
                    />
                </div>
                <div className={styles.increase}>
                    { 
                        arrgMode === 'pattern' || (arrgMode === arrangerMode.ARRANGER && !isPlay) 
                        ? <Plus onClick={arrangerDispatchers._addSong} /> 
                        : null 
                    }
                </div>
                <div className={styles.decrease}>
                    {
                        Object.keys(songs).length > 1 
                            && (arrgMode === arrangerMode.PATTERN 
                            || arrgMode === arrangerMode.ARRANGER && !isPlay
                        ) 
                        ? <Minus onClick={arrangerDispatchers._removeSong} /> 
                        : null
                        }
                </div>
            </div>
        </div>
        <div className={styles.bottom}>
            <div className={styles.tableTitle}>
                <div className={styles.title}><h3>Patterns  |  Repeat </h3></div>
            </div>
            <div className={styles.dnd}>
                <DragDropContext onDragEnd={arrangerDispatchers.onDragEnd}>
                    <Droppable droppableId={'arranger'}>
                        {(provided) => (
                            <ul {...provided.droppableProps} ref={provided.innerRef}>
                                {activeSongObj.events.map((songEvent, idx, arr) => {
                                    return (
                                        <Event 
                                            key={`song ${currentSong} event ${songEvent.id}`} 
                                            arrgMode={arrgMode}
                                            isPlay={isPlay}
                                            _addRow={arrangerDispatchers._addRow}
                                            _incDecRepeat={arrangerDispatchers._incDecRepeat}
                                            _removeRow={arrangerDispatchers._removeRow}
                                            _setEventPattern={arrangerDispatchers._setEventPattern}
                                            _setRepeat={arrangerDispatchers._setRepeat}
                                            arr={arr}
                                            currentSong={currentSong}
                                            eventsLength={activeSongObj.events.length}
                                            idx={idx}
                                            pattsObj={pattsObj}
                                            songEvent={songEvent}
                                        />
                                    )
                                })}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    </div>
    )
}

export default Arranger;