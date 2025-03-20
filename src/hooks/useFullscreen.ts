import { RefObject, useState } from "react";
import useEventListener from "./useEventListener";
import { FullscreenState } from "../types/FullscreenState";

/**
 * Hook that returns operations controlling whether an element is in fullscreen mode or not.
 * @param element Reference object with an HTML element
 * @returns Operations controlling whether an element is in fullscreen mode or not
 */
export default function useFullscreen(element: RefObject<HTMLElement | null>): FullscreenState {
    const [isFullscreen, setIsFullscreen] = useState(false);
    useEventListener("fullscreenchange", onFullscreenChange, element);

    async function toggleFullscreen() {
        if (isFullscreen) {
            await exitFullscreen();
        }
        else {
            await requestFullscreen();
        }
    }

    async function requestFullscreen() {
        await element.current?.requestFullscreen();
    }

    async function exitFullscreen() {
        await document.exitFullscreen();
    }

    function onFullscreenChange() {
        setIsFullscreen(document.fullscreenElement === element.current);
    }

    return {
        toggleFullscreen,
        requestFullscreen,
        exitFullscreen,
        isFullscreen,
        isFullscreenEnabled: document.fullscreenEnabled
    };
}