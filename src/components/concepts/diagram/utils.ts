import { Color, InstancedMesh, Object3D } from "three";
import { CameraType } from "../../../types/diagram/CameraType";
import { createPoint, Point } from "../../../types/Point";
import { ConceptLatticeLayout } from "../../../types/diagram/ConceptLatticeLayout";
import { Theme } from "../../../types/Theme";
import { transformedPoint } from "../../../utils/layout";

/**
 * Updates the transformation matrices for all instances in an {@link InstancedMesh}.
 * It also computes bounding volumes to ensure raycasting works correctly.
 */
export function setNodesTransformMatrices(
    instancedMesh: InstancedMesh,
    layoutIndexes: Iterable<number>,
    layout: ConceptLatticeLayout,
    diagramOffsets: ReadonlyArray<Point>,
    dragOffset: Point,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    scale: number = 1,
    tempObject?: Object3D,
) {
    const temp = tempObject || new Object3D();

    for (const layoutIndex of layoutIndexes) {
        if (layoutIndex >= layout.length) {
            continue;
        }

        setupNodeTransform(
            temp,
            layout,
            layoutIndex,
            diagramOffsets,
            dragOffset,
            scale,
            cameraType,
            horizontalScale,
            verticalScale,
            rotationDegrees);

        instancedMesh.setMatrixAt(layoutIndex, temp.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;

    // This is super important for raycasting to work
    // after moving some instances
    // See https://github.com/mrdoob/three.js/issues/29349
    // or https://discourse.threejs.org/t/raycast-fails-after-modifying-the-instance-matrices/53791
    instancedMesh.computeBoundingSphere();
    instancedMesh.computeBoundingBox();
}

/**
 * Calculates and sets the transformation for a specific node based on its layout index.
*/
export function setupNodeTransform(
    temp: Object3D,
    layout: ConceptLatticeLayout,
    layoutIndex: number,
    diagramOffsets: ReadonlyArray<Point>,
    dragOffset: Point,
    scale: number,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
) {
    const node = layout[layoutIndex];
    const offset = getPoint(diagramOffsets, layoutIndex);

    setupTransform(temp, createPoint(node.x, node.y, node.z), offset, dragOffset, scale, cameraType, horizontalScale, verticalScale, rotationDegrees);
}

/**
 * Sets the position and scale of an {@link Object3D} based on coordinate transformations.
*/
export function setupTransform(
    temp: Object3D,
    point: Point,
    offset: Point,
    dragOffset: Point,
    scale: number,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
) {
    temp.position.set(...transformedPoint(point, offset, dragOffset, horizontalScale, verticalScale, rotationDegrees, cameraType));
    temp.scale.set(scale, scale, scale);
    temp.updateMatrix();
}

/**
 * Safely retrieves a {@link Point} from an array by index, returning a zero-point if `undefined`.
*/
export function getPoint(points: ReadonlyArray<Point>, index: number): Point {
    return points[index] || [0, 0, 0];
}

/**
 * Selects a color based on the current UI theme.
*/
export function themedColor(light: Color, dark: Color, theme: Theme) {
    if (theme === "dark") {
        return dark;
    }
    return light;
}