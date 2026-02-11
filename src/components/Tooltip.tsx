import { useLayoutEffect, useRef, useState } from "react";
import useEventListener from "../hooks/useEventListener";
import { createPortal } from "react-dom";
import { cn } from "../utils/tailwind";

const TOOLTIP_TIMEOUT = 300;

export default function Tooltip(props: {
    tooltip: string,
    shortcutKeys?: string,
    elementRef: React.RefObject<HTMLElement | null>,
}) {
    const timetoutRef = useRef<number | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [canBeShown, setCanBeShown] = useState<boolean>(false);
    const [isShown, setIsShown] = useState<boolean>(false);
    const [position, setPosition] = useState<[number, number]>([0, 0]);

    const isVisible = isShown && (position[0] || position[1]);

    useLayoutEffect(() => {
        if (isVisible) {
            tooltipRef.current?.showPopover();
        }
        else {
            tooltipRef.current?.hidePopover();
        }
    }, [isVisible]);

    useLayoutEffect(() => {
        updatePosition();
    }, [canBeShown, props.tooltip, props.shortcutKeys]);

    useEventListener("pointerenter", () => {
        tryClearTimeout();
        setCanBeShown(true);

        timetoutRef.current = setTimeout(() => {
            setIsShown(true);
        }, TOOLTIP_TIMEOUT);
    }, props.elementRef);

    useEventListener("keyup", (e) => {
        if (e.key === "Tab" && document.activeElement === props.elementRef.current) {
            tryClearTimeout();
            setCanBeShown(true);
            setIsShown(true);
        }
    });

    useEventListener("pointerleave", hide, props.elementRef);
    useEventListener("click", hide, props.elementRef);
    useEventListener("blur", hide, props.elementRef);

    function hide() {
        tryClearTimeout();
        setCanBeShown(false);
        setIsShown(false);
    }

    function updatePosition() {
        if (!props.elementRef.current || !tooltipRef.current) {
            return;
        }

        const elementRect = props.elementRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const halfTooltipWidth = tooltipRect.width / 2;

        const idealLeft = elementRect.left + (elementRect.width / 2);
        const rightDiffX = idealLeft + halfTooltipWidth - window.innerWidth;
        const leftDiffX = idealLeft - halfTooltipWidth;
        const left = leftDiffX < 5 ?
            idealLeft - leftDiffX + 5 :
            rightDiffX > 5 ?
                idealLeft - rightDiffX - 5 :
                idealLeft;
        const idealOffsetY = -tooltipRect.height - 5;
        const offsetY = elementRect.top + idealOffsetY < 5 ?
            elementRect.height + 5 :
            idealOffsetY;

        setPosition([left, elementRect.top + offsetY]);
    }

    function tryClearTimeout() {
        if (timetoutRef.current) {
            clearTimeout(timetoutRef.current);
            timetoutRef.current = null;
        }
    }

    if (!canBeShown) {
        return;
    }

    const dialogs = document.querySelectorAll("dialog");
    const container = dialogs.length === 0 ?
        (document.fullscreenElement || document.body) :
        dialogs[dialogs.length - 1];

    return createPortal(
        <div
            ref={tooltipRef}
            popover="manual"
            className={cn("open:fixed block invisible open:visible z-50 translate-x-[-50%] translate-y-0 select-none pointer-events-none inset-[unset]",
                "text-xs w-max px-1.5 pb-0.5 pt-1 bg-on-surface-container text-surface-container drop-shadow-md shadow-shade rounded-md",
                !isVisible && "invisible",
                isVisible && "animate-fadeIn")}
            aria-hidden
            style={{
                left: position[0],
                top: position[1],
            }}>
            {props.tooltip} {props.shortcutKeys && <span className="text-surface-dim-container rounded px-0.5 ml-1.5">{props.shortcutKeys}</span>}
        </div>, container);
}