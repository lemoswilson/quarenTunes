import React, {  MutableRefObject,  useEffect,  useRef } from 'react';
import { useDispatch } from 'react-redux';
import styles from './style.module.scss';
import DrumRackFile from '../../../UI/DrumRackFile';
import { widgetTabIndexTrkStart } from '../../../../containers/Track/defaults';
import { InstrumentLayoutProps } from '../../../../containers/Track/Instruments/InstrumentLoader'
import Dropdown from '../../../UI/Dropdown';
import strong from '../../../../assets/drumkit/kick1.mp3';
import { samples } from '../../../../lib/Tone/initializers';
import { setSample } from '../../../../store/Track';


interface DrumRackProps  extends InstrumentLayoutProps {
    id?: number,
    options?: any,
}

const DrumRack: React.FC<DrumRackProps> = ({
    getContinuousIndicator,
    getCurveSelector,
    index,
    id,
    options,

}) => {
    const dispatch = useDispatch();
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

    const _setSample = (pad: number, sample: samples) => {
        if (index || index === 0)
            dispatch(setSample(index, pad, sample))
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

    useEffect(() => {
        console.log('eita ', )
    }, [])


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
                        {/* <DrumRackFile tabIndex={widgetTabIndexTrkStart + Number(index)} onClick={() => { }} /> */}
                        <Dropdown 
                            dropdownId={`drumRackId${id}:pad_0`} 
                            keyValue={Object.values(samples).map(v => [v, v])}
                            select={(key: any) => { _setSample(0, key)}}
                            selected={options?.PAD_0.urls.C3}
                            value={options?.PAD_0.urls.C3}
                            className={styles.dropdown}
                        />
                    </div>
                    <div className={`${styles.pad}`}>
                        { getContinuousIndicator?.('PAD_1.attack', 'Attack')}
                        { getContinuousIndicator?.('PAD_1.release', 'Release')}
                        { getContinuousIndicator?.('PAD_1.volume', 'Volume', undefined, 'volume')}
                        { getCurveSelector?.('PAD_1.curve', 'vertical', styles.curve, 'envelope', true, 1)}
                        {/* <DrumRackFile tabIndex={widgetTabIndexTrkStart + Number(index)} onClick={() => { }} /> */}
                        <Dropdown 
                            dropdownId={`drumRackId${id}:pad_1`} 
                            keyValue={Object.values(samples).map(v => [v, v])}
                            select={(key: any) => { _setSample(1, key)}}
                            selected={options?.PAD_1.urls.C3}
                            value={options?.PAD_1.urls.C3}
                            className={styles.dropdown}
                        />
                    </div>
                    <div className={`${styles.pad}`}>
                        { getContinuousIndicator?.('PAD_2.attack', 'Attack')}
                        { getContinuousIndicator?.('PAD_2.release', 'Release')}
                        { getContinuousIndicator?.('PAD_2.volume', 'Volume', undefined, 'volume')}
                        { getCurveSelector?.('PAD_2.curve', 'vertical', styles.curve, 'envelope', true, 2)}
                        {/* <DrumRackFile tabIndex={widgetTabIndexTrkStart + Number(index)} onClick={() => { }} /> */}
                        <Dropdown 
                            dropdownId={`drumRackId${id}:pad_2`} 
                            keyValue={Object.values(samples).map(v => [v, v])}
                            select={(key: any) => { _setSample(2, key)}}
                            selected={options?.PAD_2.urls.C3}
                            value={options?.PAD_2.urls.C3}
                            className={styles.dropdown}
                        />
                    </div>
                    <div className={`${styles.pad}`}>
                        { getContinuousIndicator?.('PAD_3.attack', 'Attack')}
                        { getContinuousIndicator?.('PAD_3.release', 'Release')}
                        { getContinuousIndicator?.('PAD_3.volume', 'Volume', undefined, 'volume')}
                        { getCurveSelector?.('PAD_3.curve', 'vertical', styles.curve, 'envelope', true, 3)}
                        {/* <DrumRackFile tabIndex={widgetTabIndexTrkStart + Number(index)} onClick={() => { }} /> */}
                        <Dropdown 
                            dropdownId={`drumRackId${id}:pad_3`} 
                            keyValue={Object.values(samples).map(v => [v, v])}
                            select={(key: any) => { _setSample(3, key)}}
                            selected={options?.PAD_3.urls.C3}
                            value={options?.PAD_3.urls.C3}
                            className={styles.dropdown}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DrumRack;