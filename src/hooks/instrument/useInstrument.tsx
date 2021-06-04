import {  MutableRefObject } from 'react';
import { xolombrisxInstruments, midi } from '../../store/Track';
import { ToneObjectContextType } from '../../context/ToneObjectsContext';
import { useNoteInput } from './noteInput/useNoteInput';
import { useInstrumentPlayback } from './useInstrumentPlayback';
import { useSelector } from 'react-redux';
import { useIsRecSelector } from '../store/Transport/useTransportSelectors';
import { trkCountSelector } from '../../store/Track/selectors';

export function useInstrument(
    ref_selectedSteps: MutableRefObject<number[]>,
    ref_index: MutableRefObject<number>, 
    index: number,
    ref_toneObjects: ToneObjectContextType,
    ref_activePatt: MutableRefObject<number>,
    ref_pattsVelocities: MutableRefObject<{[key: number]: number}>,
    ref_activeStep: MutableRefObject<number>,
    ref_voice: MutableRefObject<xolombrisxInstruments>,
    voice: xolombrisxInstruments,
    midi: midi, 
    ref_selectedTrkIdx: MutableRefObject<number>,
    ref_options: MutableRefObject<any>, 
    propertiesUpdate: any, 

) {
    const { ref_isRec } = useIsRecSelector()
    const trkCount = useSelector(trkCountSelector);

    const  { ref_isPlay } = useInstrumentPlayback(
        ref_toneObjects,
        index, 
        ref_index,
        ref_options, 
        ref_pattsVelocities,
        ref_activePatt,
        voice,
        trkCount,
        propertiesUpdate, 
    )

    useNoteInput(
        ref_selectedSteps,
        ref_index, 
        index,
        ref_toneObjects,
        ref_activePatt,
        ref_pattsVelocities,
        ref_isRec,
        ref_isPlay,
        ref_activeStep,
        ref_voice,
        voice,
        midi,
        ref_selectedTrkIdx,
    )

}