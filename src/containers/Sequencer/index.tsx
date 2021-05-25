import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import useSequencerDispatchers from '../../hooks/store/useSequencerDispatchers';
import useSequencerScheduler from '../../hooks/useSequencerScheduler';
import useSequencerShortcuts from '../../hooks/useSequencerShortcuts';
import  { useVoiceSelector, useTrkInfoSelector } from '../../hooks/store/useTrackSelector'
import { useActivePatt, useControllerKeys, useEvents, useLengthSelectors, useSelectedSteps } from '../../hooks/store/useSequencerSelectors';

import * as Tone from 'tone';

import StepSequencer from '../../components/Layout/StepSequencer';
import Patterns from '../../components/Layout/Patterns/Patterns';
import InputKeys from '../../components/Layout/InputKeys';
import styles from './style.module.scss';

import { xolombrisxInstruments } from '../../store/Track';

import ToneObjectsContext from '../../context/ToneObjectsContext';
import menuContext from '../../context/MenuContext';
import dropdownContext from '../../context/DropdownContext';

import { activeSongPattSelector, isFollowSelector, arrgModeSelector } from '../../store/Arranger/selectors';
import { activeStepSelector, patternsSelector } from '../../store/Sequencer/selectors';
import { effectsLengthsSelector } from '../../store/Track/selectors';
import { isPlaySelector } from '../../store/Transport/selectors';



const Sequencer: React.FC = () => {

    const [isNote, setIsNote] = useState(false)
    const MenuContext = useContext(menuContext);
    const DropdownContext = useContext(dropdownContext);
    const ref_toneObjects = useContext(ToneObjectsContext);
    
    const arrangerMode = useSelector(arrgModeSelector);
    const activeSongPattern = useSelector(activeSongPattSelector);
    const isFollow = useSelector(isFollowSelector);
    const isPlay = useSelector(isPlaySelector);
    const patterns = useSelector(patternsSelector);
    const activeStep = useSelector(activeStepSelector);
    
    const { 
        selectedTrkIdx, ref_selectedTrkIdx,
        activePage, ref_activePage,
        trkCount, ref_trkCount
    } 
    = useTrkInfoSelector()

    const { voice, ref_voice } = useVoiceSelector()
    const effectsLength = useSelector(effectsLengthsSelector);
    const controller_keys = useControllerKeys(selectedTrkIdx)
    const { activePatt, ref_activePatt, prev_activePatt } = useActivePatt()
    const { events, ref_events } = useEvents(activePatt, selectedTrkIdx);
    const { selectedSteps, ref_selectedSteps } = useSelectedSteps(activePatt, selectedTrkIdx)
    const pattTrkVelocity = patterns[activePatt].tracks[selectedTrkIdx].velocity;
    const activePattObj = patterns[activePatt];
    const { 
        activePattLen, 
        activePattTrkLen, 
        ref_activePattTrkLen, 
        activePattTrkNoteLen
    } 
    = useLengthSelectors(activePatt, selectedTrkIdx)
    
    const scheduleOrStop = useSequencerScheduler(
        ref_toneObjects,
        trkCount,
        ref_trkCount,
        ref_selectedTrkIdx,
        effectsLength,
        arrangerMode,
        patterns,
        activePatt,
        ref_activePatt,
        prev_activePatt,
        activePattLen,
        activePattTrkLen,
        isPlay
    )
    
    const sequencerDispatchers = useSequencerDispatchers(
        ref_toneObjects,
        patterns,
        activePatt,
        ref_activePatt,
        ref_selectedSteps,
        ref_activePage,
        arrangerMode,
        isFollow,
        selectedTrkIdx,
        ref_selectedTrkIdx,
        ref_trkCount,
        effectsLength,
        scheduleOrStop
    )
    
    useSequencerShortcuts(
        activePattTrkLen,
        ref_activePage, 
        ref_activePatt,
        ref_selectedTrkIdx,
        ref_activePattTrkLen, 
        ref_selectedSteps,
        ref_voice,
        ref_events,
        MenuContext,
        DropdownContext,
        sequencerDispatchers,
        setIsNote
    )



    function keyboardOnClick(noteName: string): void {
        if (Tone.context.state !== "running") {
            Tone.start()
            Tone.context.resume();
        }

        if (ref_selectedSteps.current.length > 0) {

            sequencerDispatchers._setNote(noteName);
        } else if (typeof activePattTrkNoteLen === 'string') {

            if (voice === xolombrisxInstruments.NOISESYNTH) {

                let t: any = ref_toneObjects.current?.tracks[selectedTrkIdx].instrument
                t.triggerAttackRelease(activePattTrkNoteLen)

            } else if (
                voice === xolombrisxInstruments.FMSYNTH 
                || voice === xolombrisxInstruments.AMSYNTH
            ) {

                ref_toneObjects.current?.tracks[selectedTrkIdx]
                .instrument?.triggerAttackRelease(
                    noteName, 
                    activePattTrkNoteLen, 
                    undefined, 
                    activePattObj.tracks[selectedTrkIdx].velocity/127
                )
            } else {

                ref_toneObjects.current?.tracks[selectedTrkIdx]
                .instrument?.triggerAttackRelease(
                    noteName, 
                    activePattTrkNoteLen, 
                    undefined, 
                    activePattObj.tracks[selectedTrkIdx].velocity/127
                )
            }
        }
    }

    


    return (
        <div className={styles.bottom}>
            <div className={styles.arrangerColumn}>
                <div className={styles.patterns}>
                    <Patterns
                        sequencerDispatchers={sequencerDispatchers}
                        isPlay={isPlay}
                        note={isNote}
                        activePattern={activePatt}
                        events={events}
                        patternLength={activePattLen}
                        patternTrackVelocity={pattTrkVelocity}
                        selected={selectedSteps}
                        patterns={patterns}
                        trackLength={activePattTrkLen}
                    ></Patterns>
                </div>
            </div>
            <div className={styles.sequencerColumn}>
                <div className={styles.box}>
                    <div className={styles.border}>
                        <div className={styles.stepSequencer}>
                            <StepSequencer
                                isPlay={isPlay}
                                selectStep={sequencerDispatchers._selectStep}
                                changePage={sequencerDispatchers.pageClickHandler}
                                activeSongPattern={activeSongPattern}
                                activePatt={activePatt}
                                events={events}
                                length={activePattTrkLen}
                                page={activePage}
                                selected={selectedSteps}
                                selectedTrkIdx={selectedTrkIdx}
                                activeStep={activeStep}
                                arrgMode={arrangerMode}
                            ></StepSequencer>
                        </div>
                        <div className={styles.keyInput}>
                            <InputKeys
                                setNoteLength={sequencerDispatchers._setNoteLength}
                                setPatternNoteLength={sequencerDispatchers._setPattNoteLen}
                                setNote={sequencerDispatchers._setNote}
                                patternNoteLength={activePattTrkNoteLen}
                                selected={selectedSteps}
                                events={events}
                                keyState={controller_keys}
                                noteCallback={keyboardOnClick}>
                            </InputKeys>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sequencer;