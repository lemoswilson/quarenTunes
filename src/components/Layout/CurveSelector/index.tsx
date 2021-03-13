import React from 'react';
import styles from './style.module.scss';
import Button from '../WaveformSelector/Button';
import RedLinear from './RedLinear';
import RedExponential from './RedExponential';
import GrayLinear from './GrayLinear';
import GrayExponential from './GrayExponential';

type curveType = 'linear' | 'exponential';

interface CurveSelectorProps {
    selected: curveType;
    display: 'vertical' | 'horizontal';
    selectCurve: (curve: curveType) => void;
}

const CurveSelector: React.FC<CurveSelectorProps> = ({ display, selected, selectCurve }) => {
    const redButton = <Button selected={true}></Button>
    const grayButton = <Button selected={false}></Button>

    const linear = selected === 'linear' ? [<RedLinear></RedLinear>, redButton] : [<GrayLinear></GrayLinear>, grayButton];
    const exponential = selected === 'exponential' ? [<RedExponential></RedExponential>, redButton] : [<GrayExponential></GrayExponential>, grayButton];

    const displayClass = display === 'horizontal' ? styles.horizontal : styles.vertical;
    return (
        <div className={`${displayClass}`}>
            <div className={styles.title}> Curve </div>
            <div className={styles.options}>
                <div className={styles.box}>
                    <div onClick={() => selectCurve('linear')} className={styles.button}>{linear[1]}</div>
                    <div onClick={() => selectCurve('linear')} className={styles.curve}>{linear[0]}</div>
                </div>
                <div className={styles.box}>
                    <div onClick={() => selectCurve('exponential')} className={styles.button}>{exponential[1]}</div>
                    <div onClick={() => selectCurve('exponential')} className={styles.curve}>{exponential[0]}</div>
                </div>
            </div>
        </div>
    )
}

export default CurveSelector;