import { createContext, useRef } from 'react'
import { PartialZoomTransform } from '../types/d3/ZoomTransform';

export const ZoomToContext = createContext<{
    zoomToRef: React.RefObject<(newZoomTransform: PartialZoomTransform) => void> | null,
}>({
    zoomToRef: null,
});

export function ZoomToContextProvider(props: {
    children: React.ReactNode,
}) {
    const zoomToRef = useRef<(newZoomTransform: PartialZoomTransform) => void>(() => {});

    return (
        <ZoomToContext.Provider value={{ zoomToRef }}>
            {props.children}
        </ZoomToContext.Provider>
    );
}