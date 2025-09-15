import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Container from "./Container";
import { cn } from "../utils/tailwind";
import { LuCircleAlert, LuX } from "react-icons/lu";
import Button from "./inputs/Button";
import useEventListener from "../hooks/useEventListener";

const TOP_LAYER_CHANGED_EVENT_KEY = "top-layer-changed";
const TOAST_EVENT_KEY = "toast";

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

    useEffect(() => {
        const onTopLayerChanged = () => {
            containerRef.current?.hidePopover();
            containerRef.current?.showPopover();
        };

        onTopLayerChanged();

        window.addEventListener(TOP_LAYER_CHANGED_EVENT_KEY, onTopLayerChanged);

        return () => window.removeEventListener(TOP_LAYER_CHANGED_EVENT_KEY, onTopLayerChanged);
    }, []);

    useEventListener(TOAST_EVENT_KEY, (e) => {
        const newToast: ToastState = {
            id: `${new Date().getTime()}-${Math.random()}`,
            title: e.title,
        };

        setToasts((old) => [...old, newToast]);
    });

    return createPortal(
        <ul
            ref={containerRef}
            popover="manual"
            className="fixed inset-auto right-0 bottom-0 backdrop:hidden bg-transparent pointer-events-none p-6 w-[min(100%,calc(var(--spacing,0.25rem)*80))] flex flex-col gap-2">
            {toasts.map((t) =>
                <Toast
                    key={t.id}
                    title={t.title}
                    onCloseClick={() => setToasts((old) => old.filter((ot) => ot.id !== t.id))} />)}
        </ul>, document.body);
}

function Toast(props: {
    className?: string,
    title: string,
    onCloseClick?: () => void,
}) {
    return (
        <Container
            className={cn("pointer-events-auto drop-shadow-lg drop-shadow-shade pl-3 pr-2 py-2 w-full grid grid-cols-[auto_1fr_auto] gap-2.5 items-center", props.className)}
            as="li">
            <LuCircleAlert
                className="text-on-danger bg-danger rounded-full p-0.5 w-5 h-5" />
            <h2
                className="font-semibold">
                {props.title}
            </h2>

            {props.onCloseClick &&
                <Button
                    className="pointer-events-auto"
                    variant="icon-default"
                    size="sm"
                    onClick={props.onCloseClick}>
                    <LuX />
                </Button>}
        </Container>
    );
}