import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import useDiagramStore from "../../../stores/useDiagramStore";

export function AdaptiveDprOnMovement() {
    const gl = useThree((state) => state.gl);
    const active = useThree((state) => state.internal.active);
    const minPerformance = useThree((state) => state.performance.min);
    const initialDpr = useThree((state) => state.viewport.initialDpr);
    const isCameraMoving = useDiagramStore((state) => state.isCameraMoving);
    const movementRegressionEnabled = useDiagramStore((state) => state.movementRegressionEnabled);
    const setDpr = useThree((state) => state.setDpr);

    // Restore initial pixelratio on unmount
    useEffect(() => {
        return () => {
            if (active) {
                setDpr(initialDpr);
            }
        };
    }, []);

    useEffect(() => {
        if (!movementRegressionEnabled) {
            return;
        }

        setDpr(isCameraMoving ? minPerformance * initialDpr : initialDpr);
        if (gl.domElement) {
            gl.domElement.style.filter = isCameraMoving ? `blur(4px)` : "";
        }
    }, [isCameraMoving, movementRegressionEnabled]);

    return undefined;
}