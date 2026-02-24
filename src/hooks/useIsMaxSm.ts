import useMediaQuery from "./useMediaQuery";

export default function useIsMaxSm() {
    return useMediaQuery("(width < 40rem)");
}