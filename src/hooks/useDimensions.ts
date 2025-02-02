import { RefObject, useEffect, useState } from "react";

/**
 * Returns dimensions of an element in the passed reference object. Dimension changes are observed and returned value updated.
 * @param ref Reference to the element
 * @returns Dimensions of an element
 */
export default function useDimensions(ref: RefObject<Element | null>) {
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const observeTarget = ref.current;
        const resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                setDimensions(entry.contentRect);
            });
        });
        resizeObserver.observe(observeTarget);
        return () => resizeObserver.unobserve(observeTarget);
    }, []);

    return dimensions;
}