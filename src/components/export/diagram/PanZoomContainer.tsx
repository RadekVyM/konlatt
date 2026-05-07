import { useContext, useRef } from "react";
import useEventListener from "../../../hooks/useEventListener";
import { cn } from "../../../utils/tailwind";
import useDimensionsListener from "../../../hooks/useDimensionsListener";
import { ExportDiagramZoomContext } from "../../../contexts/ExportDiagramZoomContext";

/**
 * A wrapper component that provides panning and zooming capabilities for its children.
 * Supports pinch-to-zoom, mouse wheel zooming, and click-and-drag panning.
 * Automatically centers content if smaller than the container and clamps panning to content edges.
 */
export default function PanZoomContainer(props: {
    className?: string,
    contentWrapperClassName?: string,
    children?: React.ReactNode,
}) {
    const { actions, setScale } = useContext(ExportDiagramZoomContext);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const transitionTimeout = useRef<number | null>(null);
    const transform = useRef({ x: 0, y: 0, scale: 1 });
    const activePointers = useRef<Map<number, PointerEvent>>(new Map());
    const lastDistance = useRef<number | null>(null);
    const lastPointerPosition = useRef({ x: 0, y: 0 });

    const minScale = 0.05;
    const maxScale = 99.99;

    useDimensionsListener(containerRef, () => update());
    useDimensionsListener(contentRef, () => update());

    useEventListener("wheel", onWheel, containerRef, { passive: false });
    useEventListener("pointerdown", onPointerDown, containerRef);
    useEventListener("pointermove", onPointerMove, containerRef);
    useEventListener("pointerup", onPointerUp, containerRef);
    useEventListener("pointercancel", onPointerUp, containerRef);

    actions.current = {
        centerView,
        zoomIn: () => zoom("in"),
        zoomOut: () => zoom("out"),
    };

    function centerView(scale: number) {
        if (!containerRef.current || !contentRef.current) {
            return;
        }

        const container = containerRef.current.getBoundingClientRect();
        const contentWidth = contentRef.current.offsetWidth;
        const contentHeight = contentRef.current.offsetHeight;

        transform.current = {
            x: (container.width - contentWidth * scale) / 2,
            y: (container.height - contentHeight * scale) / 2,
            scale: scale,
        };

        updateWithTransition();
    }

    function zoom(type: "in" | "out") {
        if (!containerRef.current) {
            return;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const zoomSpeed = 1.2;
        const oldScale = transform.current.scale;

        let newScale = type === "in" ? oldScale * zoomSpeed : oldScale / zoomSpeed;
        newScale = Math.min(Math.max(minScale, newScale), maxScale);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        transform.current.x = transformCoordAfterScaleChange(centerX, transform.current.x, newScale, oldScale);
        transform.current.y = transformCoordAfterScaleChange(centerY, transform.current.y, newScale, oldScale);
        transform.current.scale = newScale;

        updateWithTransition();
    }

    function updateWithTransition() {
        if (!contentRef.current) {
            update();
            return;
        }

        if (transitionTimeout.current !== null) {
            clearTimeout(transitionTimeout.current);
        }

        contentRef.current.style.transition = "transform 0.3s ease-out";
        update();

        transitionTimeout.current = setTimeout(() => {
            if (contentRef.current) {
                contentRef.current.style.transition = "none";
            }
        }, 300);
    }

    function update() {
        setScale(transform.current.scale);
        updateStyle();
    }

    function updateStyle() {
        if (!contentRef.current || !containerRef.current) {
            return;
        }

        const { minX, maxX, minY, maxY } = getBoundaries(transform.current.scale);

        transform.current.x = Math.min(Math.max(transform.current.x, minX), maxX);
        transform.current.y = Math.min(Math.max(transform.current.y, minY), maxY);

        const { x, y, scale } = transform.current;

        requestAnimationFrame(() => {
            if (contentRef.current) {
                contentRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            }
        });
    }

    function getBoundaries(scale: number) {
        if (!containerRef.current || !contentRef.current) {
            return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        // Get the raw dimensions of the content (unscaled)
        const contentWidth = contentRef.current.offsetWidth;
        const contentHeight = contentRef.current.offsetHeight;

        const scaledWidth = contentWidth * scale;
        const scaledHeight = contentHeight * scale;

        let minX, maxX, minY, maxY;

        // Horizontal logic
        if (scaledWidth < containerRect.width) {
            // Content is smaller => force to center
            const centerOffsetX = (containerRect.width - scaledWidth) / 2;
            minX = maxX = centerOffsetX;
        }
        else {
            // Content is larger => allow panning between edges
            minX = containerRect.width - scaledWidth;
            maxX = 0;
        }

        // Vertical logic
        if (scaledHeight < containerRect.height) {
            // Content is smaller => force to center
            const centerOffsetY = (containerRect.height - scaledHeight) / 2;
            minY = maxY = centerOffsetY;
        }
        else {
            // Content is larger => allow panning
            minY = containerRect.height - scaledHeight;
            maxY = 0;
        }

        return { minX, maxX, minY, maxY };
    }

    function onPointerDown(e: PointerEvent) {
        activePointers.current.set(e.pointerId, e);
        lastPointerPosition.current = { x: e.clientX, y: e.clientY };
        // Keep tracking even if pointer leaves container
        containerRef.current?.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
        if (!containerRef.current || !activePointers.current.has(e.pointerId)) {
            return;
        }

        activePointers.current.set(e.pointerId, e);
        const pointers = [...activePointers.current.values()];

        if (pointers.length === 2) {
            // Pinch
            const dist = getDistance(pointers[0], pointers[1]);
            const center = getCenter(pointers[0], pointers[1]);
            const rect = containerRef.current.getBoundingClientRect();

            if (lastDistance.current !== null) {
                const delta = dist / lastDistance.current;
                const oldScale = transform.current.scale;
                const newScale = Math.min(Math.max(minScale, oldScale * delta), maxScale);

                const originX = center.x - rect.left;
                const originY = center.y - rect.top;

                transform.current.x = transformCoordAfterScaleChange(originX, transform.current.x, newScale, oldScale);
                transform.current.y = transformCoordAfterScaleChange(originY, transform.current.y, newScale, oldScale);
                transform.current.scale = newScale;
            }

            lastDistance.current = dist;
            lastPointerPosition.current = { x: center.x, y: center.y };
        }
        else if (pointers.length === 1) {
            // Pan
            const deltaX = e.clientX - lastPointerPosition.current.x;
            const deltaY = e.clientY - lastPointerPosition.current.y;
            transform.current.x += deltaX;
            transform.current.y += deltaY;
            lastPointerPosition.current = { x: e.clientX, y: e.clientY };
        }

        update();
    }

    function onPointerUp(e: PointerEvent) {
        activePointers.current.delete(e.pointerId);

        if (activePointers.current.size < 2) {
            lastDistance.current = null;
        }

        const remaining = Array.from(activePointers.current.values());
        if (remaining.length === 1) {
            lastPointerPosition.current = { x: remaining[0].clientX, y: remaining[0].clientY };
        }
    }

    function onWheel(e: WheelEvent) {
        if (!containerRef.current) {
            return;
        }

        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();

        // Touchpads often trigger e.ctrlKey during pinch gestures
        const isTouchpad = e.ctrlKey;
        const speedMultiplier = isTouchpad ? 0.01 : 0.001;

        const oldScale = transform.current.scale;
        const delta = -e.deltaY * speedMultiplier;
        const newScale = Math.min(Math.max(minScale, oldScale * (1 + delta)), maxScale);

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        transform.current.x = transformCoordAfterScaleChange(mouseX, transform.current.x, newScale, oldScale);
        transform.current.y = transformCoordAfterScaleChange(mouseY, transform.current.y, newScale, oldScale);
        transform.current.scale = newScale;

        update();
    }

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full h-full overflow-hidden select-none transform-[translate3d(0,0,0)] touch-none", props.className)}>
            <div
                ref={contentRef}
                className={cn("w-fit h-fit origin-top-left", props.contentWrapperClassName)}
                style={{
                    // Large zoomed out diagram export previews lead to weird artifacts when hovering controls in Chrome
                    // It is because of this property being set... so it is not set... 
                    // willChange: "transform",
                }}>
                {props.children}
            </div>
        </div>
    );
}

function transformCoordAfterScaleChange(
    origin: number,
    currentCoord: number,
    newScale: number,
    oldScale: number,
) {
    // Some fancy formula that Gemini came up with...
    return origin - (origin - currentCoord) * (newScale / oldScale);
}

function getDistance(first: PointerEvent, second: PointerEvent) {
    return Math.sqrt(
        Math.pow(second.clientX - first.clientX, 2) +
        Math.pow(second.clientY - first.clientY, 2));
}

function getCenter(first: PointerEvent, second: PointerEvent) {
    return { x: (first.clientX + second.clientX) / 2, y: (first.clientY + second.clientY) / 2 };
}