import React, { useRef, useState } from 'react';
import Dropdrown from './Dropdown'
import styles from './Playground.module.scss';
// import ButtonBackground from './Icons/ButtonBackground';
import Save from './Icons/Save';
import TrashCan from './Icons/TrashCan';
import Plus from './Icons/Plus';
import Minus from './Icons/Minus';

const Playground: React.FC = () => {
    const [selected, select] = useState('1')
    const Options = useRef(['1', '2', '3', '4'])
    const lookup = (key: string) => {
        switch (key) {
            case '1':
                return 'pastel';
            case '2':
                return 'macarrão';
            case '3':
                return 'abobrinha';
            case '4':
                return 'mandioca';
            default:
                return 'jamaica';
        }
    }

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // do shit
    }

    return (
        <React.Fragment>
            <div className={styles.box}>
                <Dropdrown onSubmit={onSubmit} className={styles.mamao} selected={selected} lookup={lookup} keys={Options.current} select={select}></Dropdrown>
                {/* <Plus className={styles.mamao}></Plus>
                <Minus className={styles.estopin}></Minus> */}
                <Save className={styles.estopin}></Save>
                <TrashCan className={styles.estopin}></TrashCan>
            </div>
        </React.Fragment>
    )
}

export default Playground;