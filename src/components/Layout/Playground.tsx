import React, { useRef, useState } from 'react';
import Dropdrown from './Dropdown'
import styles from './Playground.module.scss';

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

    return (
        <React.Fragment>
            <div className={styles.box}>
                <Dropdrown selected={selected} lookup={lookup} keys={Options.current} select={select}></Dropdrown>
            </div>
        </React.Fragment>
    )
}

export default Playground;