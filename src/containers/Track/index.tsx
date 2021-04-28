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
    showInstrument,
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

import styles from './style.module.scss';

import { getInitials } from './defaults';


const Track: FunctionComponent = () => {

    const dispatch = useDispatch();
    const triggRef = useContext(triggContext);
    const patternKeys: number[] = useSelector((state: RootState) => Object.keys(state.sequencer.present.patterns).map(key => parseInt(key)));
    const trackNumber: number = useSelector((state: RootState) => state.track.present.trackCount);
    const selectedTrack = useSelector((state: RootState) => state.track.present.selectedTrack);
    const selectedTrackIndex = useSelector((state: RootState) => state.track.present.tracks.findIndex(v => v.id === selectedTrack))
    const Tracks = useSelector((state: RootState) => state.track.present.tracks);
    const counter = useSelector((state: RootState) => state.track.present.instrumentCounter)

    const dispatchChangeInstrument = (instrument: xolombrisxInstruments): void => {
        dispatch(changeInstrument(selectedTrackIndex, instrument));
        // toneRefsEmitter.emit(trackEventTypes.CHANGE_INSTRUMENT, {instrument: })
    };

    const dispatchAddInstrument = (instrument: xolombrisxInstruments, index: number): void => {
        dispatch(addInstrumentToSequencer(counter + 1));
        dispatch(addInstrument(instrument, index));
        triggEmitter.emit(triggEventTypes.ADD_TRACK, { trackIndex: index })
    };

    const dispatchRemoveInstrument = (trackId: number, index: number): void => {
        dispatch(removeInstrument(index));
        dispatch(removeInstrumentFromSequencer(trackId));
        triggEmitter.emit(triggEventTypes.REMOVE_TRACK, { trackIndex: index })
        toneRefsEmitter.emit(trackEventTypes.REMOVE_INSTRUMENT, { trackId: trackId })
    };

    const dispatchShowInstrument = (index: number): void => {
        dispatch(showInstrument(index));
    };

    const dispatchSelectMIDIDevice = (index: number, device: string): void => {
        dispatch(selectMidiDevice(index, device));
    };

    const dispatchSelectMIDIChannel = (index: number, channel: number): void => {
        dispatch(selectMidiChannel(index, channel));
    };

    const dispatchInsertEffect = (effect: effectTypes, fxIndex: number, trackIndex: number): void => {
        dispatch(insertEffect(fxIndex, effect, trackIndex));
        // const selectedTrackIndex = Tracks.findIndex(track => track.id === selectedTrack)
        dispatch(addEffectSequencer(fxIndex, trackIndex))

    };

    const dispatchChangeEffectIdx = (from: number, to: number): void => {
        dispatch(changeEffectIndex(from, to, selectedTrackIndex));
        toneRefsEmitter.emit(trackEventTypes.CHANGE_EFFECT_INDEX, { from: from, to: to, trackId: selectedTrack })
    };

    const dispatchDeleteEffect = (index: number, trackId: number): void => {
        dispatch(deleteEffect(index, selectedTrack));
        toneRefsEmitter.emit(trackEventTypes.REMOVE_EFFECT, { effectsIndex: index, trackId: trackId })
    };

    return (
        <div className={styles.trackWrapper}>
            <div className={styles.instrumentColumn}>
                <div className={styles.tabs}></div>
                <div className={styles.box}>
                    {Tracks.map((trackInfo, idx, arr) => {
                        return <Instrument
                            key={`instrument ${trackInfo.id}`}
                            id={trackInfo.id}
                            index={idx}
                            midi={trackInfo.midi}
                            options={trackInfo.options}
                            selected={selectedTrack === trackInfo.id}
                            voice={trackInfo.instrument}
                        ></Instrument>
                    })}
                    {/* <CurveSelector display={'horizontal'} selected={'exponential'} selectCurve={() => { }}></CurveSelector> */}
                    {/* <WaveformSelector selectWaveform={() => { }} selected={'sine'}></WaveformSelector> */}
                    {/* <img src={grayTriangle} alt="" /> */}
                    {/* <Playground></Playground>
                    <ContinuousIndicator
                        ccMouseCalculationCallback={() => { }}
                        curveFunction={() => 10}
                        label={'Attack'}
                        max={100}
                        min={0}
                        midiLearn={() => { }}
                        value={100}
                        valueUpdateCallback={() => { }}
                        type={'knob'}
                        unit={'unit'}
                    ></ContinuousIndicator>
                    <ContinuousIndicator
                        ccMouseCalculationCallback={() => { }}
                        curveFunction={() => 10}
                        label={'Attack'}
                        max={100}
                        min={0}
                        midiLearn={() => { }}
                        value={37}
                        valueUpdateCallback={() => { }}
                        type={'slider'}
                        unit={'unit'}
                    ></ContinuousIndicator> */}
                    {/* <SteppedIndicator
                        options={['alameda', 'xola', 'jirafa']}
                        ccMouseCalculationCallback={() => { }}
                        label={'Attack'}
                        midiLearn={() => { }}
                        selected={'xola'}
                        valueUpdateCallback={() => { }}
                        unit={'unit'}
                    ></SteppedIndicator> */}
                </div>
            </div>
            <div className={styles.effectsColumn}>
                <div className={styles.wrapper}>
                    <div className={styles.fx}>
                        {/* {Tracks[selectedTrack].fx.map((fx, idx, arr) => {
                            return (
                                <React.Fragment key={`track:${selectedTrack};effect:${fx.id}`}>
                                    <div className={styles.box}>
                                        <Effect
                                            id={fx.id}
                                            trackIndex={selectedTrackIndex}
                                            index={idx}
                                            midi={Tracks[selectedTrack].midi}
                                            options={fx.options}
                                            trackId={selectedTrack}
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