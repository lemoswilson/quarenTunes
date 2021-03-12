import React from 'react';
import styles from './style.module.scss';
import redSine from '../../../assets/redSine.svg';
import redTriangle from '../../../assets/redTriangle.svg';
import redSaw from '../../../assets/redSaw.svg';
import redSquare from '../../../assets/redSquare.svg';
import graySine from '../../../assets/graySine.svg';
// import grayTriangle from '../../../assets/grayTriangle.svg';
// import graySaw from '../../../assets/graySaw.svg';
import graySquare from '../../../assets/graySquare.svg';
import grayButton from '../../../assets/grayButton.svg';
import redButton from '../../../assets/redButton.svg';
import GrayTriangle from './grayTriangle';
import GraySine from './GraySine';
import GraySaw from './GraySaw';


interface WaveformSelectorProps {
    selected: 'sine' | 'saw' | 'square' | 'triangle';
    selectWaveform: () => any;
}

const WaveformSelector: React.FC<WaveformSelectorProps> = ({ selectWaveform, selected }) => {

    const sine = selected === 'sine' ? [redSine, redButton] : [graySine, grayButton];
    const saw = selected === 'saw' ? [redSaw, redButton] : [GrayTriangle, grayButton];
    const square = selected === 'square' ? [redSquare, redButton] : [graySquare, grayButton];
    const triangle = selected === 'triangle' ? [redTriangle, redButton] : [GrayTriangle, grayButton];

    return (
        <div className={styles.wrapper}>
            <GraySaw></GraySaw>
            <GrayTriangle></GrayTriangle>
            <GraySine></GraySine>
            {/* <img src={triangle[0]} alt="triangle" /> */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 112 87"> */}
            {/* <svg width={'2.5rem'} height={'1.5rem'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="35 25 41 37" preserveAspectRatio={'xMaxYMid slice'}>
                <title>grayTriangle</title>
                <g>
                    <polyline points="36.74 37.34 44.44 49.17 52.16 37.34 59.87 49.17 67.58 37.34 75.29 49.17" style={{ fill: "none", stroke: "#acacac", strokeMiterlimit: 10 }} />
                    <image width="112" height="87" xlinkHref="data:image/png;base64,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" />
                </g>
            </svg> */}

            {/* <div className={styles.title}> Waveform</div>
            <div className={styles.options}>
                <div className={styles.box}>
                    <div className={styles.button}>
                        <img src={triangle[1]} alt="triangle" />
                    </div>
                    <div className={styles.waveform}>
                        <img src={triangle[0]} alt="triangle" />
                    </div>
                </div>
                <div className={styles.box}>
                    <div className={styles.button}>
                        <img src={saw[1]} alt="triangle" />
                    </div>
                    <div className={styles.waveform}>
                        <img src={saw[0]} alt="triangle" />
                    </div>
                </div>
                <div className={styles.box}>
                    <div className={styles.button}>
                        <img src={sine[1]} alt="triangle" />
                    </div>
                    <div className={styles.waveform}>
                        <img className={styles.img} src={sine[0]} alt="triangle" />
                    </div>
                </div>
                <div className={styles.box}>
                    <div className={styles.button}>
                        <img src={square[1]} alt="triangle" />
                    </div>
                    <div className={styles.waveform}>
                        <img src={square[0]} alt="triangle" />
                    </div>
                </div>
            </div> */}
        </div>
    )
}

export default WaveformSelector;