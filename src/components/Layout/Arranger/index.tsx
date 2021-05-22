import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

import { arrangerMode, Song } from '../../../store/Arranger';

import Event, { pattsObj } from './Event';
import Dropdown from '../../UI/Dropdown';
import Plus from '../../UI/Plus';
import Minus from '../../UI/Minus'

import styles from './style.module.scss'

interface ArrangerLayoutProps {
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
    pattsObj: pattsObj,
    activeSongObj: Song,
    isPlay: boolean,
    currentSong: number,
    songs: {[key: number]: Song},
    arrgMode: arrangerMode,
}

const Arranger: React.FC<ArrangerLayoutProps> = ({
    onDragEnd,
    _addSong,
    _removeSong,
    _renameSong,
    _selectSong,
    _addRow,
    _removeRow,
    _incDecRepeat,
    _setEventPattern,
    _setRepeat,
    activeSongObj,
    pattsObj,
    arrgMode,
    currentSong,
    isPlay,
    songs
}) => {

    return (
        <div className={styles.border}>
        <div className={styles.top}>
            <div className={styles.title}><h1>Songs</h1></div>
            <div className={styles.songSelector}>
                <div className={styles.selector}>
                    <Dropdown
                        keyValue={Object.keys(songs).map(song => [song, songs[Number(song)].name])}
                        onSubmit={_renameSong}
                        select={(value) => { _selectSong(Number(value)) }}
                        renamable={true}
                        selected={String(currentSong)}
                        dropdownId={`song ${currentSong} selector`}
                        className={styles.dropdown}
                    />
                </div>
                <div className={styles.increase}>{ arrgMode === 'pattern' || (arrgMode === arrangerMode.ARRANGER && !isPlay) ? <Plus onClick={_addSong} /> : null }</div>
                <div className={styles.decrease}>{Object.keys(songs).length > 1 && (arrgMode === arrangerMode.PATTERN || arrgMode === arrangerMode.ARRANGER && !isPlay) ? <Minus onClick={_removeSong} /> : null}</div>
            </div>
        </div>
        <div className={styles.bottom}>
            <div className={styles.tableTitle}>
                <div className={styles.title}><h3>Patterns  |  Repeat </h3></div>
            </div>
            <div className={styles.dnd}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={'arranger'}>
                        {(provided) => (
                            <ul {...provided.droppableProps} ref={provided.innerRef}>
                                {activeSongObj.events.map((songEvent, idx, arr) => {
                                    return (
                                        <Event 
                                            key={`song ${currentSong} event ${songEvent.id}`} 
                                            arrgMode={arrgMode}
                                            isPlay={isPlay}
                                            _addRow={_addRow}
                                            _incDecRepeat={_incDecRepeat}
                                            _removeRow={_removeRow}
                                            _setEventPattern={_setEventPattern}
                                            _setRepeat={_setRepeat}
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
        {/* {trackCount} */}
    </div>
    )
}

export default Arranger;