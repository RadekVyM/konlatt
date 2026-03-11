import { useLayoutEffect, useState } from "react";

/**
 * A hook that tracks the state of a CSS media query.
 * @param query - The media query string to monitor (e.g., "(max-width: 768px)").
 * @returns A boolean indicating whether the media query currently matches.
 */
export default function useMediaQuery(query: string) {
    const [isMatch, setIsMatch] = useState<boolean>(false);

    useLayoutEffect(() => {
        const matchMedia = window.matchMedia(query);
    
        onChange();
    
        matchMedia.addEventListener("change", onChange);
    
        return () => matchMedia.removeEventListener("change", onChange);

        function onChange() {
            const isMatch = window.matchMedia(query).matches;
            setIsMatch(isMatch);
        }
    }, [query]);

    return isMatch;
}