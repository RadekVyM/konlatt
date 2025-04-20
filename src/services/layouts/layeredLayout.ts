import { ConceptLattice } from "../../types/ConceptLattice";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { FormalConcepts, getSupremum } from "../../types/FormalConcepts";
import { createPoint, Point } from "../../types/Point";
import { assignNodesToLayersByLongestPath } from "../layers";
import Module from "../../wasm/cpp";
import { cppFloatArrayToLayout } from "../../utils/cpp";

export async function computeLayeredLayout(
    conceptsCount: number,
    supremum: number,
    subconceptsMappingArrayBuffer: Int32Array,
): Promise<{
    layout: ConceptLatticeLayout,
    computationTime: number,
}> {
    const module = await Module();
    // TODO: use iterators when available: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/flatMap
    const result = module.computeLayeredLayout(supremum, conceptsCount, subconceptsMappingArrayBuffer);

    return {
        layout: cppFloatArrayToLayout(result.value, conceptsCount, true),
        computationTime: result.time,
    };
}

export function computeLayeredLayoutJs(formalConcepts: FormalConcepts, lattice: ConceptLattice): {
    layout: ConceptLatticeLayout,
    computationTime: number,
} {
    const startTime = new Date().getTime();

    const { layers, layersMapping } = assignNodesToLayersByLongestPath(getSupremum(formalConcepts), lattice.subconceptsMapping);
    const { layersWithDummies, horizontalCoords, dummySuperconceptsMapping, dummySubconceptsMapping } = addDummies(
        formalConcepts.length,
        lattice.subconceptsMapping,
        layers,
        layersMapping);
        
    let orderedLayers = reduceCrossingsUsingAverage(
        formalConcepts.length,
        layersWithDummies,
        horizontalCoords,
        [lattice.superconceptsMapping],
        [dummySuperconceptsMapping]);
    orderedLayers = reduceCrossingsUsingAverage(
        formalConcepts.length,
        orderedLayers,
        horizontalCoords,
        [lattice.subconceptsMapping],
        [dummySubconceptsMapping],
        false);
    orderedLayers = reduceCrossingsUsingAverage(
        formalConcepts.length,
        orderedLayers,
        horizontalCoords,
        [lattice.superconceptsMapping, lattice.subconceptsMapping],
        [dummySuperconceptsMapping, dummySubconceptsMapping]);

    return {
        layout: createLayout(formalConcepts.length, orderedLayers),
        computationTime: new Date().getTime() - startTime,
    };
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
    dummySuperconceptsMappings: Array<Map<number, Array<number>>>,
    topToBottom: boolean = true,
) {
    const reducedLayers = new Array<Array<number>>(layers.length);
    const averages = new Array<number>(horizontalCoords.length);
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

            for (const dummySuperconceptsMapping of dummySuperconceptsMappings) {
                for (const superconcept of dummySuperconceptsMapping.get(concept) || []) {
                    sum += horizontalCoords[superconcept];
                }

                count += dummySuperconceptsMapping.get(concept)?.length || 0;
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

function addDummies(
    conceptsCount: number,
    subconceptsMapping: ReadonlyArray<Set<number>>,
    layers: Array<Set<number>>,
    layersMapping: Array<number>
) {
    const dummySubconceptsMapping = new Map<number, Array<number>>();
    const dummySuperconceptsMapping = new Map<number, Array<number>>();
    const horizontalCoords = new Array<number>(conceptsCount);
    const layersWithDummies = new Array<Array<number>>(layers.length);
    const max = layers.reduce((prev, curr) => Math.max(curr.size, prev), 0);

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const values = [...layer.values()];
        const offset = (max - values.length) / 2;

        for (let j = 0; j < values.length; j++) {
            const value = values[j];
            horizontalCoords[value] = j + offset;
        }

        layersWithDummies[i] = values;
    }

    addDummiesToLayers(
        conceptsCount,
        subconceptsMapping,
        layersMapping,
        horizontalCoords,
        layersWithDummies,
        dummySubconceptsMapping,
        dummySuperconceptsMapping);

    // Make the coords precise
    const maxWithDummies = layersWithDummies.reduce((prev, curr) => Math.max(curr.length, prev), 0);
    for (let i = 0; i < layersWithDummies.length; i++) {
        const layer = layers[i];
        const offset = (maxWithDummies - layer.size) / 2;
        let j = 0;

        for (const value of layer) {
            horizontalCoords[value] = j + offset;
            j++;
        }
    }

    return {
        layersWithDummies: layersWithDummies,
        horizontalCoords,
        dummySubconceptsMapping: dummySubconceptsMapping,
        dummySuperconceptsMapping: dummySuperconceptsMapping,
    };
}

function addDummiesToLayers(
    conceptsCount: number,
    subconceptsMapping: ReadonlyArray<Set<number>>,
    layersMapping: Array<number>,
    horizontalCoords: Array<number>,
    layersWithDummies: Array<Array<number>>,
    dummySubconceptsMapping: Map<number, Array<number>>,
    dummySuperconceptsMapping: Map<number, Array<number>>,
) {
    let newDummy = conceptsCount;

    for (let from = 0; from < subconceptsMapping.length; from++) {
        const fromLayer = layersMapping[from];

        for (const to of subconceptsMapping[from].values()) {
            const toLayer = layersMapping[to];
            const diff = Math.abs(toLayer - fromLayer);

            if (diff > 1) {
                // add dummies 
                let previousSuperconcept = from;

                for (let i = 1; i <= diff - 1; i++) {
                    const ratio = i / (toLayer - fromLayer);
                    const coord = Math.round((ratio * (horizontalCoords[to] - horizontalCoords[from])) + horizontalCoords[from]);
                    const targetLayer = layersWithDummies[fromLayer + i];

                    targetLayer.splice(coord, 0, newDummy);
                    horizontalCoords[newDummy] = coord;

                    for (let j = coord + 1; j < targetLayer.length; j++) {
                        horizontalCoords[targetLayer[j]]++;
                    }

                    addSubconceptToMapping(dummySubconceptsMapping, previousSuperconcept, newDummy);
                    addSubconceptToMapping(dummySuperconceptsMapping, newDummy, previousSuperconcept);

                    previousSuperconcept = newDummy;
                    newDummy++;
                }

                addSubconceptToMapping(dummySubconceptsMapping, previousSuperconcept, to);
                addSubconceptToMapping(dummySuperconceptsMapping, to, previousSuperconcept);
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