import React, { MouseEvent as ME, MutableRefObject, useEffect, useRef, useState } from 'react';
import SelectionIndicator from './SelectionIndicator';
import styles from './optionList.module.scss';
import Polygon from '../../../UI/Dropdown/Polygon';

interface ListItemProps {
    item: string | number,
    onAction:(item: any) => void;
    style: any,
}

const ListItem: React.FC<ListItemProps> = ({ item, onAction, style }) => {
    const listRef: MutableRefObject<HTMLLIElement | null> = useRef(null);
    const [isHover, setHover] = useState(false)

    function isOverflow(element: HTMLLIElement | null) {
        return (
            element && 
            element.offsetWidth < element.scrollWidth
            && isHover 
        )
    }

    function onMouseOver(e: ME) {
        setHover(true)
    }

    function onMouseOut(e: ME) {
        setHover(false)
    }

    const shouldExtend = isOverflow(listRef.current) ? styles.extend : ''

    function action(this: HTMLLIElement, e: MouseEvent){
        e.stopPropagation() 
        onAction(item)
    }

   useEffect(() => {
       listRef.current?.addEventListener('click', action)
       return () => {
            listRef.current?.removeEventListener('click', action)
       }
   }, [])

    return (
        <li 
            ref={listRef} 
            // onClick={() => onAction(item)} 
            className={`${styles.li} ${shouldExtend}`}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            style={style}
        >
            {item} 
            {/* <span>{selected ? SelectionIndicator : ''}</span> */}
        </li>
    )
}

interface OptionListProps {
    selected: string | number | undefined;
    list: (string | number)[];
    onAction: (item: any) => void;
    label: string,
    // open: boolean,
}


const OptionList: React.FC<OptionListProps> = ({
    list, 
    selected, 
    onAction, 
    label,
}) => {

    const subList: MutableRefObject<HTMLLIElement | null> = useRef(null)
    const [open, setState] = useState(false);

    const onMouseEnter = (e: ME) => {
        setState(true)
    }

    const onMouseLeave = (e: ME) => {
        setState(false)
    }

    const selectedColor = (item: string | number ) => selected === item ? {color: 'red'} : undefined



    const options =                 
        <ul className={styles.subList} >

            { 
                list.map(item => {
                    return (
                        <React.Fragment key={`list:${item}`}>
                            <ListItem style={selectedColor(item)}  item={item} onAction={onAction}/>
                        </React.Fragment>
                    
                    )
                }) 
            }
            {/* {label === 'Midi Channel' ? <ListItem item={'all'} onAction={onAction} style={selectedColor('all')}/> : null} */}

        </ul>

            
    

    return(
        <React.Fragment>
            <li onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={styles.listElement} >
                <div style={{width: '0.6rem'}}></div>
                <div className={styles.text}>{ label }</div>
                <div className={styles.indicator}>
                    <Polygon className={styles.polygon}/>
                </div> 
                { open ? options : null }
            </li>
        </React.Fragment>
    )
}




export default OptionList;