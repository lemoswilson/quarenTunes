import { useRef } from 'react';
import WebMidi, { InputEventControlchange } from 'webmidi';
import { getNested, setNestedValue, deleteProperty } from '../../lib/objectDecompose';

export type controlChangeEvent = (e: InputEventControlchange) => void;

export const useMidiLearn = (
    propertiesIncDec: any,

) => {

    const ref_CCMaps = useRef<any>({});
    const ref_listenCC = useRef<controlChangeEvent>();

    const wrapBind = (f: Function, cc: number): ((e: InputEventControlchange) => void) => {
        const functRect = (e: InputEventControlchange) => {
            if (e.controller.number === cc) {
                f(e)
            }
        }
        return functRect
    }

    const bindCCtoParameter = (
        device: string,
        channel: number,
        cc: number,
        property: string
    ) => {

        const calculationCallback = wrapBind(
            getNested(
                propertiesIncDec,
                property
            ), cc
        );

        setNestedValue(
            property
            , {
                func: calculationCallback,
                device: device,
                channel: channel,
                cc: cc,
            },
            ref_CCMaps.current
        )

        if (device && channel) {
            let i = WebMidi.getInputByName(device)
            if (i) {
                i.addListener(
                    'controlchange',
                    channel,
                    calculationCallback
                );
            }
        }

        WebMidi.inputs.forEach(input => {
            input.removeListener('controlchange', 'all', ref_listenCC.current)
        })
        ref_listenCC.current = undefined;
    }

    // const midiLearn = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, property: string) => {
    const midiLearn = (property: string) => {

        let locked = false;
        const mappedProperty = getNested(ref_CCMaps.current, property);
        if (mappedProperty) {
            locked = true;
            let device = WebMidi.getInputByName(mappedProperty.device);
            if (device) {
                device.removeListener(
                    'controlchange',
                    mappedProperty.channel,
                    mappedProperty.func,
                )
                deleteProperty(ref_CCMaps.current, property);
            }
        }
        if (!locked) {

            ref_listenCC.current = (e: InputEventControlchange): void => {
                return bindCCtoParameter(
                    e.target.name,
                    e.channel,
                    e.controller.number,
                    property,
                )
            }

            WebMidi.inputs.forEach(input => {
                if (ref_listenCC.current) {
                    input.addListener(
                        'controlchange',
                        'all',
                        ref_listenCC.current
                    )
                }
            });
        }
    }

    return { midiLearn, ref_CCMaps };
};