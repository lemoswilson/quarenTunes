import React, {
    useEffect,
    useRef,
    useMemo,
    useState,
    useContext,
    MutableRefObject,
} from 'react';
import { useProperties, useDrumRackProperties } from '../../../hooks/store/Track/useProperty';

import { xolombrisxInstruments } from '../../../store/Track';
import { propertiesToArray } from '../../../lib/objectDecompose'
import { returnInstrument } from '../../../lib/Tone/initializers';

import ToneObjectsContext from '../../../context/ToneObjectsContext';
import { InstrumentProps } from './index'

import { getInitials } from '../defaults';

import styles from './style.module.scss';

import DevicePresetManager from '../../../components/UI/DevicePresetManager';

import InstrumentLoader from './InstrumentLoader';
import useQuickRef from '../../../hooks/lifecycle/useQuickRef';
import usePrevAndRef from '../../../hooks/lifecycle/usePrevAndRef';

import { useTrkInfoSelector } from '../../../hooks/store/Track/useTrackSelector';
import { useNoteCallbackData } from '../../../hooks/store/Sequencer/useSequencerSelectors';
import { useInstrumentDispatchers } from '../../../hooks/store/Track/useInstrumentDispatchers';
import { useMidiLearn } from '../../../hooks/midiCC/useMidiLearn';
import { useUpdateInstrument } from '../../../hooks/instrument/useUpdateInstrument';
import { useInstrument } from '../../../hooks/instrument/useInstrument';


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
    const [firstRender, setRender] = useState(true);
    const ref_toneObjects = useContext(ToneObjectsContext);
    const { prev: prev_voice, ref: ref_voice} = usePrevAndRef(voice);
    const instProps: string[] = useMemo(() => propertiesToArray(getInitials(voice)) , [voice]);
    
    useEffect(() => {
        if (firstRender) {
            ref_ToneInstrument.current = returnInstrument(voice, options);
        }
    }, [])
    useProperties(ref_ToneInstrument, options);
    useDrumRackProperties(ref_ToneInstrument, options)
    
    const { 
        activePatt, 
        ref_activePatt, 
        ref_selectedTrkIdx, 
    } 
    = useTrkInfoSelector()

    const { 
        pattsTrkEvents, 
        selectedSteps,
        trkPattsLen,
        ref_activeStep, 
        ref_pattsVelocities,
        ref_selectedSteps,
    } 
    = useNoteCallbackData(index, activePatt);
    
    const { propertiesIncDec, propertiesUpdate, removePropertyLockCallbacks } = useInstrumentDispatchers(
        instProps,
        ref_options,
        ref_selectedSteps,
        ref_index,
        ref_activePatt,
        voice
    )

    const { instrumentCallback, arrgMode, setCallbacks } = useInstrument(
        ref_selectedSteps,
        ref_index, 
        index,
        ref_toneObjects,
        ref_activePatt,
        ref_pattsVelocities,
        ref_ToneInstrument,
        ref_activeStep,
        ref_voice,
        voice,
        midi, 
        ref_selectedTrkIdx,
        ref_options, 
        propertiesUpdate, 
    )

    const { midiLearn, ref_CCMaps } = useMidiLearn(propertiesIncDec)

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

    const logg = () => {
        // console.log(ref_toneObjects.current?.arranger[1][0].instrument.state);
    }

    return (
        <div
            // onClick={setCallbacks}
            onClick={logg}
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
