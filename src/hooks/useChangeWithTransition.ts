import { useEffect, useState } from "react";
import { callWithTransition } from "../utils/transitions";

export default function useChangeWithTransition<T>(callback: () => T, deps?: React.DependencyList) {
    const [value, setValue] = useState<T | null>(null);
    
    useEffect(() => {
        callWithTransition(() => setValue(callback()));
    }, deps);

    return value;
}