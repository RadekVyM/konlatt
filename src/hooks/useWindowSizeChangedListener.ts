import { useEffect, useLayoutEffect, useRef } from "react";

type Size = {
    width: number,
    height: number,
}

const DELAY = 100;

/**
 * A hook that listens for changes to the document body's size using `ResizeObserver`.
 * It includes a throttling mechanism to prevent excessive updates during rapid resizing.
 * @param handler - A callback function invoked when the window/body size changes.
 */
export default function useWindowSizeChangedListener(handler: (size: Size) => void) {
    const lastValueAlreadySetRef = useRef<boolean>(false);
    const lastValueRef = useRef<Size>({ width: 0, height: 0 });
    const timeoutRef = useRef<number | null>(null);
    const savedHandler = useRef(handler);

    useLayoutEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                lastValueRef.current = entry.contentRect;
                lastValueAlreadySetRef.current = false;

                if (timeoutRef.current !== null) {
                    return;
                }

                savedHandler.current(entry.contentRect);
                lastValueAlreadySetRef.current = true;

                timeoutRef.current = setTimeout(() => {
                    if (!lastValueAlreadySetRef.current) {
                        savedHandler.current(entry.contentRect);
                    }
                    timeoutRef.current = null;
                }, DELAY);
            });
        });
        resizeObserver.observe(document.body);
        return () => resizeObserver.unobserve(document.body);
    }, []);
}