import React, { useRef, MutableRefObject, useEffect } from 'react';

interface RemoveEntryProps {
    className: string,
    fxCount: number,
    removeEffect: (this: HTMLLIElement, e: MouseEvent) => void;
}

const RemoveEntry: React.FC<RemoveEntryProps> = ({className, fxCount, removeEffect}) => {
    const liRef: MutableRefObject<HTMLLIElement | null> = useRef(null)

    useEffect(() => {
        const li = liRef.current
        li?.addEventListener('click', removeEffect)
        return () => {
            li?.removeEventListener('click', removeEffect)
        }
    }, []) 

    return (
        fxCount > 1 
        ? <li 
            ref={liRef}
            style={{border: 'none' , cursor: 'pointer'}} 
            className={className} 
        >
            <span style={{width: '0.6rem'}}></span>Remove Effect
        </li>
        : null
    )
}

export default RemoveEntry;