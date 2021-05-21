import { getNested, setNestedValue } from '../../lib/objectDecompose';
import { event } from '../../store/Sequencer';

export const getParameterLockValue = (
    property: string, 
    selected: number[], 
    events: event[], 
    o: any, 
    effect?: boolean, 
    fxIndex?: number
) => {
    const fx = Number(fxIndex);

    const selectedPropertyArray = selected?.map(s => getNested(effect && !Number.isNaN(fx) ? events[s].fx[fx] : events[s].instrument, property))

    const allValuesEqual =
        selected && selected.length > 0
            ? selectedPropertyArray && selectedPropertyArray.every((v, idx, arr) => v && v === arr[0])
            : false;
    const noValuesInSelected =
        selected && selected.length > 0
            ? selectedPropertyArray && selectedPropertyArray.every(v => v === undefined)
            : false;

    setNestedValue(
        property,
        [
            allValuesEqual,
            allValuesEqual ? selectedPropertyArray && selectedPropertyArray[0] : false,
            noValuesInSelected
        ],
        o,
    ) 
}

export const getPropertyValue = <T extends number | string>(
    property: string, 
    parameterLockValues: any, 
    options: any, 
    selected: number[]
): T  => {

    const pmValues: (number | boolean | string)[] = getNested(parameterLockValues, property)
    return selected && selected.length > 1 && !pmValues[0] && !pmValues[2]
        ? '*'
        : pmValues[0]
            ? pmValues[1]
            : getNested(options, property)[0]
};

export const getPercentage = (value: number | '*'): number | '*' => {
    if (value === '*')
        return value
    else
        return Number((100 * value).toFixed(4))
}