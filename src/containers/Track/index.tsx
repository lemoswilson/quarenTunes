import React, { FunctionComponent, useContext, useEffect, useRef } from 'react';
import { useSelector, useDispatch, batch } from 'react-redux'
import { addInstrumentToSequencer, removeInstrumentFromSequencer, addEffectSequencer, removeEffectSequencer } from '../../store/Sequencer';
import {
    addInstrument,
    changeEffectIndex,
    changeInstrument,
    deleteEffect,
    addEffect,
    removeInstrument,
    selectMidiChannel,
    selectMidiDevice,
    selectTrack,
    xolombrisxInstruments,
    effectTypes,
    changeEffect,
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
    const selectedTrkIdx = useSelector((state: RootState) => state.track.present.selectedTrack);
    // const ref_selectedTrackIdx = useRef(selectedTrkIdx);
    // useEffect(() => {
    //     ref_selectedTrackIdx.current = selectedTrkIdx;
    // }, [selectedTrkIdx])

    const Tracks = useSelector((state: RootState) => state.track.present.tracks);
    const counter = useSelector((state: RootState) => state.track.present.instrumentCounter)
    const selectedTrk_Id = useSelector((state: RootState) => state.track.present.tracks[selectedTrkIdx].id)

    const _changeInstrument = (instrument: xolombrisxInstruments): void => {
        dispatch(changeInstrument(selectedTrkIdx, instrument));
        // toneRefsEmitter.emit(trackEventTypes.CHANGE_INSTRUMENT, {instrument: })
    };

    const _addInstrument = (instrument: xolombrisxInstruments): void => {
        triggEmitter.emit(triggEventTypes.ADD_TRACK, {})
        batch(() => {
            dispatch(addInstrumentToSequencer(counter + 1));
            dispatch(addInstrument(instrument));
        })
    };

    const _removeInstrument = (trackIndex: number, trackId: number): void => {
        toneRefsEmitter.emit(trackEventTypes.REMOVE_INSTRUMENT, { trackIndex: trackIndex })
        triggEmitter.emit(triggEventTypes.REMOVE_TRACK, { trackIndex: trackIndex })
        batch(() => {
            dispatch(removeInstrument(trackIndex));
            dispatch(removeInstrumentFromSequencer(trackIndex));
        })
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

    const _addEffect = (effect: effectTypes, trackIndex: number, fxIndex: number): void => {
        // tone effect ref will be dealt in effect rendering
        
        triggEmitter.emit(triggEventTypes.ADD_EFFECT, {fxIndex: fxIndex, trackIndex: trackIndex})        // 
        batch(() => {
            dispatch(addEffect(fxIndex, trackIndex, effect));
            dispatch(addEffectSequencer(fxIndex, trackIndex))
            // dispatch(addEffect(fxIndex, ref_selectedTrackIdx.current, effect));
            // dispatch(addEffectSequencer(fxIndex, ref_selectedTrackIdx.current))
        })

    };

    const _changeEffect = (effect: effectTypes, fxIndex: number, trackIndex: number): void => {
        // toneObjects will be dealt in effect rendering
        console.log('should be changing effect');
        dispatch(changeEffect(fxIndex, trackIndex, effect));
    }

    const _changeEffectIdx = (from: number, to: number): void => {
        toneRefsEmitter.emit(trackEventTypes.CHANGE_EFFECT_INDEX, { from: from, to: to, trackIndex: selectedTrkIdx })
        dispatch(changeEffectIndex(from, to, selectedTrkIdx));
    };

    const _deleteEffect = (index: number, trackId: number): void => {
        toneRefsEmitter.emit(trackEventTypes.REMOVE_EFFECT, { effectsIndex: index, trackIndex: selectedTrkIdx })
        batch(() => {
            dispatch(deleteEffect(index, selectedTrkIdx));
            dispatch(removeEffectSequencer(index, selectedTrkIdx))
        })
    };

    return (
        // should abstract all this logic here in a component
        // that just returns html
        <div className={styles.trackWrapper}>
            <div className={styles.instrumentColumn}>
                <Tabs 
                Tracks={Tracks} 
                removeInstrument={_removeInstrument}
                changeInstrument={_changeInstrument}
                selectInstrument={_selectInstrument}
                addInstrument={_addInstrument}
                setMIDIInput={{
                    channel: _selectMIDIChannel,
                    device: _selectMIDIDevice,
                }}
                />
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
                    {/* <div className={styles.fx}> */}
                    {Tracks[selectedTrkIdx].fx.map((fx, idx, arr) => {
                        return (
                                <Effect
                                    addEffect={_addEffect}
                                    changeEffect={_changeEffect}
                                    deleteEffect={_deleteEffect}
                                    // deleteEffect={() => {}}
                                    key={`track:${selectedTrk_Id};effect:${fx.id}`}
                                    fxId={fx.id}
                                    trackIndex={selectedTrkIdx}
                                    fxIndex={idx}
                                    midi={Tracks[selectedTrkIdx].midi}
                                    options={fx.options}
                                    trackId={Tracks[selectedTrkIdx].id}
                                    type={fx.fx}
                                />
                        )
                    })}
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