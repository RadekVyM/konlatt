import { LuChevronDown, LuCircleAlert, LuCircleCheck, LuLoaderCircle } from "react-icons/lu";
import useProjectStore from "../../stores/useProjectStore";
import { cn } from "../../utils/tailwind";
import { useEffect, useRef, useState } from "react";
import { StatusItem } from "../../types/StatusItem";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import Button from "../inputs/Button";
import useWindowSizeChangedListener from "../../hooks/useWindowSizeChangedListener";
import useCurrentTime from "../../hooks/useCurrentTime";
import { formatTimeInterval } from "../../utils/numbers";

export default function StatusSection(props: {
    className?: string,
}) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<[number, number]>([0, 0]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const progressMessage = useProjectStore((state) => state.progressMessage);
    const projectName = useProjectStore((state) => state.name);
    const statusItems = useProjectStore((state) => state.statusItems);
    const debouncedProgressMessage = useDebouncedValue(progressMessage, 10);

    useWindowSizeChangedListener(() => {
        updatePosition();
    });

    useEffect(() => updatePosition(), []);

    function showPopover() {
        updatePosition();
        popoverRef.current?.showPopover();
    }

    function hidePopover() {
        popoverRef.current?.hidePopover();
    }

    function togglePopover() {
        if (isOpen) {
            hidePopover();
        }
        else {
            showPopover();
        }
    }

    function updatePosition() {
        if (!buttonRef.current) {
            return;
        }

        const rect = buttonRef.current.getBoundingClientRect();
        setPosition([rect.x + (rect.width / 2), rect.y + rect.height]);
    }

    if (!projectName) {
        return undefined;
    }

    return (
        <div
            className={cn("flex flex-col items-center text-center max-w-80 not-draggable-region", props.className)}
            onKeyUp={(e) => {
                if (e.key === "Tab" && document.activeElement === e.target) {
                    showPopover();
                }
            }}
            onBlur={hidePopover}>
            <Button
                ref={buttonRef}
                className=""
                onClick={togglePopover}>
                <div
                    className="flex flex-col items-center justify-center">
                    <small
                        className="text-sm text-on-surface line-clamp-1">
                        {projectName}
                    </small>
                    {debouncedProgressMessage &&
                        <small
                            className="text-xs text-on-surface-muted flex items-center gap-1.5">
                            <LuLoaderCircle className="animate-spin" />
                            {debouncedProgressMessage}
                        </small>}
                </div>
                <LuChevronDown
                    className={cn("text-on-surface-muted transition-transform", isOpen && "rotate-180 -translate-y-px")} />
            </Button>

            <section
                ref={popoverRef}
                popover="auto"
                onToggle={(e) => setIsOpen(e.newState === "open")}
                style={{
                    left: `${position[0]}px`,
                    top: `calc(${position[1]}px + (var(--spacing) * 1.5))`,
                }}
                className="not-draggable-region in-focus-visible:outline-2
                    bg-surface-container shadow-shade drop-shadow-2xl
                    border border-outline-variant rounded-lg
                    -translate-x-1/2 -translate-y-px w-full max-w-80
                    slide-down-popover-transition">
                <ul
                    className="text-start grid auto-rows-auto grid-flow-row gap-1.5 p-2 overflow-auto thin-scrollbar max-h-64">
                    {statusItems.map((item) =>
                        <StatusListItem
                            key={item.jobId}
                            item={item} />)}
                </ul>
            </section>
        </div>
    );
}

function StatusListItem(props: {
    item: StatusItem,
}) {
    const currentTime = useCurrentTime(!props.item.isDone);

    const time = Math.max(
        0,
        props.item.isDone ?
            props.item.endTime - props.item.startTime :
            currentTime - props.item.startTime);

    const Icon = props.item.isError ?
        LuCircleAlert :
        props.item.isDone ?
            LuCircleCheck :
            LuLoaderCircle;

    return (
        <li
            className="relative overflow-clip grid grid-rows-[auto_auto] grid-cols-[auto_1fr] gap-x-3 px-2 py-1 bg-surface-light-dim-container rounded-lg">
            <Icon
                className={cn("self-center row-start-1 row-end-3 w-5 h-5 text-primary", !props.item.isError && !props.item.isDone && "animate-spin")} />
            <span className="text-sm">{props.item.title}</span>
            <span className="row-start-2 row-end-3 text-xs text-on-surface-muted">
                <span className="w-max">{formatTimeInterval(time)}</span>
                {props.item.time !== undefined &&
                    <> ({props.item.time}ms)</>}
            </span>
            {props.item.showProgress && !props.item.isDone &&
                <span
                    className="row-start-2 row-end-3 justify-self-end text-xs text-on-surface-muted">
                    {props.item.progress.toLocaleString(undefined, { style: "percent" })}
                </span>}

            {props.item.showProgress && !props.item.isDone &&
                <div
                    role="progressbar"
                    aria-valuemax={1}
                    aria-valuenow={props.item.progress}
                    className="absolute left-0 bottom-0 h-[2px] bg-primary rounded-full"
                    style={{
                        right: `${(1 - props.item.progress) * 100}%`
                    }}>
                </div>}
        </li>
    );
}