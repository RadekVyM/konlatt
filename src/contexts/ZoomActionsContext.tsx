import { createContext, useRef } from "react";

type ZoomActions = {
    zoomToConcept: (conceptIndex: number) => void,
    zoomBy: (scale: number) => void,
    reset: () => void,
}

export const ZoomActionsContext = createContext<React.RefObject<ZoomActions | null>>(null!);

export function ZoomActionsContextProvider(props: {
    children: React.ReactNode,
}) {
    const zoomToRef = useRef<ZoomActions>(null);

    return (
        <ZoomActionsContext.Provider value={zoomToRef}>
            {props.children}
        </ZoomActionsContext.Provider>
    );
}