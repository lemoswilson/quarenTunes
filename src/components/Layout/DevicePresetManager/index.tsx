import React, { useRef, useState } from 'react';
import styles from './style.module.scss';
import Dropdrown from '../Dropdown'
import Save from '../Icons/Save';
import TrashCan from '../Icons/TrashCan';

interface DevicePresetManager {
    className?: string,
    save: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    remove: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    // keys: string[],
    keyValue: string[][],
    selected: string,
    select: (key: string) => void,
    // lookup: (key: string) => string
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    deviceId: string,
    // onBlur: (event: React.FocusEvent<HTMLFormElement>) => void;
};

const DevicePresetManager: React.FC<DevicePresetManager> = ({ deviceId, keyValue, save, select, selected, className, remove, onSubmit }) => {

    return (
        <div className={`${styles.box} ${className}`}>
            <Dropdrown dropdownId={deviceId} keyValue={keyValue} onSubmit={onSubmit} className={styles.dropdown} selected={selected} select={select}></Dropdrown>
            <Save onClick={save} className={styles.buttons}></Save>
            <TrashCan onClick={remove} className={styles.buttons}></TrashCan>
        </div>
    )
}

export default DevicePresetManager;