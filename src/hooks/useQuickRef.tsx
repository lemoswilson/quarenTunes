import { useRef, useEffect } from "react";

export default function useQuickRef<T>(value: T) {
    const ref = useRef<T>(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref;
}
