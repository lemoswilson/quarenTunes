import React, { useRef, useMemo, useContext, MutableRefObject } from 'react';
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

    const effectCallback = useFx(
        fxProps, 
        trackId,
        fxIndex,
        ref_options,
        ref_toneObjects, 
        ref_trackIndex,
        ref_fxIndex,
        propertiesUpdate,
    )

    useUpdateFx(
        trackIndex,
        fxIndex,
        fxId,
        type,
        options,
        ref_ToneEffect,
        ref_options,
        ref_toneObjects,
        effectCallback,
    )

    useEffectProperties(ref_ToneEffect, options)

    const { midiLearn, ref_CCMaps } = useMidiLearn(propertiesIncDec)

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
        <div onClick={() => console.log(ref_selectedSteps.current)} className={styles.fx}>
            <div className={styles.box}>
                <div className={styles.border}>
                    <div className={styles.deviceManager}>
                        <DevicePresetManager
                            deviceId={''}
                            keyValue={[]}
                            onSubmit={() => { }}
                            remove={() => { }}
                            save={() => { }}
                            select={() => { }}
                            selected={''}
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
