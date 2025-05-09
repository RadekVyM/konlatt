import { useEffect, useState } from "react";
import { Rect } from "../types/Rect";
import useHasWindowControlsOverlay from "./useHasWindowControlsOverlay";

const DEFAULT_RECT: Rect = { x: 0, y: 0, width: 0, height: 0 };

export default function useWindowControlsOverlayRect() {
    const [rect, setRect] = useState<Rect>(DEFAULT_RECT);
    const hasWindowControlsOverlay = useHasWindowControlsOverlay();

    useEffect(() => {
        if ("windowControlsOverlay" in navigator) {
            (navigator.windowControlsOverlay as any).addEventListener("geometrychange", onGeomentryChange);
            setRect((navigator.windowControlsOverlay as any).getTitlebarAreaRect());
        }

        function onGeomentryChange(e: any) {
            setRect(e.titlebarAreaRect);
        }

        return () => {
            if ("windowControlsOverlay" in navigator) {
                (navigator.windowControlsOverlay as any).removeEventListener("geometrychange", onGeomentryChange);
            }
        };
    }, []);

    return hasWindowControlsOverlay ? rect : DEFAULT_RECT;
}