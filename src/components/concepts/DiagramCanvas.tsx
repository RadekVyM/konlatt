import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useDimensions from "../../hooks/useDimensions";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { ConceptLattice } from "../../types/ConceptLattice";
import { FormalConcepts } from "../../types/FormalConcepts";
import { RawFormalContext } from "../../types/RawFormalContext";
import { ZoomTransform } from "../../types/d3/ZoomTransform";
import { createQuadTree, invertEventPoint } from "../../utils/d3";

const LAYOUT_SCALE = 60;

export default function DiagramCanvas(props: {
    className?: string,
    ref: React.RefObject<HTMLCanvasElement | null>,
    layout: ConceptLatticeLayout,
    lattice: ConceptLattice,
    concepts: FormalConcepts,
    formalContext: RawFormalContext,
    zoomTransform: ZoomTransform,
    canMoveNodes: boolean,
    selectedConceptIndex: number | null,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
    updateExtent: (width: number, height: number) => void,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useDimensions(containerRef);
    const width = dimensions.width * window.devicePixelRatio;
    const height = dimensions.height * window.devicePixelRatio;
    const [hoveredIndex, setHoveredIndex] = useState<null | number>(null);
    const {
        draggedIndex,
        dragOffset,
        onPointerDown,
        onPointerUp,
        onPointerMove,
        onClick,
    } = useCanvasInteraction(props.layout, props.zoomTransform, width, height, props.canMoveNodes, setHoveredIndex, props.setSelectedConceptIndex);
    const drawDiagram = useDrawDiagram(
        props.layout,
        props.lattice,
        props.concepts,
        props.formalContext,
        hoveredIndex,
        props.selectedConceptIndex,
        draggedIndex,
        dragOffset);

    useEffect(() => {
        const canvas = props.ref.current;
        const context = canvas?.getContext("2d");

        if (!canvas || !context) {
            return;
        }

        context.clearRect(0, 0, width, height);

        const scale = props.zoomTransform.scale * window.devicePixelRatio;
        const computedStyle = getComputedStyle(canvas);

        context.save();
        context.translate(props.zoomTransform.x * window.devicePixelRatio, props.zoomTransform.y * window.devicePixelRatio);
        context.scale(scale, scale);
        drawDiagram(context, width / window.devicePixelRatio, height / window.devicePixelRatio, computedStyle);
        context.restore();
    }, [width, height, props.zoomTransform.scale, props.zoomTransform.x, props.zoomTransform.y, drawDiagram]);

    useEffect(() => {
        props.updateExtent(dimensions.width, dimensions.height);
    }, [dimensions.width, dimensions.height]);

    return (
        <div
            ref={containerRef}
            className={props.className}>
            <canvas
                ref={props.ref}
                className="w-full h-full"
                onPointerUp={onPointerUp}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onClick={onClick}
                width={width}
                height={height} />
        </div>
    );
}

function useQuadTree(layout: ConceptLatticeLayout) {
    return useMemo(() => createQuadTree(layout), [layout]);
}

function useCanvasInteraction(
    layout: ConceptLatticeLayout,
    zoomTransform: ZoomTransform,
    width: number,
    height: number,
    canMoveNodes: boolean,
    setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>,
    setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>,
) {
    const dragStartPointRef = useRef<[number, number]>([0, 0]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
    const quadTree = useQuadTree(layout);

    function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!canMoveNodes) {
            return;
        }
        const node = findNode(e);
        setDraggedIndex(node ? node.index : null);

        dragStartPointRef.current = getPoint(e);
    }

    function onPointerUp() {
        setDraggedIndex(null);
        setDragOffset([0, 0]);
        dragStartPointRef.current = [0, 0];
    }

    function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
        if (draggedIndex !== null) {
            const [offsetX, offsetY] = getPoint(e);
            const start = dragStartPointRef.current;
            setDragOffset([offsetX - start[0], offsetY - start[1]]);
        }
        else {
            const node = findNode(e);
            setHoveredIndex(node ? node.index : null);
        }
    }

    function onClick(e: React.PointerEvent<HTMLCanvasElement>) {
        if (canMoveNodes) {
            return;
        }

        const node = findNode(e);

        if (!node) {
            return;
        }

        setSelectedIndex((old) => old === node?.index ?
            null :
            node ? node.index : null);
    }

    function getPoint(e: React.PointerEvent<HTMLCanvasElement>): [number, number] {
        const point = invertEventPoint(e, zoomTransform);
        return [toLayoutCoord(point[0], width), toLayoutCoord(point[1], height)];
    }

    function findNode(e: React.PointerEvent<HTMLCanvasElement>) {
        const point = getPoint(e);
        return quadTree.find(point[0], point[1], 6 / LAYOUT_SCALE);
    }

    return {
        dragOffset,
        draggedIndex,
        onPointerUp,
        onPointerDown,
        onPointerMove,
        onClick,
    };
}

function useDrawDiagram(
    layout: ConceptLatticeLayout,
    lattice: ConceptLattice,
    concepts: FormalConcepts,
    formalContext: RawFormalContext,
    hoveredIndex: number | null,
    selectedIndex: number | null,
    draggedIndex: number | null,
    dragOffset: [number, number],
) {
    const drawDiagram = useCallback((context: CanvasRenderingContext2D, width: number, height: number, computedStyle: CSSStyleDeclaration) => {
        const onSurfaceColor = computedStyle.getPropertyValue("--on-surface-container");
        const primaryColor = computedStyle.getPropertyValue("--primary");
        const outlineColor = computedStyle.getPropertyValue("--outline");
        const centerX = width / 2;
        const centerY = height / 2;

        for (const concept of concepts) {
            const isStartPointDragged = draggedIndex === concept.index;
            const startPoint = layout[concept.index];
            const subconcepts = lattice.subconceptsMapping[concept.index];

            for (const subconceptIndex of subconcepts) {
                const isEndPointDragged = draggedIndex === subconceptIndex;
                // TODO: endPoint is sometimes undefined when drawing nom10shuttle
                const endPoint = layout[subconceptIndex];
                context.strokeStyle = outlineColor;
                context.beginPath();
                context.moveTo(
                    ((startPoint[0] + (isStartPointDragged ? dragOffset[0] : 0)) * LAYOUT_SCALE) + centerX,
                    ((startPoint[1] + (isStartPointDragged ? dragOffset[1] : 0)) * LAYOUT_SCALE) + centerY);
                context.lineTo(
                    ((endPoint[0] + (isEndPointDragged ? dragOffset[0] : 0)) * LAYOUT_SCALE) + centerX,
                    ((endPoint[1] + (isEndPointDragged ? dragOffset[1] : 0)) * LAYOUT_SCALE) + centerY);
                context.stroke();
            }
        }

        for (const concept of concepts) {
            const isDragged = draggedIndex === concept.index;
            const point = layout[concept.index];
            const x = ((point[0] + (isDragged ? dragOffset[0] : 0)) * LAYOUT_SCALE) + centerX;
            const y = ((point[1] + (isDragged ? dragOffset[1] : 0)) * LAYOUT_SCALE) + centerY;

            context.save();
            context.fillStyle = selectedIndex === concept.index ?
                primaryColor :
                hoveredIndex === concept.index ? primaryColor : onSurfaceColor;
            context.beginPath();
            context.arc(x, y, 5, 0, 2 * Math.PI);
            context.fill();
            context.restore();

            const objectLabels = lattice.objectsLabeling.get(concept.index);
            const attributeLabels = lattice.attributesLabeling.get(concept.index);

            context.save();
            context.textAlign = "center";
            context.textBaseline = "hanging";
            context.font = "6px Gabarito";
            context.fillStyle = onSurfaceColor;
            if (objectLabels) {
                const label = objectLabels.map((l) => formalContext.objects[l]).join(", ").substring(0, 50);
                
                context.fillText(label, x, y + 7);
            }
            context.restore();
            
            context.save();
            context.textAlign = "center";
            context.font = "6px Gabarito";
            context.fillStyle = onSurfaceColor;
            if (attributeLabels) {
                const label = attributeLabels.map((l) => formalContext.attributes[l]).join(", ").substring(0, 50);

                context.fillText(label, x, y - 7);
            }
            context.restore();
        }
    }, [layout, lattice, concepts, formalContext, hoveredIndex, selectedIndex, draggedIndex, dragOffset]);

    return drawDiagram;
}

function toLayoutCoord(coord: number, size: number) {
    return (coord - ((size/ window.devicePixelRatio) / 2)) / LAYOUT_SCALE;
}