import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Container from "./Container";
import { cn } from "../utils/tailwind";
import { LuCircleAlert, LuX } from "react-icons/lu";
import Button from "./inputs/Button";
import useEventListener from "../hooks/useEventListener";
import Loop from "../services/Loop";

const TOP_LAYER_CHANGED_EVENT_KEY = "top-layer-changed";
const TOAST_EVENT_KEY = "toast";

const ANIMATION_LENGTH = 200;
const TOAST_AUTOCLOSE_DELAY = 8000 + ANIMATION_LENGTH;

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface WindowEventMap {
        "top-layer-changed": TopLayerChangedEvent,
        "toast": ToastEvent,
    }
}

class TopLayerChangedEvent extends CustomEvent<unknown> {
    constructor() {
        super(TOP_LAYER_CHANGED_EVENT_KEY);
    }
}

class ToastEvent extends CustomEvent<unknown> {
    title: string;

    constructor(
        title: string,
    ) {
        super(TOAST_EVENT_KEY);

        this.title = title;
    }
}

type ToastState = {
    id: string,
    title: string,
    startTime: number,
}

export default function toast(
    title: string,
) {
    window.dispatchEvent(new ToastEvent(title));
}

export function dispatchTopLayerChanged() {
    window.dispatchEvent(new TopLayerChangedEvent());
}

export function Toasts() {
    const containerRef = useRef<HTMLUListElement>(null);
    const [toasts, setToasts] = useState<Array<ToastState>>([]);
    const [portal, setPortal] = useState<Element>(document.body);

    useEffect(() => {
        const onTopLayerChanged = () => {
            const dialogs = document.querySelectorAll("dialog");
            const portal = dialogs.length === 0 ?
                (document.fullscreenElement || document.body) :
                dialogs[dialogs.length - 1];

            setPortal(portal);

            containerRef.current?.hidePopover();
            setTimeout(() => containerRef.current?.showPopover(), 10);
        };

        onTopLayerChanged();

        window.addEventListener(TOP_LAYER_CHANGED_EVENT_KEY, onTopLayerChanged);

        return () => window.removeEventListener(TOP_LAYER_CHANGED_EVENT_KEY, onTopLayerChanged);
    }, []);

    useEventListener(TOAST_EVENT_KEY, (e) => {
        const newToast: ToastState = {
            id: `${new Date().getTime()}-${Math.random()}`,
            title: e.title,
            startTime: new Date().getTime(),
        };

        setToasts((old) => [...old, newToast]);
    });

    return createPortal(
        <ul
            ref={containerRef}
            popover="manual"
            className="fixed inset-auto right-0 bottom-0 backdrop:hidden bg-transparent pointer-events-none p-6 w-[min(100%,calc(var(--spacing,0.25rem)*80))] flex flex-col gap-2 overflow-hidden">
            {toasts.map((t) =>
                <Toast
                    key={t.id}
                    toast={t}
                    onClose={() => setToasts((old) => old.filter((ot) => ot.id !== t.id))}
                    updateStartTime={(id, newStartTime) => setToasts((old) => {
                        const index = old.findIndex((t) => t.id === id)!;
                        const toast = old[index];
                        const newToasts = [...old];

                        newToasts[index] = {
                            ...toast,
                            startTime: newStartTime,
                        };

                        return newToasts;
                    })} />)}
        </ul>, portal);
}

function Toast(props: {
    className?: string,
    toast: ToastState,
    onClose?: () => void,
    updateStartTime: (id: string, newStartTime: number) => void,
}) {
    const loopRef = useRef<Loop | null>(null);
    const onCloseRef = useRef<() => void>(props.onClose);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [animation, setAnimation] = useState<string>(new Date().getTime() - props.toast.startTime <= ANIMATION_LENGTH ? "animate-slideLeftIn" : "");

    useEffect(() => {
        new Promise((resolve) => setTimeout(resolve, ANIMATION_LENGTH))
            .then(() => setAnimation(""));
    }, []);

    useEffect(() => {
        loopRef.current?.stop();
        loopRef.current?.dispose();
        loopRef.current = new Loop(() => {
            const newTime = new Date().getTime();
            setCurrentTime(newTime);

            if (newTime - props.toast.startTime >= TOAST_AUTOCLOSE_DELAY) {
                onCloseRef.current?.();

                loopRef.current?.stop();
                loopRef.current?.dispose();
                loopRef.current = null;
            }
        });
        loopRef.current.start();

        return () => {
            loopRef.current?.stop();
            loopRef.current?.dispose();
            loopRef.current = null;
        };
    }, [props.toast.startTime]);

    async function onClose() {
        setAnimation("animate-slideRightOut");

        await new Promise((resolve) => setTimeout(resolve, ANIMATION_LENGTH));

        props.onClose?.();
    }

    onCloseRef.current = onClose;

    const timeDiff = currentTime - props.toast.startTime;
    const progress = timeDiff / TOAST_AUTOCLOSE_DELAY;

    return (
        <Container
            className={cn(
                "bg-on-surface-container border-0 text-surface-container pointer-events-auto drop-shadow-lg drop-shadow-shade pl-3 pr-2 py-2 w-full grid grid-cols-[auto_1fr_auto] gap-2.5 items-center relative overflow-clip",
                animation,
                props.className)}
            as="li"
            onPointerEnter={() => loopRef.current?.stop()}
            onPointerLeave={() => {
                props.updateStartTime(props.toast.id, props.toast.startTime + new Date().getTime() - currentTime);
                setCurrentTime(new Date().getTime());
                setTimeout(() => loopRef.current?.start(), 10);
            }}>
            <LuCircleAlert
                className="text-primary rounded-full w-5 h-5" />
            <h2
                className="font-semibold text-sm">
                {props.toast.title}
            </h2>

            {props.onClose &&
                <Button
                    className="pointer-events-auto text-surface-container hover:bg-on-surface-container-muted hover:text-surface-container"
                    variant="icon-default"
                    size="sm"
                    onClick={onClose}>
                    <LuX />
                </Button>}

            <div
                className="absolute left-0 bottom-0 h-[2px] bg-primary rounded-full"
                style={{
                    right: `${progress * 100}%`
                }}>
            </div>
        </Container>
    );
}