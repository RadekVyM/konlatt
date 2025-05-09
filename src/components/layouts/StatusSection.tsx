import { LuCircleCheck, LuLoaderCircle } from "react-icons/lu";
import useProjectStore from "../../stores/useProjectStore";
import { cn } from "../../utils/tailwind";
import { useEffect, useRef, useState } from "react";
import { StatusItem } from "../../types/StatusItem";
import useDebouncedValue from "../../hooks/useDebouncedValue";

export default function StatusSection(props: {
    className?: string,
}) {
    const textRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);
    const [popoverShown, setPopoverShown] = useState<boolean>(false);
    const [position, setPosition] = useState<[number, number]>([0, 0]);
    const progressMessage = useProjectStore((state) => state.progressMessage);
    const file = useProjectStore((state) => state.file);
    const statusItems = useProjectStore((state) => state.statusItems);
    const debouncedProgressMessage = useDebouncedValue(progressMessage, 10);

    useEffect(() => {
        if (popoverShown) {
            popoverRef.current?.showPopover();
        }
        else {
            popoverRef.current?.hidePopover();
        }
    }, [popoverShown]);

    function showPopover() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setPopoverShown(true);

        if (!textRef.current) {
            return;
        }

        const rect = textRef.current.getBoundingClientRect();
        setPosition([rect.x + (rect.width / 2), rect.y + rect.height]);
    }

    function hidePopover() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        timeoutRef.current = setTimeout(() => {
            setPopoverShown(false);
        }, 150);
    }

    if (!file) {
        return undefined;
    }

    return (
        <div
            className={cn("flex flex-col items-center text-center max-w-80 not-draggable-region", props.className)}
            onPointerEnter={showPopover}
            onPointerLeave={(e) => window.document.activeElement !== e.currentTarget && hidePopover()}
            onFocus={showPopover}
            onBlur={hidePopover}
            tabIndex={0}>
            <div
                ref={textRef}
                className="flex flex-col items-center"
                aria-hidden={popoverShown}>
                <small
                    className="text-sm text-on-surface line-clamp-1">
                    {file.name}
                </small>
                {debouncedProgressMessage &&
                    <small
                        className="text-xs text-on-surface-muted flex items-center gap-1.5">
                        <LuLoaderCircle className="animate-spin" />
                        {debouncedProgressMessage}
                    </small>}
            </div>

            <section
                ref={popoverRef}
                popover="auto"
                style={{
                    left: `${position[0]}px`,
                    top: `calc(${position[1]}px + (var(--spacing) * 1.5))`,
                }}
                className="not-draggable-region in-focus-visible:outline-2 bg-surface-container drop-shadow-2xl shadow-shade border border-outline-variant -translate-x-1/2 -translate-y-[1px] py-2 rounded-lg w-full max-w-80">
                <ul
                    className="text-start flex flex-col gap-1.5 px-2 overflow-auto thin-scrollbar max-h-64">
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
    const loopRef = useRef<Loop | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);

    useEffect(() => {
        if (loopRef.current) {
            loopRef.current.stop();
            loopRef.current.dispose();
            loopRef.current = null;
        }

        if (!props.item.isDone) {
            loopRef.current = new Loop(() => {
                const newTime = new Date().getTime();
                setCurrentTime(newTime);
            }, 500);
            loopRef.current.start();
        }
    }, [props.item.isDone]);

    const time = Math.max(
        0,
        props.item.isDone ?
            props.item.endTime - props.item.startTime :
            currentTime - props.item.startTime);

    return (
        <li
            className="relative overflow-clip grid grid-rows-[auto_auto] grid-cols-[auto_1fr] gap-x-3 px-2 py-1 bg-surface-light-dim-container rounded-lg">
            {props.item.isDone ?
                <LuCircleCheck
                    className="self-center row-start-1 row-end-3 w-5 h-5 text-primary" /> :
                <LuLoaderCircle
                    className="self-center row-start-1 row-end-3 w-5 h-5 text-primary animate-spin" />}
            <span className="text-sm">{props.item.title}</span>
            <span className="row-start-2 row-end-3 text-xs text-on-surface-muted">
                {time}&nbsp;ms
                {props.item.time !== undefined &&
                    <> ({props.item.time}&nbsp;ms)</>}
            </span>
            {props.item.showProgress && !props.item.isDone &&
                <span
                    className="row-start-2 row-end-3 justify-self-end text-xs text-on-surface-muted">
                    {props.item.progress.toLocaleString(undefined, { style: "percent" })}
                </span>}

            {props.item.showProgress && !props.item.isDone &&
                <div
                    className="absolute left-0 bottom-0 h-[2px] bg-primary rounded-full"
                    style={{
                        right: `${(1 - props.item.progress) * 100}%`
                    }}>
                </div>}
        </li>
    );
}

class Loop {
    action: (() => void) | null;
    isRunning: boolean;
    delay?: number;

    constructor(action: () => void, delay?: number) {
        this.action = action;
        this.isRunning = false;
        this.delay = delay;
    }

    start() {
        this.isRunning = true;
        this.loop().then();
    }

    stop() {
        this.isRunning = false;
    }

    dispose() {
        this.action = null;
    }

    async loop() {
        if (!this.isRunning) {
            return;
        }
        if (this.action) {
            this.action();
        }

        if (this.delay !== undefined) {
            await new Promise((resolve) => setTimeout(resolve, this.delay));
        }

        requestAnimationFrame(async () => await this.loop());
    }
}