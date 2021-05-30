import { useDispatch, useSelector, batch } from 'react-redux';
import { addInstrumentToSequencer, removeInstrumentFromSequencer, addEffectSequencer, removeEffectSequencer } from '../../../store/Sequencer';
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
} from '../../../store/Track';
import { instrumentIdCounterSelector, selectedTrkIdSelector, selectedTrkIdxSelector, tracksSelector } from '../../../store/Track/selectors';
import trackEmitter, { trackEventTypes, toneRefsPayload } from '../../../lib/Emitters/trackEmitter';
import triggEmitter, { triggEventTypes } from '../../../lib/Emitters/triggEmitter';

const useTrackDispatchers = () => {

    const dispatch = useDispatch();
    const selectedTrkIdx = useSelector(selectedTrkIdxSelector);
    const Tracks = useSelector(tracksSelector);
    const counter = useSelector(instrumentIdCounterSelector)
    const selectedTrk_Id = useSelector(selectedTrkIdSelector(selectedTrkIdx))

    const _changeInstrument = (instrument: xolombrisxInstruments): void => {
        trackEmitter.emit(trackEventTypes.CHANGE_INSTRUMENT, {instrument: instrument, trackIndex: selectedTrkIdx})
        dispatch(changeInstrument(selectedTrkIdx, instrument));
    };

    const _addInstrument = (instrument: xolombrisxInstruments): void => {
        triggEmitter.emit(triggEventTypes.ADD_TRACK, {})
        trackEmitter.emit(trackEventTypes.ADD_INSTRUMENT, {instrument: instrument})
        batch(() => {
            dispatch(addInstrumentToSequencer(counter + 1));
            dispatch(addInstrument(instrument));
        })
    };

    const _removeInstrument = (trackIndex: number, trackId: number): void => {
        trackEmitter.emit(trackEventTypes.REMOVE_INSTRUMENT, { trackIndex: trackIndex })
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
        triggEmitter.emit(triggEventTypes.ADD_EFFECT, {fxIndex: fxIndex + 1, trackIndex: trackIndex})       
        trackEmitter.emit(trackEventTypes.ADD_EFFECT, {effect: effect, effectIndex: fxIndex, trackIndex: trackIndex})

        batch(() => {
            dispatch(addEffect(fxIndex, trackIndex, effect));
            dispatch(addEffectSequencer(fxIndex, trackIndex))
        })

    };

    const _changeEffect = (effect: effectTypes, fxIndex: number, trackIndex: number): void => {
        trackEmitter.emit(trackEventTypes.CHANGE_EFFECT, {effect: effect, effectsIndex: fxIndex, trackIndex: trackIndex});
        dispatch(changeEffect(fxIndex, trackIndex, effect));
    }


    const _deleteEffect = (index: number, trackIndex: number): void => {
        trackEmitter.emit(trackEventTypes.REMOVE_EFFECT, { effectsIndex: index, trackIndex: selectedTrkIdx })
        triggEmitter.emit(triggEventTypes.REMOVE_EFFECT, {fxIndex: index, trackIndex: trackIndex})
        batch(() => {
            dispatch(deleteEffect(index, selectedTrkIdx));
            dispatch(removeEffectSequencer(index, selectedTrkIdx))
        })
    };

    return { 
        trackDispatchers: {
            _addEffect, 
            _addInstrument, 
            _changeEffect, 
            _changeInstrument, 
            _deleteEffect, 
            _removeInstrument, 
            _selectInstrument, 
            _selectMIDIChannel,
            _selectMIDIDevice, 
        },
        Tracks, 
        selectedTrkIdx,
        selectedTrk_Id
    }

}

export default useTrackDispatchers;