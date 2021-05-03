import React, { FunctionComponent, useContext, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { addInstrumentToSequencer, removeInstrumentFromSequencer, addEffectSequencer, removeEffectSequencer } from '../../store/Sequencer';
import {
    addInstrument,
    changeEffectIndex,
    changeInstrument,
    deleteEffect,
    insertEffect,
    removeInstrument,
    selectMidiChannel,
    selectMidiDevice,
    selectTrack,
    xolombrisxInstruments,
    effectTypes
} from '../../store/Track';
import triggContext from '../../context/triggState';
// import ToneContext from '../../context/ToneContext';

import toneRefsEmitter, { trackEventTypes, toneRefsPayload } from '../../lib/toneRefsEmitter';
// import toneRefsEmitter, { trackEventTypes, toneRefsPayload } from '../../lib/myCustomToneRefsEmitter';
import triggEmitter, { triggEventTypes } from '../../lib/triggEmitter';

import { Instrument } from './Instruments'
import Effect from './Effects/Effect'
import { RootState } from '../Xolombrisx';
import WaveformSelector from '../../components/Layout/WaveformSelector';
import CurveSelector from '../../components/Layout/CurveSelector';
import ContinuousIndicator from '../../components/Layout/ContinuousIndicator';
import grayTriangle from '../../assets/grayTriangle.svg';
import Dropdown from '../../components/Layout/Dropdown';
import Playground from '../../components/Layout/Playground';
import SteppedIndicator from '../../components/Layout/SteppedIndicator';
import Tabs from '../../components/Layout/Instruments/Tabs';

import styles from './style.module.scss';

import { getInitials } from './defaults';


const Track: FunctionComponent = () => {

    const dispatch = useDispatch();
    const ref_ToneTriggCtx = useContext(triggContext);
    const pattKeys: number[] = useSelector((state: RootState) => Object.keys(state.sequencer.present.patterns).map(key => parseInt(key)));
    const trackCount: number = useSelector((state: RootState) => state.track.present.trackCount);
    const selectedTrkIdx = useSelector((state: RootState) => state.track.present.selectedTrack);
    const Tracks = useSelector((state: RootState) => state.track.present.tracks);
    const counter = useSelector((state: RootState) => state.track.present.instrumentCounter)

    const _changeInstrument = (instrument: xolombrisxInstruments): void => {
        dispatch(changeInstrument(selectedTrkIdx, instrument));
        // toneRefsEmitter.emit(trackEventTypes.CHANGE_INSTRUMENT, {instrument: })
    };

    const dispatchAddInstrument = (instrument: xolombrisxInstruments, trackIndex: number): void => {
        dispatch(addInstrumentToSequencer(counter + 1));
        dispatch(addInstrument(instrument, trackIndex));
        triggEmitter.emit(triggEventTypes.ADD_TRACK, { trackIndex: trackIndex })
    };

    const _removeInstrument = (trackId: number, trackIndex: number): void => {
        dispatch(removeInstrument(trackIndex));
        dispatch(removeInstrumentFromSequencer(trackIndex));
        triggEmitter.emit(triggEventTypes.REMOVE_TRACK, { trackIndex: trackIndex })
        toneRefsEmitter.emit(trackEventTypes.REMOVE_INSTRUMENT, { trackId: trackId })
    };

    const _selectInstrument = (trkIndex: number): void => {
        dispatch(selectTrack(trkIndex));
    };

    const _selectMIDIDevice = (index: number, device: string): void => {
        dispatch(selectMidiDevice(index, device));
    };

    const _selectMIDIChannel = (index: number, channel: number): void => {
        dispatch(selectMidiChannel(index, channel));
    };

    const dispatchInsertEffect = (effect: effectTypes, fxIndex: number, trackIndex: number): void => {
        dispatch(insertEffect(fxIndex, effect, trackIndex));
        // const selectedTrackIndex = Tracks.findIndex(track => track.id === selectedTrack)
        dispatch(addEffectSequencer(fxIndex, trackIndex))

    };

    const dispatchChangeEffectIdx = (from: number, to: number): void => {
        dispatch(changeEffectIndex(from, to, selectedTrkIdx));
        toneRefsEmitter.emit(trackEventTypes.CHANGE_EFFECT_INDEX, { from: from, to: to, trackId: selectedTrkIdx })
    };

    const dispatchDeleteEffect = (index: number, trackId: number): void => {
        dispatch(deleteEffect(index, selectedTrkIdx));
        toneRefsEmitter.emit(trackEventTypes.REMOVE_EFFECT, { effectsIndex: index, trackId: trackId })
    };

    return (
        <div className={styles.trackWrapper}>
            <div className={styles.instrumentColumn}>
                <Tabs 
                Tracks={Tracks} 
                className={styles.tabs}
                removeInstrument={_removeInstrument}
                changeInstrument={_changeInstrument}
                selectInstrument={_selectInstrument}
                setMIDIInput={{
                    channel: _selectMIDIChannel,
                    device: _selectMIDIDevice,
                }}
                />
                <div className={styles.tabs}></div>
                <div className={styles.box}>
                    {Tracks.map((trackInfo, idx, arr) => {
                        return <Instrument
                            key={`instrument ${trackInfo.id}`}
                            id={trackInfo.id}
                            index={idx}
                            midi={trackInfo.midi}
                            options={trackInfo.options}
                            selected={selectedTrkIdx === idx}
                            voice={trackInfo.instrument}
                        ></Instrument>
                    })}
                </div>
            </div>
            <div className={styles.effectsColumn}>
                <div className={styles.wrapper}>
                    <div className={styles.fx}>
                        {/* {Tracks[selectedTrkIdx].fx.map((fx, idx, arr) => {
                            return (
                                <React.Fragment key={`track:${selectedTrack};effect:${fx.id}`}>
                                    <div className={styles.box}>
                                        <Effect
                                            id={fx.id}
                                            trackIndex={selectedTrkIdx}
                                            index={idx}
                                            midi={Tracks[selectedTrkIdx].midi}
                                            options={fx.options}
                                            trackId={Tracks[selectedTrkIdx].id}
                                            type={fx.fx}
                                        />
                                    </div>
                                    <div className={styles.tabs}></div>
                                </React.Fragment>

                            )
                        })} */}
                        <div className={styles.box}>
                        </div>
                        <div className={styles.tabs}></div>
                    </div>
                    <div className={styles.fx}>
                        <div className={styles.box}></div>
                        <div className={styles.tabs}></div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Track;

{/* <div>
             { Tracks.map((track, tidx, arr) => {
                 return (
                    <React.Fragment key={`xablau${track}.${track.id}`}>
                        <Instrument
                            dummy={0}
                            id={track.id}
                            index={tidx}
                            midi={track.midi}
                            options={track.options}
                            voice={track.instrument}
                            key={`instrument${track.id}`}
                        ></Instrument>
                        { track.fx.map((fx, fidx, arr) => {
                            return (
                                <Effect
                                    index={fidx}
                                    midi={track.midi}
                                    options={fx.options}
                                    track={tidx}
                                    trackId={track.id}
                                    type={fx.fx}
                                    id={fx.id}
                                    key={`instrument${track.id}fx${fx.id}`}
                                ></Effect>
                            )
                        })}
                    </React.Fragment>
                    // <div>
                    // </div>
                )

            })}
        </div> */}