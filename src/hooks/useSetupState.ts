import { useEffect, useRef, useState } from "react";

export default function useSetupState<T>(defaultValue: T | (() => T), isOpen: boolean) {
    const setupRef = useRef<boolean>(false);
    const state = useState<T>(typeof defaultValue === "function" ? (defaultValue as any)() : defaultValue);

    useEffect(() => {
        // Set the current default value only when 'isOpen' is true
        if (isOpen && !setupRef.current) {
            setupRef.current = true;
            state[1](typeof defaultValue === "function" ? (defaultValue as any)() : defaultValue);
        }
        else {
            setupRef.current = false;
        }
    }, [isOpen]);

    return state;
}