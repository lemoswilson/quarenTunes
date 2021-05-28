import React, { useContext, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import usePrevious from '../../../hooks/lifecycle/usePrevious';
import { Draggable } from 'react-beautiful-dnd';

import { songEvent } from '../../../store/Arranger';
import { Pattern } from '../../../store/Sequencer';

import { RootState } from '../../../store';

import Dropdown from '../../UI/Dropdown';
import styles from './event.module.scss';
import Minus from '../../UI/Minus';
import Plus from '../../UI/Plus';
import NumberBox from '../../UI/NumberBox';
import ToneObjects from '../../../context/ToneObjectsContext';
import { arrangerMode } from '../../../store/Arranger';
import { timeObjFromEvent } from '../../../lib/utility';
import EventsHandler from '../../../containers/Arranger/EventsHandler';
import useQuickRef from '../../../hooks/lifecycle/useQuickRef';
import { selectedTrkIdxSelector, trkCountSelector } from '../../../store/Track/selectors';
import { activePattSelector } from '../../../store/Sequencer/selectors';

interface EventProps {
    currentSong: number,
    songEvent: songEvent,
    idx: number,
    eventsLength: number,
    pattsObj: pattsObj
    arr: songEvent[],
    isPlay: boolean,
    arrgMode: arrangerMode,
    _removeRow: (index: number) => void,
    _setEventPattern: (eventIndex: number, pattern: number) => void,
    _incDecRepeat: (amount: number, song: number, eventIndex: number) => void,
    _setRepeat: (repeat: number, eventIndex: number) => void,
    _addRow: (index: number) => void,
}

export interface pattsObj {
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

    const pattern = songEvent.pattern;
    const pattObj = useSelector((state: RootState) => state.sequencer.present.patterns[pattern])
    const ref_pattObj = useQuickRef(pattObj);

    const trackCount = useSelector(trkCountSelector);

    const activePatt = useSelector(activePattSelector)
    const prev_activePatt = usePrevious(activePatt);

    const selectedTrkIdx = useSelector(selectedTrkIdxSelector)
    const prev_selectedTrkidx = usePrevious(selectedTrkIdx);
    const selectedTrkId = useSelector((state: RootState) => state.track.present.tracks[selectedTrkIdx].id);
    
    const selectedTrkPattLen = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIdx].length)
    const prev_selectedTrkPattLen = usePrevious(selectedTrkPattLen);
    const page = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIdx].page)
    const stepEvents = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIdx].events)

    
    const setupEventPart = useCallback((newEvents?: boolean, track?: number) => {
        console.log(`[Event.tsx]: setupEventPart has been called`)
        const trackNumber = Number(track);
    
        if (ref_toneObjects.current){
            for (let i = 0; i < trackCount; i ++){
                // if (!Number.isNaN(trackNumber) && i !== track)
                //     continue

                // ref_toneObjects.current.arranger[idx][i].instrument.loopEnd = {'16n': pattObj.tracks[i].length}
                ref_toneObjects.current.arranger[idx][i].instrument.loopEnd = {'16n': ref_pattObj.current.tracks[i].length}
                ref_toneObjects.current.arranger[idx][i].instrument.loop = true;

                if (newEvents) {
                    ref_toneObjects.current.arranger[idx][i].instrument.clear();
                    console.log(`[Event.tsx]: should be setting new events into arranger, ArrangerEvent ${idx}, track ${i}`)
                    // pattObj.tracks[i].events.forEach((event, step, arr) => {
                    ref_pattObj.current.tracks[i].events.forEach((event, step, arr) => {
                        console.log(`[Event.tsx]: setting stepEvent event at step ${step}, instrument`)
                        ref_toneObjects.current
                        ?.arranger[idx][i].instrument
                        .at(timeObjFromEvent(
                            step, 
                            event, 
                            true
                            ), 
                        event.instrument)
                    })
                }
                    
                for (let j = 0; j < ref_toneObjects.current.arranger[idx][i].effects.length; j ++){
                    // ref_toneObjects.current.arranger[idx][i].effects[j].loopEnd = {'16n': pattObj.tracks[i].length}
                    ref_toneObjects.current.arranger[idx][i].effects[j].loopEnd = {'16n': ref_pattObj.current.tracks[i].length}
                    ref_toneObjects.current.arranger[idx][i].effects[j].loop = true;
                    
                    if (newEvents) {
                        ref_toneObjects.current.arranger[idx][i].effects[j].clear();
                        
                        // pattObj.tracks[i].events.forEach((event, step, arr) => {
                        ref_pattObj.current.tracks[i].events.forEach((event, step, arr) => {
                            console.log(`[Event.tsx]: setting stepEvent event at step ${step}, fx`)
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
    }, [])
            
    // setting events after first render of 
    useEffect(() => {
        console.log(
            '[Event.tsx]: pattern was changed, about to call setupEventPart, and set events into part'
        )
        setupEventPart(true);
    }, [pattern])


            
    useEffect(() => {
                
        if (
            activePatt === prev_activePatt 
            && selectedTrkPattLen !== prev_selectedTrkPattLen
            && selectedTrkIdx === prev_selectedTrkidx
            && activePatt === pattern
        ) {
            console.log(`[Event.tsx]: selected track length has been changed, 
                and active pattern is equal to event pattern, setting up event pattern
            `)
            setupEventPart(false)
        }
            // setupEventPart(false, selectedTrkIdx)
        

    }, [selectedTrkPattLen, activePatt])

    useEffect(() => {
        ref_toneObjects.current?.arranger[idx].forEach((trigg, trackIdx, _) => {
            trigg.instrument.callback = ref_toneObjects.current?.flagObjects[trackIdx].instrument.callback;
            trigg.effects.forEach((fxTrigg, fxIndex, __) => {
                fxTrigg.callback = ref_toneObjects.current?.flagObjects[trackIdx].effects[fxIndex].callback
            })
        })
    }, []);

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
                        <EventsHandler 
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