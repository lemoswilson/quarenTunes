import { useEffect, MutableRefObject } from 'react';
import dropdownEmitter, { ExtractDropdownPayload, dropdownEventTypes} from '../../lib/Emitters/dropdownEmitter';

const useDropdownEmitter = (
    ref_dropdowns: MutableRefObject<{[key: string]: () => void }>,
) => {

    const escapeDropdown = (): void => {
        Object.keys(ref_dropdowns.current).forEach(k => {
            ref_dropdowns.current[k]();
            delete ref_dropdowns.current[k]
        })
    }

    const openDropdown = (payload: ExtractDropdownPayload<dropdownEventTypes.OPEN>): void => {
        ref_dropdowns.current[payload.id] = payload.openClose;
    }

    const removeDropdown = (payload: ExtractDropdownPayload<dropdownEventTypes.REMOVE>): void => {
        delete ref_dropdowns.current[payload.id];
    }

    useEffect(() => {

        dropdownEmitter.on(dropdownEventTypes.ESCAPE, escapeDropdown)
        dropdownEmitter.on(dropdownEventTypes.OPEN, openDropdown)
        dropdownEmitter.on(dropdownEventTypes.REMOVE, removeDropdown)


        return () => {

            dropdownEmitter.off(dropdownEventTypes.ESCAPE, escapeDropdown)
            dropdownEmitter.off(dropdownEventTypes.OPEN, openDropdown)
            dropdownEmitter.off(dropdownEventTypes.REMOVE, removeDropdown)


        }
    }, [])


};

export default useDropdownEmitter;