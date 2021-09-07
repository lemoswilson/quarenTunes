import React, {
    useMemo,
    useContext,
} from 'react';
import { useProperties, useDrumRackProperties, useSampleSelector } from '../../../hooks/store/Track/useProperty';

import { xolombrisxInstruments } from '../../../store/Track';
import { propertiesToArray } from '../../../lib/objectDecompose'

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
import { useInstrument } from '../../../hooks/instrument/useInstrument';
import { useDeviceLoader } from '../../../hooks/fetch/useFetch';
import { useSelector } from 'react-redux';
import { trackSelector } from '../../../store/Track/selectors';
import { sequencerSelector } from '../../../store/Sequencer/selectors';


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
    const ref_toneObjects = useContext(ToneObjectsContext);
    const {ref: ref_voice} = usePrevAndRef(voice);
    const instProps: string[] = useMemo(() => propertiesToArray(getInitials(voice)) , [voice]);

    useProperties(ref_toneObjects.current?.tracks[index].instrument, options);
    useDrumRackProperties(ref_toneObjects.current?.tracks[index].instrument, options, voice)
    useSampleSelector(ref_toneObjects.current?.tracks[index].instrument, options, voice)
    
    const { 
        activePatt, 
        ref_activePatt, 
        ref_selectedTrkIdx, 
    } 
    = useTrkInfoSelector()

    const { 
        pattsTrkEvents, 
        selectedSteps,
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

    useInstrument(
        ref_selectedSteps,
        ref_index, 
        index,
        ref_toneObjects,
        ref_activePatt,
        ref_pattsVelocities,
        ref_activeStep,
        ref_voice,
        voice,
        midi, 
        ref_selectedTrkIdx,
        ref_options, 
        propertiesUpdate, 
    )

    const { midiLearn, ref_CCMaps } = useMidiLearn(propertiesIncDec)

    const {presets, fetchDevice, removeDevice, saveDevice, save, newDevice, fetchList, onChange, textValue, name } = useDeviceLoader(options, index, voice, 'instrument')
    const toConcat = name === 'newInstrument' ? ['newInstrument', 'newInstrument'] : []

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
                    deviceId={`track:${id}:deviceSelector`}
                    keyValue={[['init', 'init']].concat(presets).concat(toConcat)}
                    onChange={onChange}
                    textValue={textValue}
                    onSubmit={saveDevice}
                    remove={removeDevice}
                    save={save}
                    select={fetchDevice}
                    selected={name}
                    trackIndex={index}
                    newDevice={newDevice}
                    fetchList={fetchList}
                ></DevicePresetManager>
            </div>
            { Component}
        </div>
    )
}
