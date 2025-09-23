import { useCallback, useState } from "react";
import useEventListener from "./useEventListener";

export function usePopover(containerRef: React.RefObject<HTMLElement | null>, disabled?: boolean):
    [boolean, () => void, () => void, () => void] {
    const [isOpen, setIsOpen] = useState(false);

    const togglePopover = useCallback(() => setIsOpen((old) => !old), []);
    const closePopover = useCallback(() => setIsOpen(false), []);
    const showPopover = useCallback(() => setIsOpen(true), []);

    useEventListener("keydown", (e) => {
        if (disabled) {
            return;
        }

        if (e.key === "Escape" && isOpen) {
            e.preventDefault();
            e.stopPropagation();
            closePopover();
        }
    }, containerRef, { capture: true });
    // Why setTimeout() is needed: https://stackoverflow.com/a/26304568
    useEventListener("focusout", () => {
        setTimeout(() => {
            if (!containerRef.current?.contains(document.activeElement)) {
                closePopover();
            }
        }, 0);
    }, containerRef);

    return [
        isOpen,
        togglePopover,
        closePopover,
        showPopover,
    ];
}