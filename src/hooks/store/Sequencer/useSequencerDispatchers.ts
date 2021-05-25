import React, { MutableRefObject, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pattern } from '../../../store/Sequencer';
import triggEmitter, { triggEventTypes } from '../../../lib/Emitters/triggEmitter';
import * as Tone from 'tone';
import {
    addPattern,
    changePage,
    changePatternLength,
    changeTrackLength,
    deleteEvents,
    removePattern,
    selectPattern,
    selectStep,
    setNote,
    setNoteLength,
    setOffset,
    setPatternNoteLength,
    setVelocity,
    deleteNotes, 
    deleteLocks,
    incDecOffset, 
    incDecPatLength, 
    incDecTrackLength, 
    incDecStepVelocity, 
    renamePattern, 
    setPatternTrackVelocity, 
    incDecPTVelocity, 
} from '../../../store/Sequencer';
import { counterSelector } from '../../../store/Sequencer/selectors';
import { arrangerMode } from '../../../store/Arranger';
import { ToneObjectContextType } from '../../../context/ToneObjectsContext';


export type SequencerDispatchers = ReturnType<typeof useSequencerDispatchers>;

const useSequencerDispatchers = (
    ref_toneObjects: ToneObjectContextType,
    patterns: { [key: number]: Pattern },
    activePatt: number,
    ref_activePatt: MutableRefObject<number>,
    ref_selectedSteps: MutableRefObject<number[]>,
    ref_activePage: MutableRefObject<number>,
    arrangerMode: arrangerMode,
    isFollow: boolean,
    selectedTrkIdx: number,
    ref_selectedTrkIdx: MutableRefObject<number>,
    ref_trkCount: MutableRefObject<number>,
    effectsLength: number[],
    scheduleOrStop: (option: 'schedule' | 'stop', start?: boolean) => void,
) => {

    const dispatch = useDispatch()
    const counter = useSelector(counterSelector); 
    const patternQueue: MutableRefObject<number[] | null> = useRef(null)

    // const _duplicatePatt = (): void => {
    //     triggEmitter.emit(triggEventTypes.DUPLICATE_PATTERN, { pattern: activePatt })
    //     dispatch(duplicatePattern(activePatt));
    // };

    // const _toggleOverride = (): void => {
    //     dispatch(toggleOverride());
    // };

    // const _toggleRecordingQuantization = (): void => {
    //     dispatch(toggleRecordingQuantization());
    // };



    // patternDispatchers
    const _removePatt = (): void => {
        const next = Number(Object.keys(patterns).find(v => Number(v) !== activePatt))
        dispatch(removePattern(activePatt, next))
        triggEmitter.emit(triggEventTypes.REMOVE_PATTERN, { pattern: activePatt });
    };

    const _addPatt = () => {
        triggEmitter.emit(triggEventTypes.ADD_PATTERN, { pattern: counter })
        console.log('adding a patter, should be stopping this modafucking thing');
        scheduleOrStop('stop');
        dispatch(addPattern());
        // ref_newPattern.current = true;
    }

    const _selectPatt = (key: string): void => {
        let nextPattern: number = Number(key);
        let currPatt = activePatt;

        if (arrangerMode === 'pattern'){
            console.log('sequencer_container.tsx: selecting pattern, tone trasport state is ', Tone.Transport.state);

            if (Tone.Transport.state === 'started') {

                // if transport is active and pattern mode selected, this should queue
                // the pattern to start looping at 

                if (patternQueue.current && patternQueue.current.length > 0) {
                    currPatt = patternQueue.current[0]
                    patternQueue.current.pop()
                } else if (patternQueue.current && patternQueue.current.length === 0){
                    patternQueue.current.push(currPatt)
                }

                // [...Array(trackCount).keys()].forEach((_, track, arr) => {
                [...Array(ref_trkCount.current).keys()].forEach((_, track, arr) => {
                    
                    ref_toneObjects.current?.patterns[currPatt][track].instrument.cancel();
                    ref_toneObjects.current?.patterns[currPatt][track].instrument.stop(0);

                    ref_toneObjects.current?.patterns[nextPattern][track].instrument.start(0)

                    const fxLength = effectsLength[track];

                    for (let j = 0; j < fxLength; j++) {
                        ref_toneObjects.current?.patterns[currPatt][track].effects[j].cancel();
                        ref_toneObjects.current?.patterns[currPatt][track].effects[j].stop(0);

                        ref_toneObjects.current?.patterns[nextPattern][track].effects[j].start(0)
                    }

                    Tone.Transport.scheduleOnce(() => {
                        if (ref_toneObjects.current){
                            dispatch(selectPattern(nextPattern))
                        }
                    }, 0);
                });

            } else {
                console.log('sequencer_container.tsx: selecting pattern, tone transport is stopped')
                scheduleOrStop('stop');
                dispatch(selectPattern(nextPattern));
            }
        } else {
            if (!isFollow)
                dispatch(selectPattern(nextPattern));
        }
    };



    // lengthDispatchers
    const _changeTrkLength = (
        newLength: number,
    ): void => {
        if (newLength <= 64 && newLength >= 1) {
            if (ref_toneObjects.current) {

                const nl = {'16n': newLength}
                ref_toneObjects.current.patterns[activePatt][selectedTrkIdx].instrument.loopEnd = nl;

                let i = 0;
                while (i < ref_toneObjects.current.patterns[activePatt][selectedTrkIdx].effects.length) {
                    ref_toneObjects.current.patterns[activePatt][selectedTrkIdx].effects[i].loopEnd = nl;
                    i++
                }
                dispatch(changeTrackLength(activePatt, selectedTrkIdx, newLength));
            }
        }
    };

    const _changePattLen = useCallback((newLength: number): void => {
        if (newLength >= 1) {
            dispatch(changePatternLength(activePatt, newLength))
        }
    }, [activePatt, dispatch]);

    const _incDecPattLen = useCallback((amount: number) => {
        dispatch(incDecPatLength(amount, activePatt))
    }, [activePatt, dispatch])

    const _incDecTrkLen = useCallback((amount: number) => {
        dispatch(incDecTrackLength(amount, activePatt, selectedTrkIdx))
    }, [activePatt, dispatch, selectedTrkIdx])

    const _changePage = useCallback((pageIndex: number): void => {
        dispatch(
            changePage(
                activePatt,
                selectedTrkIdx,
                pageIndex
            )
        );
    }, [dispatch, activePatt, selectedTrkIdx]);


    
    const mimicSelectedFromTo = (from: number, to: number) => {
        if (from === to) return;
        
        const v: number[] = []
        const r = [from * 16, from * 16 + 15]
        ref_selectedSteps.current.forEach(i => {
            if (i >= r[0] && i <= r[1]) v.push(i - 16*from);
        })
        v.forEach(value => {
            dispatch(selectStep(ref_activePatt.current, ref_selectedTrkIdx.current, to*16 + value))
        })
    }

    const pageClickHandler = useCallback((e: React.MouseEvent, pageIndex: number): void => {
        if (e.shiftKey) {
            mimicSelectedFromTo(ref_activePage.current, pageIndex)
        } else {
            _changePage(pageIndex)
        }
    }, [_changePage, ref_activePage])

    const _setOffset = (offset: number): void => {
        ref_selectedSteps.current.forEach(step => {
                dispatch(
                    setOffset(
                        activePatt,
                        selectedTrkIdx,
                        step,
                        offset
                    )
                );
            }
        )
    };


    const _setNote = (note: string): void => {
        ref_selectedSteps.current.forEach(s => {
            dispatch(
                setNote(
                    activePatt,
                    selectedTrkIdx,
                    note,
                    s
                )
            );
        });
    };

    const _setPattNoteLen = (length: string) => {
        const d = length === '###PT' ? undefined : length
        if (ref_selectedSteps.current.length === 0) {
            dispatch(
                setPatternNoteLength(
                    activePatt,
                    d,
                    selectedTrkIdx
                )
            );
        } else {
            _setNoteLength(d)
        }
    };

    const _setNoteLength = (noteLength: number | string | undefined): void => {
        ref_selectedSteps.current.forEach(step => {
            dispatch(
                setNoteLength(
                    activePatt,
                    selectedTrkIdx,
                    noteLength ? noteLength : 0,
                    step
                )
            );
        });
    };



    const _deleteEvents = (): void => {
        if (ref_selectedSteps.current.length >= 1) {
            ref_selectedSteps.current.forEach(step => {

                dispatch(
                    deleteEvents(
                        ref_activePatt.current,
                        ref_selectedTrkIdx.current,
                        step
                    )
                );
            });
        }
    };

    const _deleteNotes = (): void => {
        if (ref_selectedSteps.current.length >= 1) {
            ref_selectedSteps.current.forEach(step => {
                dispatch(deleteNotes(
                    ref_activePatt.current,
                    ref_selectedTrkIdx.current,
                    step
                ))
            })
        }
    }

    const _deleteLocks = (): void => {
        if (ref_selectedSteps.current.length >= 1) {
            ref_selectedSteps.current.forEach(step => {
                dispatch(deleteLocks(
                    ref_activePatt.current,
                    ref_selectedTrkIdx.current,
                    step
                ))
            })
        }
    }

    const _setVelocity = (velocity: number): void => {
        ref_selectedSteps.current.forEach(s => {
            dispatch(
                setVelocity(
                    activePatt,
                    selectedTrkIdx,
                    s,
                    velocity
                )
            );
        });
    };


    const _setPattTrkVelocity = (velocity: number): void => {
        dispatch(
            setPatternTrackVelocity(
                activePatt,
                selectedTrkIdx,
                velocity
            )
        );
    };

    const _selectStep = (index: number): void => {
        dispatch(
            selectStep(
                ref_activePatt.current,
                ref_selectedTrkIdx.current,
                index
            )
        );
    };


    const _incDecStepVelocity = (amount: number): void => {
            ref_selectedSteps.current.forEach(step => {
                dispatch(
                    incDecStepVelocity(
                        amount, 
                        activePatt, 
                        selectedTrkIdx, 
                        step
                    )
                )
            })
    }

    const _incDecPattTrkVelocity = (amount: number): void => {
        dispatch(incDecPTVelocity(
            amount,
            activePatt,
            selectedTrkIdx,
        )) 
    }


    const _incDecOffset = (amount: number): void => {
        ref_selectedSteps.current.forEach(step => {
            dispatch(
                incDecOffset(amount, ref_activePatt.current, ref_selectedTrkIdx.current, step)
            )
        })
    }

    const _renamePattern = (name: string) => {
        dispatch(renamePattern(activePatt, name));
    };

    return {
        _removePatt,
        _addPatt,
        _selectPatt,
        _changeTrkLength,
        _changePattLen,
        _incDecPattLen,
        _incDecTrkLen,
        _incDecStepVelocity,
        _setOffset,
        _setNote,
        _setPattNoteLen,
        _setNoteLength,
        _deleteEvents,
        _deleteNotes,
        _deleteLocks,
        _setVelocity,
        _setPattTrkVelocity,
        _incDecPattTrkVelocity,
        _incDecOffset,
        _selectStep,
        _renamePattern,
        pageClickHandler
    }

}

export default useSequencerDispatchers;