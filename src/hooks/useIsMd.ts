import useMediaQuery from "./useMediaQuery";

/**
 * A hook to determine if the current viewport matches the 'md' breakpoint (48rem).
 */
export default function useIsMd() {
    return useMediaQuery("(width >= 48rem)");
}