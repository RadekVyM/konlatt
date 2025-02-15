import { useEffect, useRef, useState } from "react";
import useDimensions from "../../hooks/useDimensions";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { ConceptLattice } from "../../types/ConceptLattice";
import { FormalConcepts } from "../../types/FormalConcepts";
import useZoom, { ZoomTransform } from "../../hooks/useZoom";

export default function DiagramCanvas(props: {
    className?: string,
    layout: ConceptLatticeLayout,
    lattice: ConceptLattice,
    concepts: FormalConcepts,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoomTransform, setZoomTransform] = useState<ZoomTransform>({ scale: 1, x: 0, y: 0 });
    const dimensions = useDimensions(containerRef);
    const width = dimensions.width * window.devicePixelRatio;
    const height = dimensions.height * window.devicePixelRatio;
    const drawDiagram = useDrawDiagram(props.layout, props.lattice, props.concepts);

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
                width={width}
                height={height} />
        </div>
    );
}

function useDrawDiagram(
    layout: ConceptLatticeLayout,
    lattice: ConceptLattice,
    concepts: FormalConcepts,
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
                context.moveTo(startPoint[0] + centerX, startPoint[1] + centerY);
                context.lineTo(endPoint[0] + centerX, endPoint[1] + centerY);
                context.stroke();
            }
        }
        
        for (const concept of concepts) {
            const point = layout[concept.index];
            context.fillStyle = primaryColor;
            context.beginPath();
            context.arc(point[0] + centerX, point[1] + centerY, 5, 0, 2 * Math.PI);
            context.fill();
        }
    }

    return drawDiagram;
}