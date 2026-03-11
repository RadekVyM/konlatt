import useEventListener from "./useEventListener";

/**
 * A hook that triggers a callback when a pointer down event occurs outside of a specific element.
 * @param ref - The React ref of the element to monitor.
 * @param handler - The callback function to execute when an outside click/tap is detected.
 */
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