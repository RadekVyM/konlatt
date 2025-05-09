import useMediaQuery from "./useMediaQuery";

export default function useHasWindowControlsOverlay() {
    return useMediaQuery("(display-mode: window-controls-overlay)");
}