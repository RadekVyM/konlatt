import useMediaQuery from "./useMediaQuery";

/**
 * A hook to determine if the viewport width is less than the 'xs' breakpoint (30rem).
 */
export default function useIsMaxXs() {
    return useMediaQuery("(width < 30rem)");
}