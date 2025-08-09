import { RefObject, useEffect, useRef } from "react";

export default function useDimensionsListener(ref: RefObject<Element | null>, listener: (rect: DOMRectReadOnly) => void) {
    const listenerRef = useRef<(rect: DOMRectReadOnly) => void>(null);

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