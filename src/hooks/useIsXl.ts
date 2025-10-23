import useMediaQuery from "./useMediaQuery";

export default function useIsXl() {
    return useMediaQuery("(width >= 80rem)");
}