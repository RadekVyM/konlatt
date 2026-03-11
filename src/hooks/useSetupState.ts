import { useEffect, useRef, useState } from "react";

/**
 * A hook that manages a state variable and synchronizes it with a 
 * default value specifically when a toggle condition (`flag`) transitions to true.
 * @template T - The type of the state value.
 * @param defaultValue - The initial value or a factory function that returns the initial value.
 * @param flag - A boolean flag; when it turns true, the state is reset to the `defaultValue`.
 * @returns A tuple containing the current state and a setter function, identical to `useState`.
 */
export default function useSetupState<T>(defaultValue: T | (() => T), flag: boolean) {
    const setupRef = useRef<boolean>(false);
    const state = useState<T>(typeof defaultValue === "function" ? (defaultValue as any)() : defaultValue);

    useEffect(() => {
        // Set the current default value only when 'flag' is true
        if (flag && !setupRef.current) {
            setupRef.current = true;
            state[1](typeof defaultValue === "function" ? (defaultValue as any)() : defaultValue);
        }
        else {
            setupRef.current = false;
        }
    }, [flag]);

    return state;
}