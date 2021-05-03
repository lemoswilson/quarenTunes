import React from 'react';
import SelectionIndicator from './SelectionIndicator';
import styles from './optionList.module.scss';

interface OptionListProps {
    selected: string | number | undefined;
    list: (string | number)[];
    onAction: (item: any) => void;
    label: string,
}


const OptionList: React.FC<OptionListProps> = ({list, selected, onAction, label}) => {
    

    const options =                 
        <ul className={styles.options}>
            { 
                list.map(item => {
                    return (
                        <li onClick={() => onAction(item)} className={styles.li}>
                            item 
                            <span>{selected ? SelectionIndicator : ''}</span>
                        </li>
                    )
                }) 
            }
        </ul>

    return(
        <React.Fragment>
            <li className={styles.menu}>
                { label } 
                { }
            </li>
        </React.Fragment>
    )
}

export default OptionList;