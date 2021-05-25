import { MutableRefObject } from 'react';
import usePrevious from './usePrevious';
import useQuickRef from './useQuickRef';

function usePrevAndRef  <T>(ob: T): { prev: T, ref: MutableRefObject<T>}  {
    const ref = useQuickRef(ob)
    const prev = usePrevious(ob)

    return { ref, prev }
}

export default usePrevAndRef;