import React from 'react';
import styles from './style.module.scss';
import Button from '../WaveformSelector/Button';
import RedLinear from './RedLinear';
import RedExponential from './RedExponential';
import GrayLinear from './GrayLinear';
import GrayExponential from './GrayExponential';
import { curveTypes } from '../../../containers/Track/defaults';


interface CurveSelectorProps {
    selected: curveTypes;
    display: 'vertical' | 'horizontal';
    selectCurve: (curve: curveTypes) => void;
    className?: string;
    tabIndex: number,
}

const CurveSelector: React.FC<CurveSelectorProps> = ({ tabIndex, display, selected, selectCurve, className }) => {
    const redButton = <Button selected={true}></Button>
    const grayButton = <Button selected={false}></Button>

    const linear = selected === curveTypes.LINEAR ? [<RedLinear></RedLinear>, redButton] : [<GrayLinear></GrayLinear>, grayButton];
    const exponential = selected === curveTypes.EXPONENTIAL ? [<RedExponential></RedExponential>, redButton] : [<GrayExponential></GrayExponential>, grayButton];

    const displayClass = display === 'horizontal' ? styles.horizontal : styles.vertical;
    return (
        <div className={`${displayClass} ${className}`}>
            <div className={styles.title}> Curve </div>
            <div className={styles.options}>
                <div  tabIndex={tabIndex} className={styles.box}>
                    <div  onClick={() => selectCurve(curveTypes.LINEAR)} className={styles.button}>{linear[1]}</div>
                    <div  onClick={() => selectCurve(curveTypes.LINEAR)} className={styles.curve}>{linear[0]}</div>
                </div>
                <div tabIndex={tabIndex} className={styles.box}>
                    <div  onClick={() => selectCurve(curveTypes.EXPONENTIAL)} className={styles.button}>{exponential[1]}</div>
                    <div  onClick={() => selectCurve(curveTypes.EXPONENTIAL)} className={styles.curve}>{exponential[0]}</div>
                </div>
            </div>
        </div>
    )
}

export default CurveSelector;