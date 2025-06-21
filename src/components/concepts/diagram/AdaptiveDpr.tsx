// based on: https://github.com/pmndrs/drei/blob/master/src/core/AdaptiveDpr.tsx

import { useThree } from "@react-three/fiber"
import { useEffect } from "react"

export function AdaptiveDpr() {
    const gl = useThree((state) => state.gl);
    const active = useThree((state) => state.internal.active);
    const current = useThree((state) => state.performance.current);
    const initialDpr = useThree((state) => state.viewport.initialDpr);
    const setDpr = useThree((state) => state.setDpr);
    // Restore initial pixelratio on unmount
    useEffect(() => {
        return () => {
            if (active) {
                setDpr(initialDpr);
            }
        };
    }, []);
    // Set adaptive pixelratio
    useEffect(() => {
        setDpr(current * initialDpr);
        if (gl.domElement) {
            gl.domElement.style.filter = current === 1 ? "" : `blur(4px)`;
        }
    }, [current]);
    return undefined;
}