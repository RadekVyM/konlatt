import { RefObject, useEffect, useRef } from "react";
import * as d3Zoom from "d3-zoom";
import * as d3Selection from "d3-selection";

export type ZoomTransform = { scale: number, x: number, y: number }

export type ZoomScaleExtent = { min?: number, max?: number }

export type OnZoomChangeCallback = (param: ZoomTransform) => void

/**
 * Hook that returns an operation for zooming an element content. It is implemented using the D3.js zoom() function.
 * @param dimensions Dimensions of the zoomable area
 * @param elementRef Element that contains zoomable content
 * @param scaleExtent Scale extent of the zoom
 * @param onZoomChange Function that is called on zoom change
 * @returns Operation for zooming an element content
 */
export default function useZoom(
    width: number,
    height: number,
    elementRef: RefObject<Element | null>,
    scaleExtent?: ZoomScaleExtent,
    onZoomChange?: OnZoomChangeCallback
) {
    const zoomRef = useRef<d3Zoom.ZoomBehavior<Element, unknown> | null>(null);

    useEffect(() => {
        if (!elementRef.current || !onZoomChange) {
            return;
        }

        const element = d3Selection.select(elementRef.current);

        const currentZoom = (zoomRef.current || d3Zoom.zoom<Element, unknown>())
            .extent([[0, 0], [width, height]])
            .scaleExtent([scaleExtent?.min || 1, scaleExtent?.max || 2])
            .on("zoom", (event) => {
                const transform = event.transform as { k: number, x: number, y: number };

                if (onZoomChange) {
                    onZoomChange({ scale: transform.k, x: transform.x, y: transform.y });
                }
            });

        zoomRef.current = currentZoom;

        element.call(currentZoom);
    }, [width, height, elementRef, scaleExtent]);

    function zoomTo(zoomTransform: ZoomTransform) {
        if (!zoomRef.current || !elementRef.current) {
            return;
        }

        const element = d3Selection.select(elementRef.current);

        const width = elementRef.current.clientWidth / 2;
        const height = elementRef.current.clientHeight / 2;

        element.transition().duration(750).call(
            zoomRef.current.transform,
            d3Zoom.zoomIdentity
                .translate(zoomTransform.x + width - (width * zoomTransform.scale), zoomTransform.y + height - (height * zoomTransform.scale))
                .scale(zoomTransform.scale)
        );
    }

    return {
        zoomTo
    };
}