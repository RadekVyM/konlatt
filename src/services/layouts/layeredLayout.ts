import { ConceptLattice } from "../../types/ConceptLattice";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { FormalConcepts } from "../../types/FormalConcepts";
import { createPoint, Point } from "../../types/Point";
import { assignNodesToLayersByLongestPath } from "./layers";

export function computeLayeredLayout(formalConcepts: FormalConcepts, lattice: ConceptLattice): ConceptLatticeLayout {
    const { layers, layersMapping } = assignNodesToLayersByLongestPath(formalConcepts, lattice.subconceptsMapping);
    const { layersWithFakes, horizontalCoords, fakeSuperconceptsMapping, fakeSubconceptsMapping } = addFakes(
        formalConcepts.length,
        lattice.subconceptsMapping,
        layers,
        layersMapping);

    let orderedLayers = reduceCrossingsUsingAverage(
        formalConcepts.length,
        layersWithFakes,
        horizontalCoords,
        [lattice.superconceptsMapping],
        [fakeSuperconceptsMapping]);
    orderedLayers = reduceCrossingsUsingAverage(
        formalConcepts.length,
        orderedLayers,
        horizontalCoords,
        [lattice.subconceptsMapping],
        [fakeSubconceptsMapping]);
    orderedLayers = reduceCrossingsUsingAverage(
        formalConcepts.length,
        orderedLayers,
        horizontalCoords,
        [lattice.superconceptsMapping, lattice.subconceptsMapping],
        [fakeSuperconceptsMapping, fakeSubconceptsMapping]);

    return createLayout(formalConcepts.length, orderedLayers);
}

function createLayout(conceptsCount: number, layers: Array<Array<number>>) {
    const layout = new Array<Point>(conceptsCount);
    let top = (layers.length - 1) / -2;

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        let left = (layer.length - 1) / -2;

        for (const node of layer) {
            if (node < conceptsCount) {
                layout[node] = createPoint(left, top, 0);
            }
            left++;
        }

        top++;
    }

    return layout;
}

function reduceCrossingsUsingAverage(
    conceptsCount: number,
    layers: Array<Array<number>>,
    horizontalCoords: Array<number>,
    superconceptsMappings: Array<ReadonlyArray<Set<number>>>,
    fakeSuperconceptsMappings: Array<Map<number, Array<number>>>,
    topToBottom: boolean = true,
) {
    const reducedLayers = new Array<Array<number>>(layers.length);
    const averages = new Array<number>(layers.reduce((prev, curr) => Math.max(curr.length, prev), 0));
    const first = topToBottom ? 0 : layers.length - 1;
    const second = topToBottom ? 1 : layers.length - 2;
    const increase = topToBottom ? 1 : -1;

    reducedLayers[first] = [...layers[first]];
    if (layers.length > 1) {
        reducedLayers[second] = [...layers[second]];
    }

    for (let i = second; i < layers.length && i >= 0; i += increase) {
        const layer = layers[i];

        for (const concept of layer) {
            let sum = 0;
            let count = 0;

            if (concept < conceptsCount) {
                for (const superconceptsMapping of superconceptsMappings) {
                    for (const superconcept of superconceptsMapping[concept].values()) {
                        sum += horizontalCoords[superconcept];
                    }

                    count += superconceptsMapping[concept].size;
                }
            }

            for (const fakeSuperconceptsMapping of fakeSuperconceptsMappings) {
                for (const superconcept of fakeSuperconceptsMapping.get(concept) || []) {
                    sum += horizontalCoords[superconcept];
                }

                count += fakeSuperconceptsMapping.get(concept)?.length || 0;
            }

            averages[concept] = sum / count;
        }

        const reducedLayer = reducedLayers[i] = [...layer];
        const offset = horizontalCoords[layer[0]];
        reducedLayer.sort((a, b) => averages[a] - averages[b]);

        for (let j = 0; j < reducedLayer.length; j++) {
            horizontalCoords[reducedLayer[j]] = j + offset;
        }
    }

    return reducedLayers;
}

function addFakes(
    conceptsCount: number,
    subconceptsMapping: ReadonlyArray<Set<number>>,
    layers: Array<Set<number>>,
    layersMapping: Array<number>
) {
    const fakeSubconceptsMapping = new Map<number, Array<number>>();
    const fakeSuperconceptsMapping = new Map<number, Array<number>>();
    const horizontalCoords = new Array<number>(conceptsCount);
    const layersWithFakes = new Array<Array<number>>(layers.length);
    const max = layers.reduce((prev, curr) => Math.max(curr.size, prev), 0);

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const values = [...layer.values()];
        const offset = (max - values.length) / 2;

        for (let j = 0; j < values.length; j++) {
            const value = values[j];
            horizontalCoords[value] = j + offset;
        }

        layersWithFakes[i] = values;
    }

    addFakesToLayers(
        conceptsCount,
        subconceptsMapping,
        layersMapping,
        horizontalCoords,
        layersWithFakes,
        fakeSubconceptsMapping,
        fakeSuperconceptsMapping);

    // Make the coords precise
    const maxWithFakes = layersWithFakes.reduce((prev, curr) => Math.max(curr.length, prev), 0);
    for (let i = 0; i < layersWithFakes.length; i++) {
        const layer = layers[i];
        const offset = (maxWithFakes - layer.size) / 2;
        let j = 0;

        for (const value of layer) {
            horizontalCoords[value] = j + offset;
            j++;
        }
    }

    return {
        layersWithFakes,
        horizontalCoords,
        fakeSubconceptsMapping,
        fakeSuperconceptsMapping,
    };
}

function addFakesToLayers(
    conceptsCount: number,
    subconceptsMapping: ReadonlyArray<Set<number>>,
    layersMapping: Array<number>,
    horizontalCoords: Array<number>,
    layersWithFakes: Array<Array<number>>,
    fakeSubconceptsMapping: Map<number, Array<number>>,
    fakeSuperconceptsMapping: Map<number, Array<number>>,
) {
    let newFake = conceptsCount;

    for (let from = 0; from < subconceptsMapping.length; from++) {
        const fromLayer = layersMapping[from];

        for (const to of subconceptsMapping[from].values()) {
            const toLayer = layersMapping[to];
            const diff = Math.abs(toLayer - fromLayer);

            if (diff > 1) {
                // add fakes
                let previousSuperconcept = from;

                for (let i = 1; i <= diff - 1; i++) {
                    const ratio = i / (toLayer - fromLayer);
                    const coord = Math.round((ratio * (horizontalCoords[to] - horizontalCoords[from])) + horizontalCoords[from]);
                    const targetLayer = layersWithFakes[fromLayer + i];

                    targetLayer.splice(coord, 0, newFake);
                    horizontalCoords[newFake] = coord;

                    for (let j = coord + 1; j < targetLayer.length; j++) {
                        horizontalCoords[targetLayer[j]]++;
                    }

                    addSubconceptToMapping(fakeSubconceptsMapping, previousSuperconcept, newFake);
                    addSubconceptToMapping(fakeSuperconceptsMapping, newFake, previousSuperconcept);

                    previousSuperconcept = newFake;
                    newFake++;
                }

                addSubconceptToMapping(fakeSubconceptsMapping, previousSuperconcept, to);
                addSubconceptToMapping(fakeSuperconceptsMapping, to, previousSuperconcept);
            }
        }
    }
}

function addSubconceptToMapping(subconceptsMapping: Map<number, number[]>, superconcept: number, subconcept: number) {
    const subconcepts = subconceptsMapping.get(superconcept);
    if (subconcepts) {
        subconcepts.push(subconcept);
    }
    else {
        subconceptsMapping.set(superconcept, [subconcept]);
    }
}