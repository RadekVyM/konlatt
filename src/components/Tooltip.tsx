import { useRef, useState } from "react";
import useEventListener from "../hooks/useEventListener";
import { createPortal } from "react-dom";

const TOOLTIP_TIMEOUT = 750;

export default function Tooltip(props: {
    tooltip: string;
    elementRef: React.RefObject<HTMLElement | null>,
}) {
    const timetoutRef = useRef<number | null>(null);
    const [isShown, setIsShown] = useState<boolean>(false);
    const [position, setPosition] = useState<[number, number]>([0, 0]);

    useEventListener("pointerenter", () => {
        tryClearTimeout();
        updatePosition();

        timetoutRef.current = setTimeout(() => {
            setIsShown(true);
        }, TOOLTIP_TIMEOUT);
    }, props.elementRef);

    useEventListener("keyup", (e) => {
        if (e.key === "Tab" && document.activeElement === props.elementRef.current) {
            tryClearTimeout();
            updatePosition();
            setIsShown(true);
        }
    });

    useEventListener("pointerleave", hide, props.elementRef);
    useEventListener("click", hide, props.elementRef);
    useEventListener("blur", hide, props.elementRef);

    function hide() {
        tryClearTimeout();
        setIsShown(false);
    }

    function updatePosition() {
        if (!props.elementRef.current) {
            return;
        }

        const rect = props.elementRef.current.getBoundingClientRect();
        setPosition([rect.left + (rect.width / 2), rect.top]);
    }

    function tryClearTimeout() {
        if (timetoutRef.current) {
            clearTimeout(timetoutRef.current);
            timetoutRef.current = null;
        }
    }

    if (!isShown || (!position[0] && !position[1])) {
        return undefined;
    }

    const dialogs = document.querySelectorAll("dialog");
    const container = dialogs.length === 0 ?
        (document.fullscreenElement || document.body) :
        dialogs[dialogs.length - 1];

    return createPortal(
        <div
            className="fixed z-50 translate-x-[-50%] translate-y-[calc(-100%-5px)] animate-fadeIn select-none pointer-events-none
                text-xs w-max px-1.5 pb-0.5 pt-1 bg-on-surface-container text-surface-container drop-shadow-md shadow-shade rounded-md"
            aria-hidden
            style={{
                left: position[0],
                top: position[1],
            }}>
            {props.tooltip}
        </div>, container);
}