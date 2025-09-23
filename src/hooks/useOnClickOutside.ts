import useEventListener from "./useEventListener";

export default function useOnClickOutside(
    ref: React.RefObject<HTMLElement | null>,
    handler: (e: PointerEvent) => void,
) {
    useEventListener("pointerdown", (e) => {
        const target = e.target as Node;

        if (!target || !target.isConnected) {
            return;
        }

        if (ref.current && !ref.current.contains(target)) {
            handler(e);
        }
    });
}