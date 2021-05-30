import {  MutableRefObject } from 'react';
import { xolombrisxInstruments, midi } from '../../store/Track';
import { ToneObjectContextType } from '../../context/ToneObjectsContext';
import { returnInstrument } from '../../lib/Tone/initializers';
import { useNoteInput } from './noteInput/useNoteInput';
import { useInstrumentPlayback } from './useInstrumentPlayback';
import { useSelector } from 'react-redux';
import useQuickRef from '../lifecycle/useQuickRef';
import { useIsRecSelector } from '../store/Transport/useTransportSelectors';
import { trkCountSelector } from '../../store/Track/selectors';

export function useInstrument(
    ref_selectedSteps: MutableRefObject<number[]>,
    ref_index: MutableRefObject<number>, 
    index: number,
    ref_toneObjects: ToneObjectContextType,
    ref_activePatt: MutableRefObject<number>,
    ref_pattsVelocities: MutableRefObject<{[key: number]: number}>,
    // ref_ToneInstrument: MutableRefObject<ReturnType<typeof returnInstrument> | null>,
    ref_activeStep: MutableRefObject<number>,
    ref_voice: MutableRefObject<xolombrisxInstruments>,
    voice: xolombrisxInstruments,
    midi: midi, 
    ref_selectedTrkIdx: MutableRefObject<number>,
    ref_options: MutableRefObject<any>, 
    propertiesUpdate: any, 

) {
    // const { ref_pattTracker, ref_arrgMode, arrgMode, currentSong } = useSourceArrgSelector()
    // const songEvents = useSelector(currentSongEventsSelector(currentSong))
    // const ref_songEvents = useQuickRef(songEvents);
    const { ref_isRec } = useIsRecSelector()
    const trkCount = useSelector(trkCountSelector);




    const  { instrumentCallback, ref_isPlay, setCallbacks} = useInstrumentPlayback(
        ref_toneObjects,
        index, 
        ref_index,
        ref_options, // not in useNoteInput
        // ref_arrgMode,
        ref_pattsVelocities,
        ref_activePatt,
        // ref_pattTracker,
        // ref_songEvents,
        // ref_ToneInstrument,
        voice,
        trkCount,
        propertiesUpdate, // not in useNoteINput
    )

    useNoteInput(
        ref_selectedSteps,
        ref_index, 
        index,
        ref_toneObjects,
        // ref_arrgMode,
        ref_activePatt,
        // ref_pattTracker,
        ref_pattsVelocities,
        // ref_songEvents,
        ref_isRec,
        ref_isPlay,
        // ref_ToneInstrument,
        ref_activeStep,
        ref_voice,
        voice,
        midi,
        ref_selectedTrkIdx,
    )

    return { instrumentCallback, setCallbacks };

}