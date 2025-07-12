import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import useEventListener from "../../../hooks/useEventListener";
import { Rect } from "../../../types/Rect";
import { Camera, Vector3, WebGLRenderer } from "three";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { isInRect } from "../../../utils/rect";
import { ConceptLatticeLayout } from "../../../types/ConceptLatticeLayout";
import { createPoint, Point } from "../../../types/Point";
import { isRightClick } from "../../../utils/html";
import { CameraType } from "../../../types/CameraType";
import { transformedPoint } from "../../../utils/layout";

export default function NodesMultiselectionBox() {
    const elementRef = useRef<HTMLDivElement>(null);
    const dragStartPointRef = useRef<[number, number]>(null);
    const isSelectingRef = useRef<boolean>(false);
    const gl = useThree((state) => state.gl);
    const camera = useThree((state) => state.camera);
    const [dragSelectionRect, setDragSelectionRect] = useState<Rect | null>(null);

    useEffect(() => {
        if (!elementRef.current) {
            return;
        }

        elementRef.current.style.display = dragSelectionRect === null ? "none" : "block";

        if (dragSelectionRect) {
            elementRef.current.style.left = `${dragSelectionRect.x}px`;
            elementRef.current.style.top = `${dragSelectionRect.y}px`;
            elementRef.current.style.width = `${dragSelectionRect.width}px`;
            elementRef.current.style.height = `${dragSelectionRect.height}px`;
        }
    }, [dragSelectionRect]);

    useEffect(() => {
        // DOM elements cannot be added to the R3F canvas, not even within a portal
        // The simplest solution is to create the selection box element manually
        elementRef.current = createSelectRectElement();
        gl.domElement.parentElement?.appendChild(elementRef.current);
        gl.domElement.parentElement?.addEventListener("pointerdown", onPointerDown);

        function onPointerDown(e: PointerEvent) {
            const diagramStore = useDiagramStore.getState();

            if (!diagramStore.multiselectEnabled || diagramStore.isDraggingNodes || isRightClick(e)) {
                return;
            }

            const point = getPointerPoint(e, gl);
            dragStartPointRef.current = point;
        }

        return () => {
            if (elementRef.current) {
                gl.domElement.parentElement?.removeChild(elementRef.current);
            }
            gl.domElement.parentElement?.removeEventListener("pointerdown", onPointerDown);

            elementRef.current = null;
        };
    }, [gl]);

    useEventListener("pointermove", (e) => {
        if (dragStartPointRef.current) {
            if (useDiagramStore.getState().isDraggingNodes) {
                if (dragStartPointRef.current) {
                    dragStartPointRef.current = null;
                }
                if (dragSelectionRect) {
                    setDragSelectionRect(null);
                }
                isSelectingRef.current = false;

                return;
            }

            isSelectingRef.current = true;
        }

        if (!isSelectingRef.current || !dragStartPointRef.current) {
            return;
        }

        const [offsetX, offsetY] = getPointerPoint(e, gl);
        const rect: Rect = {
            x: Math.min(offsetX, dragStartPointRef.current[0]),
            y: Math.min(offsetY, dragStartPointRef.current[1]),
            width: Math.abs(dragStartPointRef.current[0] - offsetX),
            height: Math.abs(dragStartPointRef.current[1] - offsetY),
        };

        setDragSelectionRect(rect);
    }, undefined);

    useEventListener("pointerup", () => {
        const diagramStore = useDiagramStore.getState();
        const rect = dragSelectionRect;
        dragStartPointRef.current = null;

        if (!isSelectingRef.current || !rect) {
            return;
        }

        if (!diagramStore.editingEnabled || !diagramStore.multiselectEnabled) {
            isSelectingRef.current = false;
            setDragSelectionRect(null);
            return;
        }

        isSelectingRef.current = false;
        setDragSelectionRect(null);

        const clientRect = gl.domElement.parentElement?.getBoundingClientRect();

        if (!diagramStore.layout || !diagramStore.diagramOffsets || !clientRect) {
            return;
        }

        const selectedConceptIndexes = getSelectedConceptIndexes(
            rect,
            diagramStore.layout,
            diagramStore.diagramOffsets,
            diagramStore.layoutToConceptIndexesMapping,
            diagramStore.cameraType,
            camera,
            clientRect);

        diagramStore.setConceptsToMoveIndexes(new Set(selectedConceptIndexes));
    }, undefined);

    return undefined;
}

function getSelectedConceptIndexes(
    dragSelectionRect: Rect,
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    layoutToConceptIndexesMapping: Map<number, number>,
    cameraType: CameraType,
    camera: Camera,
    clientRect: DOMRect,
) {
    const selectedConceptIndexes = new Array<number>();
    const nullOffset = createPoint(0, 0, 0);

    for (let layoutIndex = 0; layoutIndex < layout.length; layoutIndex++) {
        const conceptPoint = layout[layoutIndex];
        const pointOffset = diagramOffsets[layoutIndex];
        const conceptIndex = layoutToConceptIndexesMapping.get(layoutIndex);
        const point = transformedPoint(createPoint(conceptPoint.x, conceptPoint.y, conceptPoint.z), pointOffset, nullOffset, cameraType);

        if (conceptIndex === undefined) {
            continue;
        }

        const vector = new Vector3(point[0], point[1], point[2]);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * clientRect.width;
        const y = (-vector.y * 0.5 + 0.5) * clientRect.height;

        if (isInRect(x, y, dragSelectionRect)) {
            selectedConceptIndexes.push(conceptIndex);
        }
    }

    return selectedConceptIndexes;
}

function getPointerPoint(pointerEvent: PointerEvent, gl: WebGLRenderer): [number, number] {
    const rect = gl.domElement.parentElement?.getBoundingClientRect();
    return [pointerEvent.clientX - (rect?.left || 0), pointerEvent.clientY - (rect?.top || 0)];
}

function createSelectRectElement() {
    const element = document.createElement("div");

    element.className = "absolute bg-primary/5 border border-primary pointer-events-none";
    element.style.left = `0px`;
    element.style.top = `0px`;
    element.style.width = `0px`;
    element.style.height = `0px`;
    element.style.display = `none`;

    return element;
}