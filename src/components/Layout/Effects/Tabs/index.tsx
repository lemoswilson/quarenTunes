import React, { MutableRefObject, useContext, useRef, useState, useEffect } from 'react';
import MenuContext from '../../../../context/MenuContext';

import { effectTypes } from '../../../../store/Track';

import mais from '../../../../assets/plusWhite.svg'
import styles from './style.module.scss';
import menuStyles from '../../Instruments/Tabs/instrumentMenu.module.scss';
import OptionList from '../../Instruments/Tabs/OptionList';
import optionListStyles from '../../Instruments/Tabs/optionList.module.scss';
import instrumentMenuStyles from '../../Instruments/Tabs/instrumentMenu.module.scss';

import MenuEmitter, { menuEmitterEventTypes } from '../../../../lib/Emitters/MenuEmitter';

import MenuButton from '../../Instruments/Tabs/MenuButton';
import RemoveEntry from './removeEntry';

interface TabsProps {
    type: effectTypes,
    trackIndex: number,
    fxIndex: number,
    fxCount: number,
    selectEffect: (effect: effectTypes, trackIndex: number, fxIndex: number) => void,
    insertEffect: (effect: effectTypes, trackIndex: number, fxIndex: number) => void,
    removeEffect: (fxIndex: number, trackIndex: number) => void,
}

const Tabs: React.FC<TabsProps> = ({
    type,
    fxIndex,
    insertEffect,
    selectEffect,
    removeEffect,
    trackIndex,
    fxCount,
}) => {

    const [isAddOpen, setAdd] = useState(false);
    const [isMenuOpen, setMenu] = useState(false);

    const divRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

    const menuContext = useContext(MenuContext);

    function _removeEffect(this: HTMLLIElement, e: MouseEvent){
        e.stopPropagation() 
        removeEffect(fxIndex, trackIndex);
    }

    const toggleAddMenu = () => {
        setAdd(state => !state);
    }

    const toggleEffectMenu = () => {
        setMenu(state => !state)
    };


    function openAddMenu(this: HTMLDivElement, e: MouseEvent){
        e.stopPropagation()
        const id = menuContext.current?.[0]
        if (!id) {
            setAdd(state => !state);
            MenuEmitter.emit(
                menuEmitterEventTypes.OPEN, 
                {id: 'addEffect', close: toggleAddMenu}
            )
        } else {
            MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
            if (id !== `selectInstrument:${trackIndex}+${fxIndex}`) {
                setAdd(state => !state);
                MenuEmitter.emit(menuEmitterEventTypes.OPEN, 
                    {id: `selectInstrument:${trackIndex}+${fxIndex}`, close: toggleAddMenu}
                )
            }
        }
    }

    function openEffectMenu(this: SVGSVGElement, e: MouseEvent){
        e.stopPropagation()
        const id = menuContext.current?.[0]
        if (!id) {
            setMenu(state => !state);
            MenuEmitter.emit(
                menuEmitterEventTypes.OPEN, 
                {id: 'addEffect', close: toggleEffectMenu}
            )
        } else {
            MenuEmitter.emit(menuEmitterEventTypes.CLOSE, {})
            if (id !== `selectInstrument:${trackIndex}+${fxIndex}`) {
                setMenu(state => !state);
                MenuEmitter.emit(menuEmitterEventTypes.OPEN, 
                    {id: 'addInstrumentButton', close: toggleEffectMenu}
                )
            }
        }
    }


    useEffect(() => {
        const div = divRef.current
        div?.addEventListener('click', openAddMenu)
        return () => {
            div?.removeEventListener('click', openAddMenu)
        }
    }, [])

    const onAction = (item: effectTypes) => {
        insertEffect(item, trackIndex, fxIndex)
    }

    const onSelectAction = (item: effectTypes) => {
        selectEffect(item, fxIndex, trackIndex);
    }

    const effectListPicker = (
        <ul 
            className={menuStyles.menu}
            style={{
                left: '-5rem',
                top: 0,
            }}
        >
            <OptionList 
                label={'Add Effect'} 
                list={Object.values(effectTypes)} 
                onAction={onAction} 
                selected={''}
            />
        </ul>
    )


    const effectMenu = (
        <ul 
        className={instrumentMenuStyles.menu} 
            style={{
                // right: '5rem',
                left: '-4rem',
                top: '-5rem',
                transform: 'rotate(-90deg)',
                marginBottom: '1rem'
            }} 
        >
            <OptionList 
                // open={instrumentListOpen}
                label={'Effect'} 
                list={Object.values(effectTypes)} 
                onAction={onSelectAction} 
                selected={type}
            />
            <RemoveEntry 
                className={optionListStyles.listElement}
                fxCount={fxCount} 
                removeEffect={_removeEffect}
            />
        </ul>
    ) 


    return (
        <div className={styles.tabs}>
            <div className={styles.selector}>
                <div className={styles.border}>
                    <div className={styles.effectTitle}>
                        { type }        
                    </div> 
                    <div className={styles.menuWrapper}>
                        <MenuButton className={styles.className} onClickSVG={openEffectMenu}/> 
                        { isMenuOpen ? effectMenu : null}
                    </div> 
                </div> 
            </div>  
            {
                fxCount < 2 
                ? <div ref={divRef} className={styles.plus}>
                    <img className={styles.svg} src={mais} alt='plus' width={'100%'} height={'100%'} /> 
                    { isAddOpen ? effectListPicker : null }
                </div> 
                : null
            }

        </div>
    )
}


export default Tabs;