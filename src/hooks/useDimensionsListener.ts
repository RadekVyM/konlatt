import { RefObject, useEffect, useRef } from "react";

/**
 * A React hook that listens for size changes of a DOM element using `ResizeObserver`.
 * @param ref - A React RefObject pointing to the element to observe.
 * @param listener - A callback function triggered whenever the element's dimensions change.
 */
export default function useDimensionsListener(ref: RefObject<Element | null>, listener: (rect: DOMRectReadOnly) => void) {
    const listenerRef = useRef<(rect: DOMRectReadOnly) => void>(null);

    // Keep the listener ref updated to avoid stale closures 
    // without re-running the effect on every render.
    listenerRef.current = listener;

    useEffect(() => {
        const observeTarget = ref.current;
        
        if (!observeTarget) {
            return;
        }

        const resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                listenerRef.current?.(entry.contentRect);
            });
        });
        resizeObserver.observe(observeTarget);
        return () => resizeObserver.unobserve(observeTarget);
    }, [ref]);
}