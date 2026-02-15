import { createContext, useRef } from "react";

type ZoomActions = {
    zoomToConcept: (conceptIndex: number) => void,
    zoomBy: (scale: number) => void,
    reset: () => void,
}

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