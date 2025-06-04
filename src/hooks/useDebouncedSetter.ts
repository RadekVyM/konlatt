import { useEffect, useRef } from "react";

export default function useDebouncedSetter<T>(value: T, setter: (value: T) => void, delay: number, setFirstValueInstantly: boolean = false) {
    const lastValueAlreadySetRef = useRef<boolean>(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (setFirstValueInstantly && timeoutRef.current === null) {
            setter(value);
            lastValueAlreadySetRef.current = true;
        }
        else if (timeoutRef.current !== null) {
            lastValueAlreadySetRef.current = false;
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        timeoutRef.current = setTimeout(() => {
            if (!setFirstValueInstantly || !lastValueAlreadySetRef.current) {
                setter(value);
                lastValueAlreadySetRef.current = true;
            }
            timeoutRef.current = null;
        }, delay);
    }, [value, setter, delay]);
}