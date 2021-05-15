import { useRef, useEffect } from "react";

export default function useQuickRef<T>(value: T) {
    const ref = useRef<T>(value);
    useEffect(() => {
        console.log('updating quickref')
        ref.current = value;
    }, [value]);

    return ref;
    // return ref.current as T;
}
