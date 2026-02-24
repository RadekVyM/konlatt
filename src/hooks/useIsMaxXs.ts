import useMediaQuery from "./useMediaQuery";

export default function useIsMaxXs() {
    return useMediaQuery("(width < 30rem)");
}