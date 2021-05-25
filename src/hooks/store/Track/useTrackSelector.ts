import { useSelector } from 'react-redux';
import usePrevious from '../../lifecycle/usePrevious';
import { effectsLengthsSelector, selectedTrkIdxSelector, selectedTrkVoiceSelector, trkCountSelector } from '../../../store/Track/selectors';
import { activePageSelector, activePattSelector } from '../../../store/Sequencer/selectors';
import useQuickRef from '../../lifecycle/useQuickRef';

export const useTrkInfoSelector = () => {
    const selectedTrkIdx = useSelector(selectedTrkIdxSelector);
    const ref_selectedTrkIdx = useQuickRef(selectedTrkIdx);

    const trkCount = useSelector(trkCountSelector);
    const ref_trkCount = useQuickRef(trkCount);
    
    const activePatt = useSelector(activePattSelector);
    const ref_activePatt = useQuickRef(activePatt);

    const activePage = useSelector(activePageSelector(activePatt, selectedTrkIdx));
    const ref_activePage = useQuickRef(activePage);


    return {
        selectedTrkIdx,
        ref_selectedTrkIdx,
        activePatt,
        ref_activePatt,
        activePage,
        ref_activePage,
        trkCount,
        ref_trkCount
    }

}

export const useVoiceSelector = () => {
    const selectedTrkIdx = useSelector(selectedTrkIdxSelector)
    const voice = useSelector(selectedTrkVoiceSelector(selectedTrkIdx))
    const ref_voice = useQuickRef(voice);
    const prev_voice = usePrevious(voice);

    return { voice, ref_voice, prev_voice }
};

export const useEffectsLengthSelector = () => {
    const effectsLengths = useSelector(effectsLengthsSelector)
    const ref_effectsLengths = useQuickRef(effectsLengths);

    return { effectsLengths, ref_effectsLengths }
}