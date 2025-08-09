import { RefObject, useState } from "react";
import useDimensionsListener from "./useDimensionsListener";

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

    useDimensionsListener(ref, setDimensions);

    return dimensions;
}