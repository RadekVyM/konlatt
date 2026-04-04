export type Point = [number, number, number]

export function createPoint(x: number, y: number, z: number): Point {
    return [x, y, z];
}

export function isZero(point: Point) {
    return point.every((c) => c === 0);
}