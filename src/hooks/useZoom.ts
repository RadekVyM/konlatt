import { RefObject, useEffect, useRef, useState } from "react";
import * as d3Zoom from "d3-zoom";
import * as d3Selection from "d3-selection";
import { ZoomTransform } from "../types/d3/ZoomTransform";
import { ZoomScaleExtent } from "../types/d3/ZoomScaleExtent";

/**
 * Hook that returns an operation for zooming an element content. It is implemented using the D3.js zoom() function.
 * @param dimensions Dimensions of the zoomable area
 * @param elementRef Element that contains zoomable content
 * @param scaleExtent Scale extent of the zoom
 * @param onZoomChange Function that is called on zoom change
 * @returns Operation for zooming an element content
 */
export default function useZoom(
    elementRef: RefObject<Element | null>,
    canMove: boolean = true,
    scaleExtent?: ZoomScaleExtent,
) {
    const zoomRef = useRef<d3Zoom.ZoomBehavior<Element, unknown> | null>(null);
    const [zoomTransform, setZoomTransform] = useState<ZoomTransform>({ scale: 1, x: 0, y: 0 });
    const [isDragZooming, setIsDragZooming] = useState<boolean>(false);

    useEffect(() => {
        if (!elementRef.current) {
            return;
        }

        const element = d3Selection.select(elementRef.current);

        const currentZoom = (zoomRef.current || d3Zoom.zoom<Element, unknown>())
            .scaleExtent([scaleExtent?.min || 1, scaleExtent?.max || 2])
            .on("start", () => setIsDragZooming(true))
            .on("end", () => setIsDragZooming(false))
            .on("zoom", (event) => {
                const transform = event.transform as { k: number, x: number, y: number };
                setZoomTransform({ scale: transform.k, x: transform.x, y: transform.y });
            });

        zoomRef.current = currentZoom;

        const selection = element.call(currentZoom);

        if (!canMove) {
            selection
                .on("mousedown.zoom", null)
                .on("touchstart.zoom", null);
        }
    }, [elementRef, scaleExtent, canMove]);

    function updateExtent(width: number, height: number) {
        zoomRef.current?.extent([[0, 0], [width, height]]);
    }

    function zoomTo(newZoomTransform: ZoomTransform) {
        if (!zoomRef.current || !elementRef.current) {
            return;
        }

        const element = d3Selection.select(elementRef.current);

        const width = elementRef.current.clientWidth;
        const height = elementRef.current.clientHeight;

        const scaleDiff = 1 + (newZoomTransform.scale - zoomTransform.scale);
        const horizontalOffset = width - (width * scaleDiff);
        const verticalOffset = height - (height * scaleDiff);

        element.transition().duration(400).call(
            zoomRef.current.transform,
            d3Zoom.zoomIdentity
                .translate(newZoomTransform.x + horizontalOffset / 2, newZoomTransform.y + verticalOffset / 2)
                .scale(newZoomTransform.scale)
        );
    }

    return {
        zoomTransform,
        isDragZooming,
        zoomTo,
        updateExtent,
    };
}