import React, { ChangeEvent, MutableRefObject, useRef } from 'react';
import styles from './style.module.scss';
import Dropdrown from '../Dropdown'
import TrashCan from '../TrashCan';
import Plus from '../Plus';
import DropdownEmitter, { dropdownEventTypes } from '../../../lib/Emitters/dropdownEmitter'

interface DevicePresetManager {
    save: (input: HTMLInputElement) => void,
    select: (key: string) => void,
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    newDevice: () => void,
    remove: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    fetchList: () => void,
    onChange: (e: ChangeEvent) => void,
    textValue: MutableRefObject<string>,
    className?: string,
    keyValue: string[][],
    selected: string,
    deviceId: string,
    trackIndex: number,
    fxIndex?: number,
};

const DevicePresetManager: React.FC<DevicePresetManager> = ({ 
    save, 
    select, 
    fetchList,
    remove, 
    onSubmit, 
    newDevice,
    onChange,
    textValue,
    deviceId, 
    keyValue, 
    selected, 
    className, 
    trackIndex, 
    fxIndex 
}) => {
    const ref_temp: MutableRefObject<string> = useRef('');
    
    const onClick = () => {
        ref_temp.current = textValue.current;
        DropdownEmitter.emit(dropdownEventTypes.SAVE_DEVICE, {fxIndex, trackIndex})
    }

    return (
        <div className={`${styles.box} ${className}`}>
            <Dropdrown 
                save={{func: save, trackIndex, fxIndex, fetchList }} 
                value={''} dropdownId={deviceId} 
                keyValue={keyValue} 
                onSubmit={onSubmit} 
                className={styles.dropdown} 
                selected={selected} 
                select={select} 
                renamable={true}
            />
            <Plus onClick={newDevice} className={styles.buttons} />
            <TrashCan onClick={remove} className={styles.buttons}></TrashCan>
        </div>
    )
}

export default DevicePresetManager;