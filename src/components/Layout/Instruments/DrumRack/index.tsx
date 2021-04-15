import React, { useEffect, useMemo } from 'react';
import { updateEnvelopeCurve } from '../../../../store/Track';
import { getNested, setNestedValue } from '../../../../lib/objectDecompose';
import styles from './style.module.scss';
import ContinuousIndicator from '../../ContinuousIndicator';
import CurveSelector from '../../CurveSelector';
import { useDispatch } from 'react-redux';
import SteppedIndicator from '../../SteppedIndicator';
import { event } from '../../../../store/Sequencer';
import { curveTypes } from '../../../../containers/Track/defaults';

export interface DrumRack {
    // options: initialsArray,
    options: any,
    calcCallbacks: any,
    propertyUpdateCallbacks: any,
    index: number,
    selected: number[],
    events: event[],
    properties: any[];
}

const DrumRack: React.FC<DrumRack> = ({
    calcCallbacks,
    options,
    propertyUpdateCallbacks,
    index,
    events,
    properties,
    selected,
}) => {
    const dispatch = useDispatch()
    // const Pad0 = options.PAD_0;
    const attackPad0 = options.PAD_0.attack
    const releasePad0 = options.PAD_0.release
    const volumePad0 = options.PAD_0.volume
    const curvePad0 = options.PAD_0.curve
    const baseUrlPad0 = options.PAD_0.baseUrl
    const urlsPad0 = options.PAD_0.urls.C3
    const attackPad1 = options.PAD_1.attack
    const releasePad1 = options.PAD_1.release
    const volumePad1 = options.PAD_1.volume
    const curvePad1 = options.PAD_1.curve
    const baseUrlPad1 = options.PAD_1.baseUrl
    const urlsPad1 = options.PAD_1.urls.C3
    const attackPad2 = options.PAD_2.attack
    const releasePad2 = options.PAD_2.release
    const volumePad2 = options.PAD_2.volume
    const curvePad2 = options.PAD_2.curve
    const baseUrlPad2 = options.PAD_2.baseUrl
    const urlsPad2 = options.PAD_2.urls.C3
    const attackPad3 = options.PAD_3.attack
    const releasePad3 = options.PAD_3.release
    const volumePad3 = options.PAD_3.volume
    const curvePad3 = options.PAD_3.curve
    const baseUrlPad3 = options.PAD_3.baseUrl
    const urlsPad3 = options.PAD_3.urls.C3

    // useEffect(() => {

    // }, [])

    // const onSelect = () => {
    //     window
    // }

    const parameterLockValues = useMemo(() => {
        const o: any = {}
        properties.forEach(property => {
            const selectedPropertyArray = selected.map(s => getNested(events[s].instrument, property))

            const allValuesEqual =
                selected.length > 0
                    ? selectedPropertyArray.every((v, idx, arr) => v && v === arr[0])
                    : false;
            const noValuesInSelected =
                selected.length > 0
                    ? selectedPropertyArray.every(v => v === undefined)
                    : false;

            setNestedValue(
                property,
                [
                    allValuesEqual,
                    allValuesEqual ? selectedPropertyArray[0] : false,
                    noValuesInSelected
                ],
                o,
            )
        })
        return o
    }, [properties, selected, events])


    const getPropertyValue = (property: string): number | '*' => {
        const pmValues: (number | boolean | string)[] = getNested(parameterLockValues, property)
        return selected.length > 1 && !pmValues[0] && !pmValues[2]
            ? '*'
            : pmValues[0]
                ? pmValues[1]
                : getNested(options, property)[0]
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.sideTitle}><h1>DrumRack</h1></div>
            <div className={styles.tweakers}>
                <div className={styles.top}>
                    <div className={`${styles.pad}`}>
                        <ContinuousIndicator
                            selectedLock={false}
                            ccMouseCalculationCallback={calcCallbacks.PAD_0.attack}
                            label={'Attack'}
                            max={attackPad0[1][1]}
                            midiLearn={() => { }}
                            min={attackPad0[1][0]}
                            type={'knob'}
                            unit={attackPad0[2]}
                            value={getPropertyValue('PAD_0.attack')}
                            curve={attackPad0[4]}
                            valueUpdateCallback={propertyUpdateCallbacks.PAD_0.attack}
                        // className={styles.border}
                        />
                        <ContinuousIndicator
                            selectedLock={false}
                            ccMouseCalculationCallback={calcCallbacks.PAD_0.release}
                            label={'Release'}
                            max={releasePad0[1][1]}
                            midiLearn={() => { }}
                            min={releasePad0[1][0]}
                            type={'knob'}
                            unit={releasePad0[2]}
                            value={getPropertyValue('PAD_0.release')}
                            curve={releasePad0[4]}
                            valueUpdateCallback={propertyUpdateCallbacks.PAD_0.release}
                        // className={styles.border}
                        />
                        <ContinuousIndicator
                            selectedLock={false}
                            ccMouseCalculationCallback={calcCallbacks.PAD_0.volume}
                            label={'Volume'}
                            max={volumePad0[1][1]}
                            midiLearn={() => { }}
                            detail={'volume'}
                            min={volumePad0[1][0]}
                            type={'knob'}
                            unit={volumePad0[2]}
                            value={getPropertyValue('PAD_0.volume')}
                            curve={volumePad0[4]}
                            valueUpdateCallback={propertyUpdateCallbacks.PAD_0.volume}
                        />
                        <CurveSelector
                            display={'vertical'}
                            selectCurve={(curve) => { propertyUpdateCallbacks.PAD_0.curve(curve) }}
                            selected={options.PAD_0.curve[0]}
                        />
                    </div>
                    <div className={`${styles.pad}`}></div>
                    <div className={`${styles.pad}`}></div>
                    <div className={`${styles.pad}`}></div>
                </div>
            </div>
        </div>
    )
}

export default DrumRack;