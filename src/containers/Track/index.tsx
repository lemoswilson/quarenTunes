import React, { FunctionComponent, useContext, useEffect, useRef } from 'react';
import triggContext from '../../context/triggState';
import { addInstrumentToSequencer, removeInstrumentFromSequencer } from '../../store/Sequencer';
import toneRefsEmitter, { trackEventTypes, toneRefsPayload } from '../../lib/toneRefsEmitter';
import { range } from '../../lib/utility';
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
    instrumentTypes,
    effectTypes
} from '../../store/Track';
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../App';
import triggEmitter, { triggEventTypes } from '../../lib/triggEmitter';

const Track: FunctionComponent = () => {

    const dispatch = useDispatch();

    const triggRef = useContext(triggContext);

    const patternKeys: number[] = useSelector(
        (state: RootState) => Object.keys(state.sequencer.patterns).map(key => parseInt(key))
    );

    const trackNumber: number = useSelector(
        (state: RootState) => state.track.trackCount
    );

    const selectedTrack = useSelector(
        (state: RootState) => state.track.selectedTrack
    );

    const chgInstrument = (instrument: instrumentTypes, index: number): void => {
        dispatch(changeInstrument(index, instrument));
    };


    const addInstr = (instrument: instrumentTypes): void => {
        dispatch(addInstrumentToSequencer());
        dispatch(addInstrument(instrument));
        // triggEmitter.emit(triggEventTypes.ADD_TRACK, {})
    };

    const remInstr = (index: number): void => {
        if (triggRef) {
            patternKeys.forEach(key => triggRef.current[key][index].stop());
        }
        dispatch(removeInstrument(index));
        dispatch(removeInstrumentFromSequencer(index));
        triggEmitter.emit(triggEventTypes.REMOVE_TRACK, { track: index })
        toneRefsEmitter.emit(trackEventTypes.REMOVE_INSTRUMENT, { trackId: index })
    };

    const showInstr = (index: number): void => {
        dispatch(showInstrument(index));
    };

    const selMIDIDevice = (index: number, device: string): void => {
        dispatch(selectMidiDevice(index, device));
    };

    const selMIDIChannel = (index: number, channel: number): void => {
        dispatch(selectMidiChannel(index, channel));
    };

    const insEffect = (effect: effectTypes, chainIndex: number): void => {
        dispatch(insertEffect(chainIndex, effect, selectedTrack));
    };

    const chgEffectIndex = (from: number, to: number): void => {
        dispatch(changeEffectIndex(from, to, selectedTrack));
        toneRefsEmitter.emit(trackEventTypes.CHANGE_EFFECT_INDEX, { from: from, to: to, trackId: selectedTrack })
    };

    const delEffect = (index: number, trackId: number): void => {
        dispatch(deleteEffect(index, selectedTrack));
        toneRefsEmitter.emit(trackEventTypes.REMOVE_EFFECT, { effectsIndex: index, trackId: trackId })
    };

    return (
        <div></div>
    )
};

export default Track;