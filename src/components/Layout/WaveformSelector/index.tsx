import React from 'react';
import styles from './style.module.scss';
// import grayTriangle from '../../../assets/grayTriangle.svg';
// import graySaw from '../../../assets/graySaw.svg';
import GrayTriangle from './grayTriangle';
import GraySine from './GraySine';
import GraySaw from './GraySaw';
import GraySquare from './GraySquare';
import RedSaw from './RedSaw';
import RedSquare from './RedSquare';
import RedSine from './RedSine';
import RedTriangle from './RedTriangle';
import Button from './Button';

type wave = 'sine' | 'sawtooth' | 'pulse' | 'triangle';

interface WaveformSelectorProps {
    selected: wave;
    selectWaveform: (wave: wave) => void;
    className?: string,
    tabIndex: number,
}

const WaveformSelector: React.FC<WaveformSelectorProps> = ({ tabIndex, selectWaveform, selected, className }) => {
    const redButton = <Button selected={true}></Button>
    const grayButton = <Button selected={false}></Button>

    const sine = selected === 'sine' ? [<RedSine></RedSine>, redButton] : [<GraySine></GraySine>, grayButton];
    const saw = selected === 'sawtooth' ? [<RedSaw></RedSaw>, redButton] : [<GraySaw></GraySaw>, grayButton];
    const square = selected === 'pulse' ? [<RedSquare></RedSquare>, redButton] : [<GraySquare></GraySquare>, grayButton];
    const triangle = selected === 'triangle' ? [<RedTriangle></RedTriangle>, redButton] : [<GrayTriangle></GrayTriangle>, grayButton];

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <div className={styles.title}> Waveform</div>
            <div className={styles.options}>
                <div tabIndex={tabIndex} className={styles.box}>
                    <div  onClick={() => selectWaveform('triangle')} className={styles.button}>
                        {triangle[1]}
                    </div>
                    <div  onClick={() => selectWaveform('triangle')} className={styles.waveform}>
                        {triangle[0]}
                    </div>
                </div>
                <div tabIndex={tabIndex} className={styles.box}>
                    <div  onClick={() => selectWaveform('sawtooth')} className={styles.button}>
                        {saw[1]}
                    </div>
                    <div  onClick={() => selectWaveform('sawtooth')} className={styles.waveform}>
                        {saw[0]}
                    </div>
                </div>
                <div tabIndex={tabIndex} className={styles.box}>
                    <div onClick={() => selectWaveform('sine')} className={styles.button}>
                        {sine[1]}
                    </div>
                    <div onClick={() => selectWaveform('sine')} className={styles.waveform}>
                        {sine[0]}
                    </div>
                </div>
                <div tabIndex={tabIndex} className={styles.box}>
                    <div onClick={() => selectWaveform('pulse')} className={styles.button}>
                        {square[1]}
                    </div>
                    <div onClick={() => selectWaveform('pulse')} className={styles.waveform}>
                        {square[0]}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WaveformSelector;