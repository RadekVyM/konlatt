import { useCallback, useMemo } from "react";
import { LAYOUT_SCALE, NODE_RADIUS } from "../../../../constants/diagram";
import useDataStructuresStore from "../../../../stores/useDataStructuresStore";
import useDiagramStore from "../../../../stores/useDiagramStore";
import { ConceptLattice } from "../../../../types/ConceptLattice";
import { Rect } from "../../../../types/Rect";
import { crossesRect, isInRect } from "../../../../utils/rect";
import { getConcept2DPoint } from "../../../../utils/layout";

type TargetPoint = [number, number, number, number, number];

export default function useDrawDiagram(
    hoveredIndex: number | null,
    dragSelectedConceptIndexes: Set<number>,
    dragOffset: [number, number],
    width: number,
    height: number,
    visibleRect: Rect,
    scale: number,
) {
    const selectedIndex = useDiagramStore((state) => state.selectedConceptIndex);
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const visibleConceptIndexes = useDiagramStore((state) => state.visibleConceptIndexes);
    const filteredConceptIndexes = useDiagramStore((state) => state.filteredConceptIndexes);
    const displayHighlightedSublatticeOnly = useDiagramStore((state) => state.displayHighlightedSublatticeOnly);
    const conceptToLayoutIndexesMapping = useDiagramStore((state) => state.conceptToLayoutIndexesMapping);
    const lattice = useDataStructuresStore((state) => state.lattice);
    const formalContext = useDataStructuresStore((state) => state.context);
    const deviceScale = scale * window.devicePixelRatio;
    const drawAllLinks = !displayHighlightedSublatticeOnly || !visibleConceptIndexes;

    const targetPoints = useMemo(() => {
        if (!layout || !diagramOffsets) {
            return [];
        }

        const centerX = (width / 2) * deviceScale;
        const centerY = (height / 2) * deviceScale;

        return layout.map((point, index) => {
            const isDragged = dragSelectedConceptIndexes.has(point.conceptIndex);

            return getConcept2DPoint(
                point,
                diagramOffsets[index],
                LAYOUT_SCALE * deviceScale,
                centerX,
                centerY,
                isDragged ? dragOffset[0] : 0,
                isDragged ? dragOffset[1] : 0);
        });
    }, [width, height, layout, diagramOffsets, dragSelectedConceptIndexes, dragOffset, deviceScale]);
    
    // TODO: Figure out if this can be done more readable and still as optimized
    const drawNodes = useCallback((context: CanvasRenderingContext2D, computedStyle: CSSStyleDeclaration) => {
        if (!lattice || !formalContext) {
            return;
        }

        const onSurfaceColor = computedStyle.getPropertyValue("--on-surface-container");
        const primaryColor = computedStyle.getPropertyValue("--primary");
        const mutedColor = computedStyle.getPropertyValue("--on-surface-container-muted");

        const baseNodeRadius = NODE_RADIUS * deviceScale;
        const invisibleNodeRadius = baseNodeRadius / 2;
        const nodeCanvas = createNodeCanvas(baseNodeRadius, onSurfaceColor);
        const invisibleNodeCanvas = createNodeCanvas(invisibleNodeRadius, onSurfaceColor);
        const mutedNodeCanvas = createNodeCanvas(baseNodeRadius * 0.8, mutedColor);
        const mutedInvisibleNodeCanvas = createNodeCanvas(invisibleNodeRadius, mutedColor);

        for (const [x, y, normalX, normalY, conceptIndex] of targetPoints) {
            if (conceptIndex === selectedIndex ||
                conceptIndex === hoveredIndex ||
                isNotDisplayed(displayHighlightedSublatticeOnly, visibleConceptIndexes, conceptIndex) ||
                !isInRect(normalX, normalY, visibleRect)
            ) {
                continue;
            }

            const isInvisible = !visibleConceptIndexes || visibleConceptIndexes.has(conceptIndex);
            const isMuted = filteredConceptIndexes && !filteredConceptIndexes.has(conceptIndex);
            const canvas = isInvisible ?
                isMuted ? mutedNodeCanvas : nodeCanvas :
                isMuted ? mutedInvisibleNodeCanvas : invisibleNodeCanvas; 

            // It should be faster if I round the coordinates here, but the nodes become choppy, which does not look good
            context.drawImage(canvas, x - (canvas.width / 2), y - (canvas.height / 2));
        }

        if (hoveredIndex !== null) {
            const [x, y] = targetPoints[conceptToLayoutIndexesMapping.get(hoveredIndex)!];

            context.beginPath();
            context.fillStyle = primaryColor;
            context.arc(x, y, NODE_RADIUS * deviceScale, 0, 2 * Math.PI);
            context.fill();
        }

        if (selectedIndex !== null &&
            selectedIndex !== hoveredIndex &&
            !isNotDisplayed(displayHighlightedSublatticeOnly, visibleConceptIndexes, selectedIndex)
        ) {
            const [x, y] = targetPoints[conceptToLayoutIndexesMapping.get(selectedIndex)!];

            context.beginPath();
            context.arc(x, y, NODE_RADIUS * deviceScale, 0, 2 * Math.PI);
            context.fillStyle = primaryColor;
            context.fill();
        }

        const fontSize = 6 * deviceScale;

        if (fontSize < 1) {
            return;
        }

        context.font = `${fontSize}px Gabarito`;
        context.fillStyle = onSurfaceColor;

        for (const [x, y, normalX, normalY, conceptIndex] of targetPoints) {
            if (isNotDisplayed(displayHighlightedSublatticeOnly, visibleConceptIndexes, conceptIndex) ||
                !isInRect(normalX, normalY, visibleRect)
            ) {
                continue;
            }

            const objectLabels = lattice.objectsLabeling.get(conceptIndex);
            const attributeLabels = lattice.attributesLabeling.get(conceptIndex);

            if (objectLabels) {
                context.textAlign = "center";
                context.textBaseline = "hanging";
                const label = objectLabels.map((l) => formalContext.objects[l]).join(", ").substring(0, 50);

                context.fillText(label, x, y + 7 * deviceScale);
            }

            if (attributeLabels) {
                context.textAlign = "center";
                context.textBaseline = "alphabetic";
                const label = attributeLabels.map((l) => formalContext.attributes[l]).join(", ").substring(0, 50);

                context.fillText(label, x, y - 7 * deviceScale);
            }
        }
    }, [lattice, formalContext, hoveredIndex, selectedIndex, targetPoints, visibleRect, deviceScale, visibleConceptIndexes, filteredConceptIndexes, displayHighlightedSublatticeOnly]);

    const drawLinks = useCallback((context: CanvasRenderingContext2D, computedStyle: CSSStyleDeclaration) => {
        if (!lattice || !drawAllLinks) {
            return;
        }

        const outlineColor = computedStyle.getPropertyValue("--outline");

        drawLinksImpl(
            outlineColor,
            deviceScale,
            visibleRect,
            context,
            lattice,
            targetPoints,
            conceptToLayoutIndexesMapping);
    }, [lattice?.subconceptsMapping, targetPoints, visibleRect, deviceScale, drawAllLinks, conceptToLayoutIndexesMapping]);

    const drawHighlightedLinks = useCallback((context: CanvasRenderingContext2D, computedStyle: CSSStyleDeclaration) => {
        if (!lattice) {
            return;
        }

        const outlineColor = displayHighlightedSublatticeOnly ?
            computedStyle.getPropertyValue("--outline") :
            computedStyle.getPropertyValue("--on-surface-container");

        drawLinksImpl(
            outlineColor,
            deviceScale,
            visibleRect,
            context,
            lattice,
            targetPoints,
            conceptToLayoutIndexesMapping,
            (conceptIndex) => isNotDisplayed(displayHighlightedSublatticeOnly, visibleConceptIndexes, conceptIndex) ||
                !!(visibleConceptIndexes && !visibleConceptIndexes.has(conceptIndex)));
    }, [lattice?.subconceptsMapping, targetPoints, visibleRect, deviceScale, visibleConceptIndexes, displayHighlightedSublatticeOnly, conceptToLayoutIndexesMapping]);

    return {
        drawNodes,
        drawLinks,
        drawHighlightedLinks,
    };
}

function drawLinksImpl(
    outlineColor: string,
    deviceScale: number,
    visibleRect: Rect,
    context: CanvasRenderingContext2D,
    lattice: ConceptLattice,
    targetPoints: Array<TargetPoint>,
    conceptToLayoutIndexesMapping: Map<number, number>,
    predicate?: (conceptIndex: number) => boolean,
) {
    context.strokeStyle = outlineColor;
    context.lineWidth = 1 * deviceScale;

    // It looks like a little batching of the lines to a single path is helpful only when zoomed out
    // However, it is much worse when zoomed in
    // I have no clue why...
    const linesCountInBatch = 1;
    let linesCount = 0;
    context.beginPath();

    for (const [startX, startY, normalStartX, normalStartY, conceptIndex] of targetPoints) {
        if (predicate && predicate(conceptIndex)) {
            continue;
        }

        const subconcepts = lattice.subconceptsMapping[conceptIndex];

        for (const subconceptIndex of subconcepts) {
            if (predicate && predicate(subconceptIndex)) {
                continue;
            }

            const [endX, endY, normalEndX, normalEndY] = targetPoints[conceptToLayoutIndexesMapping.get(subconceptIndex)!];

            //if (!isInRect(normalStartX, normalStartY, visibleRect) && !isInRect(normalEndX, normalEndY, visibleRect)) {
            if (!crossesRect(normalStartX, normalStartY, normalEndX, normalEndY, visibleRect)) {
                continue;
            }

            // It looks like a little batching is helpful
            if (linesCount !== 0 && linesCount % linesCountInBatch === 0) {
                context.stroke();
                context.beginPath();
            }

            context.moveTo(startX, startY);
            context.lineTo(endX, endY);

            linesCount++;
        }
    }

    context.stroke();
}

function isNotDisplayed(displayHighlightedSublatticeOnly: boolean, visibleConceptIndexes: Set<number> | null, conceptIndex: number) {
    return displayHighlightedSublatticeOnly && visibleConceptIndexes && !visibleConceptIndexes.has(conceptIndex);
}

function createNodeCanvas(
    radius: number,
    fillStyle: string | CanvasGradient | CanvasPattern
) {
    const baseNodeRadius = radius;
    const baseNodeSize = baseNodeRadius * 2.5;
    const nodeCanvas = document.createElement("canvas");
    nodeCanvas.width = nodeCanvas.height = Math.ceil(baseNodeSize);
    const nodeCanvasContext = nodeCanvas.getContext("2d")!;

    nodeCanvasContext.fillStyle = fillStyle;
    nodeCanvasContext.beginPath();
    nodeCanvasContext.moveTo(nodeCanvas.width / 2, nodeCanvas.height / 2);
    nodeCanvasContext.arc(nodeCanvas.width / 2, nodeCanvas.height / 2, baseNodeRadius, 0, 2 * Math.PI);
    nodeCanvasContext.fill();

    return nodeCanvas;
}