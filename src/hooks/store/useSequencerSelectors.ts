import { useSelector } from 'react-redux';
import { selectedStepsSelector, controllerKeysSelector, activePattSelector, eventsSelector, pattsLenSelector, pattsNoteLenSelector, activePattTrkLenSelector, activePattTrkNoteLenSelector, activePattLenSelector } from '../../store/Sequencer/selectors';
import { selectedDeviceSelector, selectedChannelSelector } from '../../store/Track/selectors';
import usePrevious from '../usePrevious';
import useQuickRef from '../useQuickRef';


export const useSelectedSteps = (activePatt: number, selectedTrkIdx: number) => {
    const selectedSteps = useSelector(selectedStepsSelector(activePatt, selectedTrkIdx))
    const ref_selectedSteps = useQuickRef(selectedSteps)

    return {
        selectedSteps, ref_selectedSteps
    }
}

export const useControllerKeys = (selectedTrkIdx: number) => {
    const selectedDevice = useSelector(selectedDeviceSelector(selectedTrkIdx))
    const selectedChannel = useSelector(selectedChannelSelector(selectedTrkIdx))
    const controller_keys = useSelector(controllerKeysSelector(selectedChannel, selectedDevice));

    return controller_keys
}

export const useActivePatt = () => {
    const activePatt = useSelector(activePattSelector);
    const ref_activePatt = useQuickRef(activePatt);
    const prev_activePatt = usePrevious(activePatt)

    return { activePatt, ref_activePatt, prev_activePatt }
}

export const useEvents = (activePatt: number, selectedTrkIdx: number) => {
    const events = useSelector(eventsSelector(activePatt, selectedTrkIdx));
    const ref_events = useQuickRef(events);

    return { events, ref_events }
}

export const useLengthSelectors = (activePatt: number, selectedTrkIdx: number) => {
    // const patterns = useSelector((state: RootState) => state.sequencer.present.patterns);
    // const activePatternObj = useSelector((state: RootState) => state.sequencer.present.patterns[activePatt])

    const activePattLen = useSelector(activePattLenSelector(activePatt));
    const activePattTrkLen = useSelector(activePattTrkLenSelector(activePatt, selectedTrkIdx))
    const ref_activePattTrkLen = useQuickRef(activePattTrkLen)
    const activePattTrkNoteLen = useSelector(activePattTrkNoteLenSelector(activePatt, selectedTrkIdx))

    return {activePattLen, activePattTrkNoteLen, activePattTrkLen, ref_activePattTrkLen }
}