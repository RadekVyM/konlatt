import { useEffect, useMemo, useRef, useState } from "react";
import useDimensions from "../../hooks/useDimensions";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { ConceptLattice } from "../../types/ConceptLattice";
import { FormalConcepts } from "../../types/FormalConcepts";
import useZoom from "../../hooks/useZoom";
import { RawFormalContext } from "../../types/RawFormalContext";
import { ZoomTransform } from "../../types/d3/ZoomTransform";
import { createQuadTree, invertEventPoint } from "../../utils/d3";

const LAYOUT_SCALE = 60;

export default function DiagramCanvas(props: {
    className?: string,
    layout: ConceptLatticeLayout,
    lattice: ConceptLattice,
    concepts: FormalConcepts,
    formalContext: RawFormalContext,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoomTransform, setZoomTransform] = useState<ZoomTransform>({ scale: 1, x: 0, y: 0 });
    const dimensions = useDimensions(containerRef);
    const width = dimensions.width * window.devicePixelRatio;
    const height = dimensions.height * window.devicePixelRatio;
    const quadTree = useQuadTree(props.layout);
    const [hoveredIndex, setHoveredIndex] = useState<null | number>(null);
    const drawDiagram = useDrawDiagram(props.layout, props.lattice, props.concepts, props.formalContext, hoveredIndex);

    useZoom(width, height, canvasRef, { min: 0.05, max: 4 }, setZoomTransform);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (!canvas || !context) {
            return;
        }

        context.clearRect(0, 0, width, height);

        const scale = zoomTransform.scale * window.devicePixelRatio;
        const computedStyle = getComputedStyle(canvas);

        context.save();
        context.translate(zoomTransform.x * window.devicePixelRatio, zoomTransform.y * window.devicePixelRatio);
        context.scale(scale, scale);
        drawDiagram(context, width / window.devicePixelRatio, height / window.devicePixelRatio, computedStyle);
        context.restore();
    }, [width, height, zoomTransform, drawDiagram]);

    return (
        <div
            ref={containerRef}
            className={props.className}>
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                onPointerMove={(e) => {
                    const point = invertEventPoint(e, zoomTransform);
                    const node = quadTree.find(toLayoutCoord(point[0], width), toLayoutCoord(point[1], height));
                    setHoveredIndex(node ? node.index : null);
                }}
                width={width}
                height={height} />
        </div>
    );
}

function useQuadTree(layout: ConceptLatticeLayout) {
    return useMemo(() => createQuadTree(layout), [layout]);
}

function useDrawDiagram(
    layout: ConceptLatticeLayout,
    lattice: ConceptLattice,
    concepts: FormalConcepts,
    formalContext: RawFormalContext,
    hoveredIndex: number | null,
) {
    function drawDiagram(context: CanvasRenderingContext2D, width: number, height: number, computedStyle: CSSStyleDeclaration) {
        const primaryColor = computedStyle.getPropertyValue("--primary");
        const outlineColor = computedStyle.getPropertyValue("--outline");
        const centerX = width / 2;
        const centerY = height / 2;

        for (const concept of concepts) {
            const startPoint = layout[concept.index];
            const subconcepts = lattice.subconceptsMapping[concept.index];

            for (const subconceptIndex of subconcepts) {
                const endPoint = layout[subconceptIndex];
                context.strokeStyle = outlineColor;
                context.beginPath();
                context.moveTo((startPoint[0] * LAYOUT_SCALE) + centerX, (startPoint[1] * LAYOUT_SCALE) + centerY);
                context.lineTo((endPoint[0] * LAYOUT_SCALE) + centerX, (endPoint[1] * LAYOUT_SCALE) + centerY);
                context.stroke();
            }
        }

        for (const concept of concepts) {
            const point = layout[concept.index];
            const x = (point[0] * LAYOUT_SCALE) + centerX;
            const y = (point[1] * LAYOUT_SCALE) + centerY;

            context.save();
            context.fillStyle = hoveredIndex === concept.index ? "red" : primaryColor;
            context.beginPath();
            context.arc(x, y, 5, 0, 2 * Math.PI);
            context.fill();
            context.restore();

            const objectLabels = lattice.objectsLabeling.get(concept.index);
            const attributeLabels = lattice.attributesLabeling.get(concept.index);

            context.save();
            context.textAlign = "center";
            context.textBaseline = "hanging";
            context.font = "6px sans-serif";
            if (objectLabels) {
                const label = objectLabels.map((l) => formalContext.objects[l]).join(", ").substring(0, 50);
                
                context.fillText(label, x, y + 7);
            }
            context.restore();
            
            context.save();
            context.textAlign = "center";
            context.font = "6px sans-serif";
            if (attributeLabels) {
                const label = attributeLabels.map((l) => formalContext.attributes[l]).join(", ").substring(0, 50);

                context.fillText(label, x, y - 7);
            }
            context.restore();
        }
    }

    return drawDiagram;
}

function toLayoutCoord(coord: number, size: number) {
    return (coord - ((size/ window.devicePixelRatio) / 2)) / LAYOUT_SCALE;
}