import digits from "../../datasets/digits.cxt?raw";
import nom10crx from "../../datasets/nom10crx.cxt?raw";
import nom10shuttle from "../../datasets/nom10shuttle.cxt?raw";
import nom5shuttle from "../../datasets/nom5shuttle.cxt?raw";
import lattice from "../../datasets/lattice.cxt?raw";
import liveinwater from "../../datasets/liveinwater.cxt?raw";
import tealady from "../../datasets/tealady.cxt?raw";
import mushroomep from "../../datasets/mushroomep.cxt?raw";

export type TestValue = {
    readonly title: string,
    readonly fileContent: string,
    readonly contextCellsPerObject: number,
    readonly objectsCount: number,
    readonly attributesCount: number,
    readonly conceptsCount: number,
    readonly coverRelationSize: number,
    readonly byLongestPathLayersCounts: Array<number>,
}

export const DIGITS: TestValue = {
    title: "digits",
    fileContent: digits,
    contextCellsPerObject: 1,
    objectsCount: 10,
    attributesCount: 7,
    conceptsCount: 48,
    coverRelationSize: 120,
    byLongestPathLayersCounts: [
        1,
        5,
        11,
        13,
        11,
        6,
        1,
    ],
};
export const LATTICE: TestValue = {
    title: "lattice",
    fileContent: lattice,
    contextCellsPerObject: 1,
    objectsCount: 14,
    attributesCount: 16,
    conceptsCount: 24,
    coverRelationSize: 39,
    byLongestPathLayersCounts: [
        1,
        3,
        5,
        5,
        3,
        3,
        2,
        1,
        1,
    ],
};
export const LIVEINWATER: TestValue = {
    title: "liveinwater",
    fileContent: liveinwater,
    contextCellsPerObject: 1,
    objectsCount: 8,
    attributesCount: 9,
    conceptsCount: 19,
    coverRelationSize: 32,
    byLongestPathLayersCounts: [
        1,
        4,
        5,
        5,
        3,
        1,
    ],
};
export const TEALADY: TestValue = {
    title: "tealady",
    fileContent: tealady,
    contextCellsPerObject: 1,
    objectsCount: 18,
    attributesCount: 14,
    conceptsCount: 65,
    coverRelationSize: 148,
    byLongestPathLayersCounts: [
        1,
        7,
        14,
        14,
        9,
        7,
        8,
        4,
        1,
    ],
};
export const NOM10CRX: TestValue = {
    title: "nom10crx",
    fileContent: nom10crx,
    contextCellsPerObject: 2,
    objectsCount: 653,
    attributesCount: 85,
    conceptsCount: 51078,
    coverRelationSize: -1,
    byLongestPathLayersCounts: [],
};
export const NOM10SHUTTLE: TestValue = {
    title: "nom10shuttle",
    fileContent: nom10shuttle,
    contextCellsPerObject: 2,
    objectsCount: 43500,
    attributesCount: 97,
    conceptsCount: 2931,
    coverRelationSize: -1,
    byLongestPathLayersCounts: [],
};
export const NOM5SHUTTLE: TestValue = {
    title: "nom5shuttle",
    fileContent: nom5shuttle,
    contextCellsPerObject: 1,
    objectsCount: 43500,
    attributesCount: 52,
    conceptsCount: 1461,
    coverRelationSize: 5396,
    byLongestPathLayersCounts: [
        1,
        15,
        64,
        137,
        198,
        235,
        244,
        230,
        161,
        94,
        81,
        1,
    ],
};
export const MUSHROOMEP: TestValue = {
    title: "mushroomep",
    fileContent: mushroomep,
    contextCellsPerObject: 2,
    objectsCount: 8124,
    attributesCount: 126,
    conceptsCount: 233116,
    coverRelationSize: -1,
    byLongestPathLayersCounts: [],
};