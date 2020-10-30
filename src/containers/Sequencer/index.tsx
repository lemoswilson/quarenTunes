import React, {
    useEffect,
    useContext,
    FunctionComponent,
    useState,
    MutableRefObject,
    ChangeEvent,
    useRef,
    KeyboardEvent,
    useCallback, RefObject
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import triggCtx from '../../context/triggState';
import triggEmitter, { triggEventTypes } from '../../lib/triggEmitter';
import Tone from '../../lib/tone';
import useQuickRef from '../../hooks/useQuickRef';
import {
    addPattern,
    changePage,
    changePatternLength,
    changeTrackLength,
    deleteEvents,
    removePattern,
    // Sequencer,
    selectPattern,
    selectStep,
    setNote,
    setNoteLength,
    duplicatePattern,
    setOffset,
    setPatternNoteLength,
    setVelocity,
    toggleOverride,
    toggleRecordingQuantization,
    changePatternName,
} from '../../store/Sequencer';
import usePrevious from '../../hooks/usePrevious';
import Steps from '../../components/Steps/Steps'
import StepsEdit from '../../components/StepsEdit/StepsEdit'
import { bbsFromSixteenth } from '../Arranger'
import { RootState } from '../Xolombrisx';
import { setPatternTrackVelocity } from '../../store/Sequencer/actions';
import { timeObjFromEvent } from '../../lib/utility';


const Sequencer: FunctionComponent = () => {
    const triggRef = useContext(triggCtx);
    const dispatch = useDispatch()

    const isPlaying = useSelector((state: RootState) => state.transport.present.isPlaying);
    const sequencer = useSelector((state: RootState) => state.sequencer.present);
    const previousPlaying = usePrevious(isPlaying);
    const arrangerMode = useSelector((state: RootState) => state.arranger.present.mode);
    const counter = useSelector((state: RootState) => state.sequencer.present.counter);
    const isFollowing = useSelector((state: RootState) => state.arranger.present.following);
    // const activePageRef = useQuickRef(activePage);

    const activePattern = useSelector((state: RootState) => state.sequencer.present.activePattern);
    // **** Preciso atualizar a ref com o useEffect;
    // const activePatternRef = useQuickRef(activePattern);
    const activePatternRef = useRef(activePattern);
    useEffect(() => { activePatternRef.current = activePattern }, [activePattern])
    const selectedTrack = useSelector((state: RootState) => state.track.present.selectedTrack)
    const selected = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].selected);
    // const selectedRef = useQuickRef(selected);
    const selectedRef = useRef(selected);
    useEffect(() => { selectedRef.current = selected }, [selected])
    const selLen = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].noteLength);
    const patternTrackVelocity = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].velocity);
    // const selLenRef = useQuickRef(selLen);
    const selLenRef = useRef(selLen);
    useEffect(() => { selLenRef.current = selLen }, [selLen])
    const trackCount = useSelector((state: RootState) => state.track.present.trackCount)
    const activePatternObj = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern])
    const patternAmount = useSelector((state: RootState) => Object.keys(state.sequencer.present.patterns).length)
    const events = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].events);
    const patternLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].patternLength)
    const patternNoteLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].noteLength)
    const trackLength = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].length)
    const activePage = useSelector((state: RootState) => state.sequencer.present.patterns[activePattern].tracks[selectedTrack].page);
    const activePageRef = useRef(activePage);
    useEffect(() => { activePageRef.current = activePage }, [activePage])

    const remPattern = (): void => {
        dispatch(removePattern(activePattern))
        triggEmitter.emit(triggEventTypes.REMOVE_PATTERN, { pattern: activePattern });
    };

    const dupPattern = (): void => {
        triggEmitter.emit(triggEventTypes.DUPLICATE_PATTERN, { pattern: activePattern })
        dispatch(duplicatePattern(activePattern));
    };

    const tOverride = (): void => {
        dispatch(toggleOverride());
    };

    const tRecordingQuntization = (): void => {
        dispatch(toggleRecordingQuantization());
    };

    const adPattern = useCallback(() => {
        triggEmitter.emit(triggEventTypes.ADD_PATTERN, { pattern: counter })
        dispatch(addPattern());
    }, [
        // triggEmitter,
        dispatch,
        // addPattern,
        counter
    ]);

    const chgTrackLength = (
        newLength: number,
        Ref: RefObject<HTMLFormElement>
    ): void => {
        if (newLength <= 64 && newLength >= 1) {
            const nl = bbsFromSixteenth(newLength)
            triggRef.current[activePattern][selectedTrack].instrument.loopEnd = nl;
            let i = 0;
            while (i < 4) {
                triggRef.current[activePattern][selectedTrack].effects[i].loopEnd = nl;
                i++
            }
            dispatch(changeTrackLength(activePattern, selectedTrack, newLength));
        }
    };

    const chgPatternLength = useCallback((
        newLength: number,
        ref: RefObject<HTMLFormElement>
    ): void => {
        if (newLength >= 1) {
            if (arrangerMode === "pattern") {
                Tone.Transport.loopEnd = bbsFromSixteenth(newLength);
            }
            dispatch(changePatternLength(activePattern, newLength))
        }
    }, [activePattern, arrangerMode, dispatch]);

    const selPattern = (e: ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        let nextPattern: number = e.currentTarget.valueAsNumber;
        let loopEnd = sequencer.patterns[nextPattern].patternLength;

        if (Tone.Transport.state === "started") {

            [...Array(trackCount).keys()].forEach(track => {
                triggRef.current[activePattern][track].instrument.stop(0);
                triggRef.current[nextPattern][track].instrument.start(0)
                const l = triggRef.current[activePattern][track].effects.length
                for (let j = 0; j < l; j++) {
                    triggRef.current[activePattern][track].effects[j].stop(0);
                    triggRef.current[nextPattern][track].effects[j].start(0)
                }

                Tone.Transport.scheduleOnce(() => {
                    Tone.Transport.loopEnd = bbsFromSixteenth(loopEnd);
                    triggRef.current[activePatternRef.current][track].instrument.mute = true;
                    triggRef.current[nextPattern][track].instrument.mute = false;
                    const l = triggRef.current[activePattern][track].effects.length
                    for (let j = 0; j < l; j++) {
                        triggRef.current[activePatternRef.current][track].effects[j].mute = true;
                        triggRef.current[nextPattern][track].effects[j].mute = false;
                    }

                }, 0);
            });
            Tone.Transport.scheduleOnce((time) => {
                Tone.Draw.schedule(() => {
                    dispatch(selectPattern(nextPattern));
                }, time)
            }, 0);

        } else {
            [...Array(trackCount).keys()].forEach(track => {
                triggRef.current[activePattern][track].instrument.stop();
                const l = triggRef.current[activePattern][track].effects.length
                for (let j = 0; j < l; j++) {
                    triggRef.current[activePattern][track].effects[j].stop();
                }
            });
            dispatch(selectPattern(nextPattern));
        }

    };

    const chgPatternName = useCallback((name: string): void => {
        dispatch(
            changePatternName(
                activePattern,
                name
            )
        );
    }, [activePattern, dispatch]);

    const chgPage = useCallback((pageIndex: number): void => {
        dispatch(
            changePage(
                activePattern,
                selectedTrack,
                pageIndex
            )
        );
    }, [dispatch, activePattern, selectedTrack]);

    const sOffSet = (direction: number): void => {
        selectedRef.current.forEach(step => {
            let eVent = { ...activePatternObj.tracks[selectedTrack].events[step] };
            let currOffset: number = eVent.offset ? eVent.offset : 0;
            // let pastEventTime = {
            //     '16n': step,
            //     '128n': currOffset
            // };
            if ((direction > 0 && currOffset + direction <= 128)
                || (direction < 0 && currOffset + direction >= -128)) {
                let off: number = currOffset + direction;
                // let newEventTime = {
                //     '16n': step,
                //     '128n': off,
                // };
                // triggRef.current[activePattern][selectedTrack].remove(pastEventTime);
                // triggRef.current[activePattern][selectedTrack].at(newEventTime, eVent)
                dispatch(
                    setOffset(
                        activePattern,
                        selectedTrack,
                        step,
                        off
                    )
                );
            }
        })
    };

    const sNote = (note: string[]): void => {
        selectedRef.current.forEach(s => {
            // let e = { ...activePatternObj.tracks[selectedTrack].events[s] };
            // let time = {
            //     '16n': s,
            //     '128n': e.offset,
            // }
            // e.note = note ? note : [];
            // triggRef.current[activePattern][selectedTrack].at(time, e);
            dispatch(
                setNote(
                    activePattern,
                    selectedTrack,
                    note,
                    s
                )
            );
        });
    };

    const sPatternNoteLength = (length: number | string) => {
        dispatch(
            setPatternNoteLength(
                activePattern,
                length,
                selectedTrack
            )
        );
    };

    const sNoteLength = (noteLength: number | string): void => {
        selectedRef.current.forEach(step => {
            // let e = { ...activePatternObj.tracks[selectedTrack].events[step] };
            // let time = {
            //     '16n': step,
            //     '128n': e.offset,
            // };
            // e.length = noteLength;
            // triggRef.current[activePattern][selectedTrack].at(time, e)
            dispatch(
                setNoteLength(
                    activePattern,
                    selectedTrack,
                    noteLength,
                    step
                )
            );
        });
    };

    const delEvents = (): void => {
        if (selectedRef.current.length >= 1) {
            selectedRef.current.forEach(s => {
                let e = { ...activePatternObj.tracks[selectedTrack].events[s] }
                let time = timeObjFromEvent(s, e)
                triggRef.current[activePattern][selectedTrack].instrument.remove(time);
                const l = triggRef.current[activePattern][selectedTrack].effects.length
                for (let j = 0; j < l; j++) {
                    triggRef.current[activePattern][selectedTrack].effects[j].remove(time);
                }
                dispatch(
                    deleteEvents(
                        activePattern,
                        selectedTrack,
                        s
                    )
                );
            });
        }
    };

    const sVelocity = (velocity: number): void => {
        selectedRef.current.forEach(s => {
            // let e = { ...activePatternObj.tracks[selectedTrack].events[s] };
            // let time = {
            //     '16n': s,
            //     '128n': e.offset,
            // };
            // e.velocity = velocity;
            // triggRef.current[activePattern][selectedTrack].at(time, e);
            dispatch(
                setVelocity(
                    activePattern,
                    selectedTrack,
                    s,
                    velocity
                )
            );
        });
    };

    const sPatternTrackVelocity = (velocity: number): void => {
        dispatch(
            setPatternTrackVelocity(
                activePattern,
                selectedTrack,
                velocity
            )
        );
    };

    const selStep = (index: number): void => {
        dispatch(
            selectStep(
                activePattern,
                selectedTrack,
                index
            )
        );
    };


    interface keyDict {
        [key: string]: number
    }

    const keyDict: keyDict = {
        a: 0,
        s: 1,
        d: 2,
        f: 3,
        g: 4,
        h: 5,
        j: 6,
        k: 7,
        l: 8,
        z: 9,
        x: 10,
        c: 11,
        v: 12,
        b: 13,
        n: 14,
        m: 15
    };

    function keydown(e: KeyboardEvent<Document>): void {
        let char: string = String.fromCharCode(e.keyCode).toLowerCase();
        // colocar o condicional pra ver se não tem foco em um input box
        if (Object.keys(keyDict).includes(char)) {
            if (e.repeat) { return }
            let n: number = keyDict[char]
            let index: number = (activePageRef.current + 1) * keyDict[char];
            if (index <= selLen) {
                dispatch(selectStep(activePattern, selectedTrack, index));
            }
        } else if (e.keyCode === 37 && selectedRef.current.length >= 1) {
            e.shiftKey ? sOffSet(-10) : sOffSet(-1);
        } else if (e.keyCode === 39 && selectedRef.current.length >= 1) {
            e.shiftKey ? sOffSet(10) : sOffSet(1);
        } else if (e.keyCode === 46 || e.keyCode === 8) {
            delEvents();
        }
    };

    function keyup(e: KeyboardEvent<Document>): void {
        let char = String.fromCharCode(e.keyCode).toLowerCase();
        // colocar o condicional pra ver se não tem foco em um input box
        if (Object.keys(keyDict).includes(char)) {
            if (e.repeat) { return }
            let index = (activePageRef.current + 1) * keyDict[char];
            if (index <= selLenRef.current) {
                selStep(index);
            }
        }
    };

    return (
        <div>
            <StepsEdit
                activePattern={activePattern}
                addPattern={adPattern}
                changePage={chgPage}
                changePatternLength={chgPatternLength}
                changePatternName={chgPatternName}
                changeTrackLength={chgTrackLength}
                events={events}
                page={activePage}
                patternAmount={patternAmount}
                patternLength={patternLength}
                patternNoteLength={patternNoteLength}
                patternTrackVelocity={patternTrackVelocity}
                removePattern={remPattern}
                selectPattern={selPattern}
                selected={selected}
                setNote={sNote}
                setNoteLength={sNoteLength}
                setPatternNoteLength={sPatternNoteLength}
                setVelocity={sVelocity}
                trackLength={trackLength}
            ></StepsEdit>
            <Steps
                activePattern={activePattern}
                events={events}
                length={trackLength}
                page={activePage}
                selected={selected}
                selectedTrack={selectedTrack}
            ></Steps>
        </div>
    )
}

export default Sequencer;