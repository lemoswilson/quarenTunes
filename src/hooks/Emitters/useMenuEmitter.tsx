import React, { useEffect, MutableRefObject } from 'react';
import MenuEmitter, { ExtractMenuPayload, menuEmitterEventTypes } from '../../lib/Emitters/MenuEmitter';

const useMenuEmitter = (
    ref_menus: MutableRefObject<any[]>,
) => {
    
    const openMenu = (payload: ExtractMenuPayload<menuEmitterEventTypes.OPEN>): void => {
        ref_menus.current = [payload.id, payload.close]
    }

    const closeMenu = (): void => {
        if (ref_menus.current.length > 0){
            ref_menus.current[1]((state: any) => !state)
            ref_menus.current = []
        }
    }

    function onClick(this: HTMLDocument, e: MouseEvent) {
        closeMenu()
    }

    useEffect(() => {
        document.addEventListener('click', onClick)
        return () => {
            document.removeEventListener('click', onClick)
        }
    }, [])

    useEffect(() => {

        MenuEmitter.on(menuEmitterEventTypes.OPEN, openMenu)
        MenuEmitter.on(menuEmitterEventTypes.CLOSE, closeMenu)

        return () => {

            MenuEmitter.off(menuEmitterEventTypes.OPEN, openMenu)
            MenuEmitter.off(menuEmitterEventTypes.CLOSE, closeMenu)

        }
    }, [])

}

export default useMenuEmitter;