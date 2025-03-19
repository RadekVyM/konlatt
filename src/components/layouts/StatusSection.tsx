import { LuCircleCheck, LuLoaderCircle } from "react-icons/lu";
import useProjectStore from "../../hooks/stores/useProjectStore";
import { cn } from "../../utils/tailwind";
import { useEffect, useRef, useState } from "react";
import { StatusItem } from "../../types/StatusItem";
import useDebouncedValue from "../../hooks/useDebouncedValue";

export default function StatusSection(props: {
    className?: string,
}) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [popoverShown, setPopoverShown] = useState<boolean>(false);
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

    return (
        <div
            className={cn("flex flex-col items-center text-center max-w-80", props.className)}
            onPointerEnter={() => setPopoverShown(true)}
            onPointerLeave={(e) => window.document.activeElement !== e.currentTarget && setPopoverShown(false)}
            onFocus={() => setPopoverShown(true)}
            onBlur={() => setPopoverShown(false)}
            tabIndex={0}>
            <div
                aria-hidden={popoverShown}>
                {file &&
                    <small
                        className="text-sm text-on-surface line-clamp-1">
                        {file.name}
                    </small>}
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
                className="in-focus-visible:outline-2 bg-surface-container drop-shadow-2xl shadow-shade border border-outline-variant left-[50%] -translate-x-1/2 -translate-y-[1px] py-2 mt-1.5 rounded-lg w-full max-w-80">
                {file &&
                    <span
                        className="text-sm text-on-surface px-2">
                        {file.name}
                    </span>}
                <ul
                    className="text-start flex flex-col gap-1.5 mt-3 px-2 overflow-auto thin-scrollbar max-h-64">
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
                setCurrentTime((old) => newTime - old >= 150 ? newTime : old);
            });
            loopRef.current.start();
        }
    }, [props.item.isDone]);

    const time = props.item.isDone ?
        props.item.endTime - props.item.startTime :
        currentTime - props.item.startTime;

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

    constructor(action: () => void) {
        this.action = action;
        this.isRunning = false
    }

    start() {
        this.isRunning = true;
        this.loop();
    }

    stop() {
        this.isRunning = false;
    }

    dispose() {
        this.action = null;
    }

    loop() {
        if (!this.isRunning) {
            return;
        }
        if (this.action) {
            this.action();
        }
        requestAnimationFrame(() => this.loop());
    }
}