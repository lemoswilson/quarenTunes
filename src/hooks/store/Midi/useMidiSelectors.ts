import { useSelector } from 'react-redux';
import { keyboardRangeSelector } from '../../../store/MidiInput/selectors';
import useQuickRef from '../../lifecycle/useQuickRef';

export const useKeyboardRangeSelector = () => {
    const keyboardRange = useSelector(keyboardRangeSelector);
    const ref_keyboardRange = useQuickRef(keyboardRange);

    return ref_keyboardRange
};