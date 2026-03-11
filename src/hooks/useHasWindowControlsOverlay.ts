import useMediaQuery from "./useMediaQuery";

/**
 * A hook to determine if the 'window-controls-overlay' display mode is active.
 * This is primarily used in Progressive Web Apps (PWAs) to check if the title bar 
 * area is available for custom content.
 */
export default function useHasWindowControlsOverlay() {
    return useMediaQuery("(display-mode: window-controls-overlay)");
}