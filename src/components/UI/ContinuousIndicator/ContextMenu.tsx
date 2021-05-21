import React, { MutableRefObject, useEffect, useRef } from 'react';
import styles from './contextMenu.module.scss';

interface ContextMenuComponentProps {
    MenuPosition?: {
        left: number,
        top: number
    },
    menuOptions: any[]
}

const ContextMenuComponent: React.FC<ContextMenuComponentProps> = ({
    MenuPosition, 
    menuOptions
}) => {


    return (
        <div className={styles.contextMenu} style={MenuPosition}>
            <ul>
                { menuOptions.map(option => {
                    // return <li onClick={option[1]} key={option[0]}>{option[0]}</li>
                    return <ListElement onClick={option[1]} key={option[0]} children={option[0]}/>
                })} 
            </ul> 
        </div>
    )

}

interface ListElementProps {
    onClick: () => void,
    children?: React.ReactNode,
}

const ListElement: React.FC<ListElementProps> = ({onClick, children}) => {
    const liRef: MutableRefObject<HTMLLIElement | null> = useRef(null)

    function callback(this: HTMLLIElement, e: MouseEvent){
        e.stopPropagation()
        onClick()
    }
    
    useEffect(() => {
        const li = liRef.current
        li?.addEventListener('click', callback)
        return () => {
            li?.removeEventListener('click', callback)
        }

    }, []);

    return (
        <li ref={liRef}> {children} </li>
    )
}

export default ContextMenuComponent;