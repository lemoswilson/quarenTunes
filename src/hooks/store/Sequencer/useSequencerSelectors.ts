import { useSelector } from 'react-redux';
import { 
    selectedStepsSelector, 
    controllerKeysSelector, 
    activePattSelector, 
    eventsSelector, 
    activePattTrkLenSelector, 
    activePattTrkNoteLenSelector, 
    activePattLenSelector, 
    pattsObjSelector, 
    activeStepSelector,
    pattsVelocitiesSelector,
    trkPattsLenSelector,
    pattsTrkEventsSelector
} from '../../../store/Sequencer/selectors';
import { selectedDeviceSelector, selectedChannelSelector } from '../../../store/Track/selectors';
import usePrevious from '../../lifecycle/usePrevious';
import useQuickRef from '../../lifecycle/useQuickRef';


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

    const activePattLen = useSelector(activePattLenSelector(activePatt));
    const activePattTrkLen = useSelector(activePattTrkLenSelector(activePatt, selectedTrkIdx))
    const ref_activePattTrkLen = useQuickRef(activePattTrkLen)
    const activePattTrkNoteLen = useSelector(activePattTrkNoteLenSelector(activePatt, selectedTrkIdx))

    return {activePattLen, activePattTrkNoteLen, activePattTrkLen, ref_activePattTrkLen }
}

export const usePattsObjSelector = () => {
    const pattsObj = useSelector(pattsObjSelector);
    const ref_pattsObj = useQuickRef(pattsObj)

    return { pattsObj, ref_pattsObj }
}

export const useNoteCallbackData = (
    trackIndex: number,
    activePatt: number,
) => {
    const { ref_selectedSteps, selectedSteps} = useSelectedSteps(activePatt, trackIndex)
    // const ref_pattsNoteLen = useQuickRef(pattsNoteLen);
    const activeStep = useSelector(activeStepSelector);
    const ref_activeStep = useQuickRef(activeStep);
    const pattsVelocities = useSelector(pattsVelocitiesSelector(trackIndex));
    const ref_pattsVelocities = useQuickRef(pattsVelocities);
    const pattsTrkEvents = useSelector(pattsTrkEventsSelector(trackIndex));
    const trkPattsLen = useSelector(trkPattsLenSelector(trackIndex));

    return { 
        pattsTrkEvents,
        selectedSteps, 
        trkPattsLen,
        ref_selectedSteps,
        // ref_pattsNoteLen, 
        ref_activeStep, 
        ref_pattsVelocities,
    }

}