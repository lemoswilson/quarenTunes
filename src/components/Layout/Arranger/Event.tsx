import React, { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import usePrevious from '../../../hooks/usePrevious';
import { Draggable } from 'react-beautiful-dnd';

import { songEvent } from '../../../store/Arranger';
import { Pattern } from '../../../store/Sequencer';

import { RootState } from '../../../containers/Xolombrisx';

import Dropdown from '../Dropdown';
import styles from './event.module.scss';
import Minus from '../Icons/Minus';
import Plus from '../Icons/Plus';
import NumberBox from '../NumberBox';
import ToneObjects from '../../../context/ToneObjectsContext';
import { arrangerMode } from '../../../store/Arranger';
import { bbsFromSixteenth } from '../../../containers/Arranger';
import { startEndRange, timeObjFromEvent, getFinalStep } from '../../../lib/utility';
import EventsHandler from '../../../containers/Arranger/EventsHandler';

interface EventProps {
    currentSong: number,
    songEvent: songEvent,
    idx: number,
    eventsLength: number,
    pattsObj: pattObjs
    arr: songEvent[],
    isPlay: boolean,
    arrgMode: arrangerMode,
    _removeRow: (index: number) => void,
    _setEventPattern: (eventIndex: number, pattern: number) => void,
    _incDecRepeat: (amount: number, song: number, eventIndex: number) => void,
    _setRepeat: (repeat: number, eventIndex: number) => void,
    _addRow: (index: number) => void,
}

interface pattObjs {
    [key: number]: Pattern
}

const Event: React.FC<EventProps> = ({
    currentSong, 
    songEvent, 
    idx, 
    eventsLength, 
    arr,
    pattsObj, 
    isPlay,
    arrgMode,
    _removeRow,
    _setEventPattern,
    _incDecRepeat,
    _setRepeat,
    _addRow,
}) => {
    const ref_toneObjects = useContext(ToneObjects)

    const repeat = songEvent.repeat;
    const pattern = songEvent.pattern;
    const pattObj = useSelector((state: RootState) => state.sequencer.present.patterns[pattern])

    const trackCount = useSelector((state: RootState) => state.track.present.trackCount);

    const activePatt = useSelector((state: RootState) => state.sequencer.present.activePattern)
    const prev_activePatt = usePrevious(activePatt);

    const activePattLen = useSelector((state:RootState) => state.sequencer.present.patterns[activePatt].patternLength)
    const prev_activePattLen = usePrevious(activePattLen)
    
    const selectedTrkIdx = useSelector((state: RootState) => state.track.present.selectedTrack)
    const prev_selectedTrkidx = usePrevious(selectedTrkIdx);
    const selectedTrkId = useSelector((state: RootState) => state.track.present.tracks[selectedTrkIdx].id);
    
    const selectedTrkPattLen = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIdx].length)
    const prev_selectedTrkPattLen = usePrevious(selectedTrkPattLen);
    const page = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIdx].page)
    const stepEvents = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIdx].events)

    // useEffect(() => {
    //     console.log('event is rendered, selectedTrkPattLen is ', selectedTrkPattLen);
    // }, [])
    
    const setupEventPart = (newEvents?: boolean, track?: number) => {
            const trackNumber = Number(track);
        
            if (ref_toneObjects.current){
                    for (let i = 0; i < trackCount; i ++){
                if (!Number.isNaN(trackNumber) && i !== track)
                    continue

                // ref_toneObjects.current.arranger[idx][i].instrument.loopEnd = bbsFromSixteenth(pattObj.tracks[i].length)
                ref_toneObjects.current.arranger[idx][i].instrument.loopEnd = {'16n': pattObj.tracks[i].length}
                ref_toneObjects.current.arranger[idx][i].instrument.loop = true;

                if (newEvents) {
                    ref_toneObjects.current.arranger[idx][i].instrument.clear();
    
                    pattObj.tracks[i].events.forEach((event, step, arr) => {
                        ref_toneObjects.current
                        ?.arranger[idx][i].instrument
                        .at(timeObjFromEvent(
                            step, 
                            event, 
                            true
                            ), event.instrument)
                        })
                    }
                    
                    for (let j = 0; j < ref_toneObjects.current.arranger[idx][i].effects.length; j ++){
                        ref_toneObjects.current.arranger[idx][i].effects[j].loopEnd = {'16n': pattObj.tracks[i].length}
                        ref_toneObjects.current.arranger[idx][i].effects[j].loop = true;
                        
                        if (newEvents) {
                            ref_toneObjects.current.arranger[idx][i].effects[j].clear();
                            
                            pattObj.tracks[i].events.forEach((event, step, arr) => {
                                ref_toneObjects.current
                                ?.arranger[idx][i].effects[j]
                                .at(timeObjFromEvent(
                                    step, 
                                    event, 
                                    true
                                    ), event.fx[j])
                            })
                        }
                            
                    }
            }
        }
    }
            
    // setting events after first render of 
    useEffect(() => {
        setupEventPart(true);
    }, [pattern])


            
    useEffect(() => {
                
        if (
            activePatt === prev_activePatt 
            && selectedTrkPattLen !== prev_selectedTrkPattLen
            && selectedTrkIdx === prev_selectedTrkidx
            && activePatt === pattern
        ) 
            setupEventPart(false, selectedTrkIdx)
        

    }, [selectedTrkPattLen, activePatt])

    return (

        <Draggable 
            key={`song ${currentSong} event ${songEvent.id}`} 
            draggableId={`song ${currentSong} event ${songEvent.id}`} 
            index={idx}
        >
            {(draggable) => (
                <div 
                    {...draggable.dragHandleProps} 
                    {...draggable.draggableProps} 
                    ref={draggable.innerRef} 
                    className={styles.div} 
                >
                    {
                        eventsLength > 1 && !(arrgMode === arrangerMode.ARRANGER && isPlay)
                        ? <div className={styles.delete}> 
                                <Minus onClick={() => { _removeRow(idx) }} small={true} />
                        </div> 
                        : <div></div>
                    }
                    <div style={{ zIndex: arr.length - idx }} className={styles.selector}>
                        <Dropdown 
                            dropdownId={`song ${currentSong} event ${songEvent.id}`} 
                            keyValue={Object.keys(pattsObj).map(k => [String(k), pattsObj[Number(k)].name])} 
                            className={styles.out} select={(key) => { _setEventPattern(idx, Number(key)) }} 
                            selected={String(songEvent.pattern)} 
                        />
                        { 
                            activePatt === pattern 
                            ? <EventsHandler 
                                page={page} 
                                selectedTrkPattLen={selectedTrkPattLen}
                                stepEvents={stepEvents}
                                activePatt={activePatt}
                                arrgEventId={songEvent.id}
                                arrgEventIdx={idx}
                                selectedTrk={selectedTrkIdx}
                                selectedTrkId={selectedTrkId}
                                song={currentSong}
                            />
                            : null
                        }
                    </div>
                    <div className={styles.repeat}> 
                        <NumberBox 
                            increaseDecrease={
                                (value) => _incDecRepeat(value, songEvent.id, idx)
                            } 
                            updateValue={(
                                value) => _setRepeat(value, idx)
                            } 
                            value={songEvent.repeat} 
                        />
                    </div>
                    <div className={styles.add}>
                        { !(arrgMode === arrangerMode.ARRANGER && isPlay) ? <Plus onClick={() => { _addRow(idx) }} small={true} /> : null}
                    </div>
                </div>
            )}
        </Draggable>

    )
}

export default Event;