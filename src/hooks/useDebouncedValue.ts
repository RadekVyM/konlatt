import { useEffect, useRef, useState } from "react";

export default function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T | undefined>(undefined);
    const initialRunRef = useRef<boolean>(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (initialRunRef.current) {
            setDebouncedValue(() => value);

            return;
        }

        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(() => value);
            timeoutRef.current = null;
        }, delay);
    }, [value, delay]);

    initialRunRef.current = false;

    return initialRunRef.current ? value : debouncedValue!;
}