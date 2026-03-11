import { useEffect, useRef } from "react";

/**
 * A hook that debounces a setter function call based on a value change.
 * Useful for limiting the frequency of expensive operations like API calls 
 * or search filtering during rapid user input.
 */
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