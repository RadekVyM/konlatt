import { useCallback, useMemo } from "react";
import { Rect } from "../../../../types/Rect";
import { LAYOUT_SCALE, NODE_RADIUS_INTERACTION } from "../../../../constants/diagram";
import useDiagramStore from "../../../../stores/useDiagramStore";
import { getConcept2DPoint } from "../../../../utils/layout";

export default function useDrawEditInteraction(
    dragSelectionRect: Rect | null,
    draggedConceptIndexes: Set<number>,
    draggedConceptsRect: Rect | null,
    dragOffset: [number, number],
    width: number,
    height: number,
    translateX: number,
    translateY: number,
    scale: number,
) {
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const conceptToLayoutIndexesMapping = useDiagramStore((state) => state.conceptToLayoutIndexesMapping);
    const deviceScale = scale * window.devicePixelRatio;

    const targetPoints = useMemo(() => {
        if (!layout || !diagramOffsets) {
            return [];
        }

        const centerX = (width / 2) * deviceScale;
        const centerY = (height / 2) * deviceScale;

        const points = new Array<[number, number, number, number, number]>();

        for (const conceptIndex of draggedConceptIndexes) {
            const index = conceptToLayoutIndexesMapping.get(conceptIndex)!;
            const finalPoint = getConcept2DPoint(
                layout[index],
                diagramOffsets[index],
                LAYOUT_SCALE * deviceScale,
                centerX,
                centerY,
                dragOffset[0],
                dragOffset[1]);

            points.push(finalPoint);
        }

        return points;
    }, [width, height, layout, conceptToLayoutIndexesMapping, diagramOffsets, draggedConceptIndexes, dragOffset, deviceScale]);
    
    const drawEditInteraction = useCallback((
        context: CanvasRenderingContext2D,
        computedStyle: CSSStyleDeclaration,
    ) => {
        const centerX = (width / 2) * deviceScale;
        const centerY = (height / 2) * deviceScale;
        const layoutScale = LAYOUT_SCALE * deviceScale;
        const baseNodeRadius = NODE_RADIUS_INTERACTION * deviceScale;
        const primaryColor = computedStyle.getPropertyValue("--primary");

        context.strokeStyle = primaryColor;
        context.lineWidth = 1.5;
        context.lineCap = "round";

        if (draggedConceptsRect) {
            const x = ((draggedConceptsRect.x + dragOffset[0]) * layoutScale) + centerX;
            const y = ((draggedConceptsRect.y + dragOffset[1]) * layoutScale) + centerY;
            const width = draggedConceptsRect.width * layoutScale;
            const height = draggedConceptsRect.height * layoutScale;

            context.beginPath();
            context.roundRect(x, y, width, height, baseNodeRadius);

            context.save();
            context.fillStyle = primaryColor;
            context.globalAlpha = 0.03;
            context.fill();
            context.restore();

            context.save();
            context.setLineDash([8 * deviceScale, 8 * deviceScale]);
            context.stroke();
            context.restore();
        }

        for (const [x, y] of targetPoints) {
            context.beginPath();
            context.arc(x, y, baseNodeRadius, 0, 2 * Math.PI);
            context.stroke();
        }

        if (dragSelectionRect) {
            const x = (dragSelectionRect.x * layoutScale) + centerX;
            const y = (dragSelectionRect.y * layoutScale) + centerY;
            const width = dragSelectionRect.width * layoutScale;
            const height = dragSelectionRect.height * layoutScale;
            const radius = 2 * window.devicePixelRatio;

            context.beginPath();
            context.roundRect(x, y, width, height, radius);

            context.save();
            context.fillStyle = primaryColor;
            context.globalAlpha = 0.1;
            context.fill();
            context.restore();

            context.stroke();
        }
    }, [width, height, translateX, translateY, scale, dragSelectionRect, draggedConceptIndexes, draggedConceptsRect, dragOffset, targetPoints]);

    return drawEditInteraction;
}