import useMediaQuery from "./useMediaQuery";

/**
 * A hook to determine if the current viewport matches the 'xl' breakpoint (80rem).
 */
export default function useIsXl() {
    return useMediaQuery("(width >= 80rem)");
}