import React, { useRef, useMemo, useContext, MutableRefObject, useState, useEffect } from 'react';
import { useEffectProperties } from '../../../hooks/store/Track/useProperty';

import { useSelector } from 'react-redux';
import { event } from '../../../store/Sequencer'

import ToneObjectsContext from '../../../context/ToneObjectsContext';

import { propertiesToArray } from '../../../lib/objectDecompose';
import { useMidiLearn } from '../../../hooks/midiCC/useMidiLearn';

import { effectsProps } from './types';
import { getEffectsInitials } from '../defaults';

import styles from './style.module.scss';
import DevicePresetManager from '../../../components/UI/DevicePresetManager';
import { useEffectDispathchers } from '../../../hooks/store/Track/useEffectDispatchers';

import { returnEffect } from '../../../lib/Tone/initializers';

import Tabs from '../../../components/Layout/Effects/Tabs';
import EffectLoader, { EffectsLayoutProps } from './EffectLoader';
import useQuickRef from '../../../hooks/lifecycle/useQuickRef';
import { useActivePatt, useSelectedSteps } from '../../../hooks/store/Sequencer/useSequencerSelectors';
import { fxCountSelector } from '../../../store/Track/selectors';
import { pattsTrkEventsSelector } from '../../../store/Sequencer/selectors';
import { useFx } from '../../../hooks/instrument/useFx';
import { useUpdateFx } from '../../../hooks/instrument/useUpdateFx';
import { useDeviceLoader } from '../../../hooks/fetch/useFetch';

export interface effectLayoutProps extends EffectsLayoutProps {
    options: any,
    calcCallbacks: any,
    removePropertyLock: any,
    ccMaps: any,
    midiLearn: (property: string) => void,
    propertyUpdateCallbacks: any,
    trackIndex: number,
    trackId: number,
    fxId: number,
    fxIndex: number,
    selected?: number[],
    events: event[],
    properties: any[];
}

const Effect: React.FC<effectsProps> = ({ 
    fxId, 
    fxIndex, 
    midi, 
    options, 
    type, 
    trackId, 
    trackIndex, 
    deleteEffect,
    changeEffect, 
    addEffect 
}) => {
    const [ firstRender, setRender ] = useState(true);
    const ref_firstRender = useRef(true);
    const ref_toneObjects = useContext(ToneObjectsContext);
    const ref_ToneEffect: MutableRefObject<ReturnType<typeof returnEffect> | null> = useRef(null)

    const fxProps = useMemo(() => propertiesToArray(getEffectsInitials(type)), [type]);
    const ref_trackIndex = useQuickRef(trackIndex);
    const ref_fxIndex = useQuickRef(fxIndex);
    const ref_options = useQuickRef(options);
    const { activePatt, ref_activePatt } = useActivePatt()
    const { ref_selectedSteps, selectedSteps } = useSelectedSteps(activePatt, trackIndex);

    const fxCount = useSelector(fxCountSelector(trackIndex));
    const pattsTrkEvents = useSelector(pattsTrkEventsSelector(trackIndex));

    useEffect(() => {
        console.log('[Effect]: first render, value is ', firstRender);
        if (firstRender){
            ref_ToneEffect.current = returnEffect(type, options)
        }
    }, [firstRender])

    const { propertiesIncDec, propertiesUpdate,removeEffectPropertyLockCallbacks} = useEffectDispathchers(
        fxProps,
        type,
        fxIndex, 
        ref_trackIndex,
        ref_fxIndex,
        ref_options,
        ref_activePatt,
        ref_selectedSteps,
    )

    useFx(
        fxProps, 
        trackIndex,
        fxIndex,
        ref_options,
        ref_toneObjects, 
        ref_trackIndex,
        ref_fxIndex,
        propertiesUpdate,
    )

    // useUpdateFx(
    //     trackIndex,
    //     fxIndex,
    //     fxId,
    //     type,
    //     options,
    //     ref_ToneEffect,
    //     ref_options,
    //     ref_toneObjects,
    //     firstRender,
    //     ref_firstRender,
    //     setRender,
    //     effectCallback,
    // )

    useEffectProperties(ref_ToneEffect, options)

    const { midiLearn, ref_CCMaps } = useMidiLearn(propertiesIncDec)

    const {fetchDevice, removeDevice, saveDevice, save, newDevice, fetchList, onChange, textValue, name, presets} = useDeviceLoader(options, trackIndex, type, 'effect', fxIndex )
    const toConcat = name === 'newEffect' ? ['newEffect', 'newEffect'] : []

    const Component = <EffectLoader 
                removePropertyLock={removeEffectPropertyLockCallbacks}
                calcCallbacks={propertiesIncDec}
                midiLearn={midiLearn}
                ccMaps={ref_CCMaps}
                events={pattsTrkEvents[activePatt]}
                trackId={trackId}
                fxId={fxId}
                fxIndex={fxIndex}
                options={options}
                properties={fxProps}
                propertyUpdateCallbacks={propertiesUpdate}
                selected={selectedSteps}
                trackIndex={trackIndex}
                voice={type}
                />

    return (
        <div className={styles.fx}>
            <div className={styles.box}>
                <div className={styles.border}>
                    <div className={styles.deviceManager}>
                        <DevicePresetManager
                            deviceId={`track:${trackId}:fx${fxId}:deviceSelector`}
                            keyValue={[['init', 'init']].concat(presets).concat(toConcat)}
                            onSubmit={saveDevice}
                            textValue={textValue}
                            onChange={onChange}
                            remove={removeDevice}
                            save={save}
                            select={fetchDevice}
                            selected={name}
                            trackIndex={trackIndex}
                            fxIndex={fxIndex}
                            newDevice={newDevice}
                            fetchList={fetchList}
                        />
                    </div>
                    { Component }
                </div>
            </div>
            <Tabs 
                fxIndex={fxIndex}
                trackIndex={trackIndex}
                type={type} 
                fxCount={fxCount}
                removeEffect={deleteEffect}
                insertEffect={addEffect}
                selectEffect={changeEffect}
            />
        </div>
    )
};

export default Effect;
