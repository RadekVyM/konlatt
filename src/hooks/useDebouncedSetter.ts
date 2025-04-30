import { useEffect, useRef } from "react";

export default function useDebouncedSetter<T>(value: T, setter: (value: T) => void, delay: number) {
    const initialRunRef = useRef<boolean>(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (initialRunRef.current) {
            setter(value);

            return;
        }

        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        timeoutRef.current = setTimeout(() => {
            setter(value);
            timeoutRef.current = null;
        }, delay);
    }, [value, setter, delay]);

    initialRunRef.current = false;
}