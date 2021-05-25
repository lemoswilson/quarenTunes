import React, {
    useEffect,
    useRef,
    useMemo,
    useState,
    useContext,
    MutableRefObject,
} from 'react';
import { useProperties, useDrumRackProperties } from '../../../hooks/store/useProperty';

import { xolombrisxInstruments } from '../../../store/Track';
import { propertiesToArray } from '../../../lib/objectDecompose'
import { returnInstrument } from '../../../lib/Tone/initializers';

import ToneObjectsContext from '../../../context/ToneObjectsContext';
import { InstrumentProps } from './index'

import { useSelector } from 'react-redux';
import { getInitials } from '../defaults';

import styles from './style.module.scss';

import DevicePresetManager from '../../../components/UI/DevicePresetManager';

import Chain from '../../../lib/Tone/fxChain';
import InstrumentLoader from './InstrumentLoader';
import useQuickRef from '../../../hooks/useQuickRef';
import usePrevAndRef from '../../../hooks/usePrevAndRef';

import { useTrkInfoSelector } from '../../../hooks/store/useTrackSelector';
import { useSourceArrgSelector } from '../../../hooks/store/useArrangerSelectors';
import { currentSongEventsSelector } from '../../../store/Arranger/selectors';
import { useNoteCallbackData } from '../../../hooks/store/useSequencerSelectors';
import { useIsRecSelector } from '../../../hooks/store/useTransportSelectors';
import { useInstrumentDispatchers } from '../../../hooks/store/useTrackDispatchers';
import { useInstrumentCallback } from '../../../hooks/useInstrumentCallback';
import { useNoteInput } from '../../../hooks/noteInput/useNoteInput';
import { useMidiNote } from '../../../hooks/noteInput/useMidiNote';
import { useKeyboardNote } from '../../../hooks/noteInput/useKeyboardNote';
import { useMidiLearn } from '../../../hooks/useMidiLearn';
import { useUpdateInstrument } from '../../../hooks/useUpdateInstrument';


export const Instrument = <T extends xolombrisxInstruments>({ 
    id, 
    index, 
    midi, 
    voice, 
    maxPolyphony, 
    options, 
    selected 
}: InstrumentProps<T>) => {

    const ref_options = useQuickRef(options)
    const ref_index = useQuickRef(index);
    const ref_ToneInstrument: MutableRefObject<ReturnType<typeof returnInstrument> | null> = useRef(null);

    useEffect(() => {
        if (firstRender) {
            ref_ToneInstrument.current = returnInstrument(voice, options);
        }
    }, [])
    
    const instProps: string[] = useMemo(() => {
        return propertiesToArray(getInitials(voice))
    }, [voice]);

    const [firstRender, setRender] = useState(true);
    
    const ref_toneObjects = useContext(ToneObjectsContext);
    const ref_CCMaps = useRef<any>({});

    
    const { prev: prev_voice, ref: ref_voice} = usePrevAndRef(voice);
    const { ref_pattTracker, ref_arrgMode, arrgMode, currentSong } = useSourceArrgSelector()
    const songEvents = useSelector(currentSongEventsSelector(currentSong))
    const ref_songEvents = useQuickRef(songEvents);

    const { 
        activePatt, 
        ref_activePatt, 
        ref_selectedTrkIdx, 
    } = useTrkInfoSelector()

    const { 
        pattsTrkEvents, 
        selectedSteps,
        trkPattsLen,
        ref_activeStep, 
        ref_pattsVelocities,
        ref_selectedSteps,
    } = useNoteCallbackData(index, activePatt);
    
    const { ref_isRec } = useIsRecSelector()
    
    const { propertiesIncDec, propertiesUpdate, removePropertyLockCallbacks} = useInstrumentDispatchers(
        instProps,
        ref_options,
        ref_selectedSteps,
        ref_index,
        ref_activePatt,
        voice
    )

    useProperties(ref_ToneInstrument, options);
    useDrumRackProperties(ref_ToneInstrument, options)

    const { instrumentCallback, ref_isPlay } 
    = useInstrumentCallback(
        ref_toneObjects,
        index, 
        ref_index,
        ref_options,
        ref_arrgMode,
        ref_pattsVelocities,
        ref_activePatt,
        ref_pattTracker,
        ref_songEvents,
        ref_ToneInstrument,
        voice,
        propertiesUpdate,
    )

    const { noteInCallback, noteOffCallback } = useNoteInput(
        ref_selectedSteps,
        ref_index, 
        index,
        ref_toneObjects,
        ref_arrgMode,
        ref_activePatt,
        ref_pattTracker,
        ref_pattsVelocities,
        ref_songEvents,
        ref_isRec,
        ref_isPlay,
        ref_ToneInstrument,
        ref_activeStep,
        ref_voice,
        voice,
    )

    const midiLearn = useMidiLearn(propertiesIncDec)
    useMidiNote(midi, noteInCallback, noteOffCallback)
    useKeyboardNote(ref_index, ref_selectedTrkIdx, midi, noteInCallback, noteOffCallback)

    useUpdateInstrument(
        ref_toneObjects,
        ref_ToneInstrument,
        ref_options,
        index, 
        prev_voice,
        voice,
        activePatt,
        arrgMode,
        trkPattsLen,
        firstRender, 
        instrumentCallback,
        setRender,
    )

    const Component = <InstrumentLoader 
                        removePropertyLock={removePropertyLockCallbacks}
                        voice={voice}
                        midiLearn={midiLearn}
                        ccMaps={ref_CCMaps}
                        calcCallbacks={propertiesIncDec}
                        events={pattsTrkEvents[activePatt]}
                        trackIndex={index}
                        trackId={id}
                        options={options}
                        properties={instProps}
                        propertyUpdateCallbacks={propertiesUpdate}
                        selected={selectedSteps}
                    />

    return (
        <div
            className={styles.border}
            style={{ display: !selected ? 'none' : 'flex' }}>
            <div className={styles.deviceManager}>
                <DevicePresetManager
                    deviceId={''}
                    keyValue={[]}
                    onSubmit={() => { }}
                    remove={() => { }}
                    save={() => { }}
                    select={() => { }}
                    selected={''}
                ></DevicePresetManager>
            </div>
            { Component}
        </div>
    )
}
