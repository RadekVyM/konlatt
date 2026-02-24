import { createContext, useRef, useState } from "react";

type ZoomActions = {
    zoomIn: () => void,
    zoomOut: () => void,
    centerView: (scale: number) => void,
}

export const ExportDiagramZoomContext = createContext<{
    actions: React.RefObject<ZoomActions | null>,
    scale: number,
    setScale: (value: number) => void,
}>({
    actions: null!,
    scale: 1,
    setScale: () => {},
});

export function ExportDiagramZoomContextProvider(props: {
    children: React.ReactNode,
}) {
    const actionsRef = useRef<ZoomActions>(null);
    const [scale, setScale] = useState<number>(1);

    return (
        <ExportDiagramZoomContext.Provider value={{
            actions: actionsRef,
            scale,
            setScale,
        }}>
            {props.children}
        </ExportDiagramZoomContext.Provider>
    );
}