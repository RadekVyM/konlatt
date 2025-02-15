import { ConceptLattice } from "../../types/ConceptLattice";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { FormalConcepts } from "../../types/FormalConcepts";
import { createPoint, Point } from "../../types/Point";
import { assignNodesToLayersByLongestPath } from "./layers";

export function computeLayeredLayout(formalConcepts: FormalConcepts, lattice: ConceptLattice): ConceptLatticeLayout {
    const { layers, layersMapping } = assignNodesToLayersByLongestPath(formalConcepts, lattice.subconceptsMapping);
    const { layersWithFakes } = addFakes(formalConcepts.length, lattice.subconceptsMapping, layers, layersMapping);

    // reduce crossings

    return createLayout(formalConcepts.length, layersWithFakes);
}

function createLayout(conceptsCount: number, layers: Array<Array<number>>) {
    const layout = new Array<Point>(conceptsCount);
    let top = ((layers.length - 1) * 60) / -2;

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        let left = ((layer.length - 1) * 60) / -2;

        for (const node of layer) {
            if (node < conceptsCount) {
                layout[node] = createPoint(left, top, 0);
            }
            left += 60;
        }

        top += 60;
    }

    return layout;
}

function addFakes(conceptsCount: number, subconceptsMapping: ReadonlyArray<Set<number>>, layers: Array<Set<number>>, layersMapping: Array<number>) {
    const fakeSubconceptsMapping = new Map<number, Array<number>>();
    const horizontalCoords = new Array<number>(conceptsCount);
    const layersWithFakes = new Array<Array<number>>();

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const values = [...layer.values()];

        for (let j = 0; j < values.length; j++) {
            const value = values[j];
            horizontalCoords[value] = j;
        }

        layersWithFakes[i] = values;
    }

    addFakesToLayers(conceptsCount, subconceptsMapping, layersMapping, horizontalCoords, layersWithFakes, fakeSubconceptsMapping);

    return {
        layersWithFakes,
        horizontalCoords,
        fakeSubconceptsMapping,
    };
}

function addFakesToLayers(
    conceptsCount: number,
    subconceptsMapping: ReadonlyArray<Set<number>>,
    layersMapping: Array<number>,
    horizontalCoords: Array<number>,
    layersWithFakes: Array<Array<number>>,
    fakeSubconceptsMapping: Map<number, number[]>
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

                    previousSuperconcept = newFake;
                    newFake++;
                }

                addSubconceptToMapping(fakeSubconceptsMapping, previousSuperconcept, to);
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