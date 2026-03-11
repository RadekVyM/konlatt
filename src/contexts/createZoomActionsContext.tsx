import { createContext, useRef } from "react";

/**
 * Defines the imperative API for controlling zoom behavior 
 * within a specific viewport or canvas.
 */
type ZoomActions = {
    zoomToConcept: (conceptIndex: number) => void,
    zoomBy: (scale: number) => void,
    reset: () => void,
}

/**
 * A factory function that creates a React Context and Provider pair 
 * for managing ZoomActions via a Ref.
 * @example
 * const { ZoomActionsContext, ZoomActionsContextProvider } = createZoomActionsContext();
 */
export default function createZoomActionsContext() {
    const ZoomActionsContext = createContext<React.RefObject<ZoomActions | null>>(null!);

    function ZoomActionsContextProvider(props: {
        children: React.ReactNode,
    }) {
        const zoomToRef = useRef<ZoomActions>(null);

        return (
            <ZoomActionsContext.Provider value={zoomToRef}>
                {props.children}
            </ZoomActionsContext.Provider>
        );
    }

    return { ZoomActionsContext, ZoomActionsContextProvider };
}