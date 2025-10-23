import useMediaQuery from "./useMediaQuery";

export default function useIsMd() {
    return useMediaQuery("(width >= 48rem)");
}