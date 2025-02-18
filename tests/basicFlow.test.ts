import { expect, test, describe } from "vitest";
import { parseBurmeister } from "../src/services/contextParsing";
import { computeConcepts } from "../src/services/conceptComputation";
import { conceptsToLattice } from "../src/services/latticeComputation";
import { RawFormalContext } from "../src/types/RawFormalContext";
import { FormalConcepts } from "../src/types/FormalConcepts";
import { ConceptLattice } from "../src/types/ConceptLattice";
import { DIGITS, LATTICE, LIVEINWATER, NOM5SHUTTLE, TEALADY, TestValue } from "./constants/flowTestValues";
import { assignNodesToLayersByLongestPath } from "../src/services/layouts/layers";

describe.each<TestValue>([
    DIGITS,
    LATTICE,
    LIVEINWATER,
    TEALADY,
    NOM5SHUTTLE,
])("the basic flow from file to lattice", (value) => {
    let context: RawFormalContext = null!;
    let concepts: FormalConcepts = null!;
    let lattice: ConceptLattice = null!;

    test(`parsing context: ${value.title}`, () => {
        context = parseBurmeister(value.fileContent);
        expect(context.cellsPerObject).toBe(value.contextCellsPerObject);
        expect(context.objects.length).toBe(value.objectsCount);
        expect(context.attributes.length).toBe(value.attributesCount);
        expect(context).toMatchSnapshot();
    }, 60000);

    test(`concepts: ${value.title}`, () => {
        concepts = computeConcepts(context);
        expect(concepts.length).toBe(value.conceptsCount);
        expect(concepts).toMatchSnapshot();
    }, 60000);

    test(`lattice: ${value.title}`, () => {
        lattice = conceptsToLattice(concepts);

        expect(lattice.subconceptsMapping.reduce((prev, curr) => prev + curr.size, 0))
            .toBe(value.coverRelationSize);
        expect(lattice.superconceptsMapping.reduce((prev, curr) => prev + curr.size, 0))
            .toBe(value.coverRelationSize);
        expect(lattice.subconceptsMapping).toMatchSnapshot();
    }, 60000);

    test(`layers by the longest path: ${value.title}`, () => {
        const { layers } = assignNodesToLayersByLongestPath(concepts, lattice.subconceptsMapping);

        for (let i = 0; i < value.byLongestPathLayersCounts.length; i++) {
            expect(layers[i].size).toBe(value.byLongestPathLayersCounts[i]);
        }
    }, 60000);
});