import useMediaQuery from "./useMediaQuery";

/**
 * A hook to determine if the viewport width is less than the 'sm' breakpoint (40rem).
 */
export default function useIsMaxSm() {
    return useMediaQuery("(width < 40rem)");
}