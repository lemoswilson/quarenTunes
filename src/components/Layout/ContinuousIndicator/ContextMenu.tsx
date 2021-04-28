import React from 'react';
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
                    return <li onClick={option[1]} key={option[0]}>{option[0]}</li>
                })} 
            </ul> 
        </div>
    )

}

export default ContextMenuComponent;