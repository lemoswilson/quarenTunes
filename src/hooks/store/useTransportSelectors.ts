import { useSelector } from 'react-redux';
import { isPlaySelector, isRecSelector } from '../../store/Transport/selectors';
import usePrevious from '../usePrevious';
import useQuickRef from '../useQuickRef';

export const useIsPlaySelector = () => {
    const isPlay = useSelector(isPlaySelector);
    const ref_isPlay = useQuickRef(isPlay);
    const prev_isPlay = usePrevious(isPlay);

    return { isPlay, ref_isPlay, prev_isPlay }
}

export const useIsRecSelector = () => {
    const isRec = useSelector(isRecSelector);
    const ref_isRec = useQuickRef(isRec);

    return { isRec, ref_isRec };
}