import React, {  MutableRefObject,  useRef } from 'react';
import styles from './style.module.scss';
import DrumRackFile from '../../../UI/DrumRackFile';
import { widgetTabIndexTrkStart } from '../../../../containers/Track/defaults';
import { InstrumentLayoutProps } from '../../../../containers/Track/Instruments/InstrumentLoader'


const DrumRack: React.FC<InstrumentLayoutProps> = ({
    getContinuousIndicator,
    getCurveSelector,
    index,
}) => {

    const pad1UrlRef = useRef<HTMLInputElement>(null);
    const fileHandle: MutableRefObject<any> = useRef<FileSystemHandle>()
    const pickerOpts = {
        types: [
            {
                descriptions: "audio",
                accept: {
                    'audio/*': ['.wav', '.aif']
                }
            },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
    }


    async function getFile() {
        // [fileHandle.current] = await window.showOpenFilePicker(pickerOpts);
        [fileHandle.current] = await window.showOpenFilePicker();
        console.log(fileHandle.current)
        // const file = await fileHandle.current.getFile();
        // console.log(file);
        // if (fileHandle.current.type === 'file') {
        //     console.log('tateno', fileHandle.current)
        // } else if (fileHandle.current.type === 'directory') {
        //     console.log('tateno directory', fileHandle.current);
        // }
    }


    return (
        <div className={styles.wrapper}>
            <div className={styles.sideTitle}><h1>DrumRack</h1></div>
            <div className={styles.tweakers}>
                <div className={styles.top}>
                    <div className={`${styles.pad}`}>
                        { getContinuousIndicator?.('PAD_0.attack', 'Attack')}
                        { getContinuousIndicator?.('PAD_0.release', 'Release')}
                        { getContinuousIndicator?.('PAD_0.volume', 'Volume', undefined, 'volume')}
                        { getCurveSelector?.('PAD_0.curve', 'vertical', styles.curve, 'envelope', true, 0)}
                        <DrumRackFile tabIndex={widgetTabIndexTrkStart + Number(index)} onClick={() => { }} />
                    </div>
                    <div className={`${styles.pad}`}>
                        { getContinuousIndicator?.('PAD_1.attack', 'Attack')}
                        { getContinuousIndicator?.('PAD_1.release', 'Release')}
                        { getContinuousIndicator?.('PAD_1.volume', 'Volume', undefined, 'volume')}
                        { getCurveSelector?.('PAD_1.curve', 'vertical', styles.curve, 'envelope', true, 1)}
                        <DrumRackFile tabIndex={widgetTabIndexTrkStart + Number(index)} onClick={() => { }} />
                    </div>
                    <div className={`${styles.pad}`}>
                        { getContinuousIndicator?.('PAD_2.attack', 'Attack')}
                        { getContinuousIndicator?.('PAD_2.release', 'Release')}
                        { getContinuousIndicator?.('PAD_2.volume', 'Volume', undefined, 'volume')}
                        { getCurveSelector?.('PAD_2.curve', 'vertical', styles.curve, 'envelope', true, 2)}
                        <DrumRackFile tabIndex={widgetTabIndexTrkStart + Number(index)} onClick={() => { }} />
                    </div>
                    <div className={`${styles.pad}`}>
                        { getContinuousIndicator?.('PAD_3.attack', 'Attack')}
                        { getContinuousIndicator?.('PAD_3.release', 'Release')}
                        { getContinuousIndicator?.('PAD_3.volume', 'Volume', undefined, 'volume')}
                        { getCurveSelector?.('PAD_3.curve', 'vertical', styles.curve, 'envelope', true, 3)}
                        <DrumRackFile tabIndex={widgetTabIndexTrkStart + Number(index)} onClick={() => { }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DrumRack;