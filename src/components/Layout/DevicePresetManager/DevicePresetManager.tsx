import React, { useRef, useState } from 'react';
import styles from './style.module.scss';
import Dropdrown from '../Dropdown'
import Save from '../Icons/Save';
import TrashCan from '../Icons/TrashCan';

interface DevicePresetManager {
    className?: string,
    save: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    remove: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    keys: string[],
    selected: string,
    select: any,
    lookup: (key: string) => string
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLFormElement>) => void;
};

const DevicePresetManager: React.FC<DevicePresetManager> = ({ keys, lookup, save, select, selected, className, remove, onSubmit, onBlur }) => {

    return (
        <div className={`${styles.box} ${className}`}>
            <Dropdrown keyValue={keys.map(key => [key, lookup(key)])} onSubmit={onSubmit} className={styles.dropdown} selected={selected} lookup={lookup} keys={keys} select={select}></Dropdrown>
            <Save onClick={save} className={styles.buttons}></Save>
            <TrashCan onClick={remove} className={styles.buttons}></TrashCan>
        </div>
    )
}

export default DevicePresetManager;