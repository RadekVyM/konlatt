import { expect, test, describe } from "vitest";
import { parseFileContent } from "../../src/services/parsing";
import { computeConcepts } from "../../src/services/conceptComputation";
import { conceptsToLattice } from "../../src/services/latticeComputation";
import { FormalContext } from "../../src/types/FormalContext";
import { FormalConcepts, getSupremum } from "../../src/types/FormalConcepts";
import { ConceptLattice } from "../../src/types/ConceptLattice";
import { DIGITS, LATTICE, LIVEINWATER, NOM5SHUTTLE, TEALADY, TestValue } from "../constants/flowTestValues";
import { assignNodesToLayersByLongestPath } from "../../src/services/layers";

describe.each<TestValue>([
    DIGITS,
    LATTICE,
    LIVEINWATER,
    TEALADY,
    NOM5SHUTTLE,
])("the basic flow from file to lattice", (value) => {
    let savedContext: FormalContext = null!;
    let savedConcepts: FormalConcepts = null!;
    let savedLattice: ConceptLattice = null!;

    test(`parsing context: ${value.title}`, async () => {
        ({ context: savedContext } = await parseFileContent(value.fileContent, "burmeister"));
        expect(savedContext.cellsPerObject).toBe(value.contextCellsPerObject);
        expect(savedContext.objects.length).toBe(value.objectsCount);
        expect(savedContext.attributes.length).toBe(value.attributesCount);
        //expect(context).toMatchSnapshot();
    }, 60000);

    test(`concepts: ${value.title}`, async () => {
        const { concepts } = await computeConcepts(savedContext);
        savedConcepts = concepts;
        expect(concepts.length).toBe(value.conceptsCount);
        //expect(concepts).toMatchSnapshot();
    }, 60000);

    test(`lattice: ${value.title}`, async () => {
        const { lattice } = await conceptsToLattice(savedConcepts, savedContext);
        savedLattice = lattice;
        expect(lattice.subconceptsMapping.reduce((prev, curr) => prev + curr.size, 0))
            .toBe(value.coverRelationSize);
        expect(lattice.superconceptsMapping.reduce((prev, curr) => prev + curr.size, 0))
            .toBe(value.coverRelationSize);
        //expect(lattice.subconceptsMapping).toMatchSnapshot();
    }, 60000);

    test(`layers by the longest path: ${value.title}`, () => {
        const { layers } = assignNodesToLayersByLongestPath(getSupremum(savedConcepts).index, savedLattice.subconceptsMapping);

        for (let i = 0; i < value.byLongestPathLayersCounts.length; i++) {
            expect(layers[i].size).toBe(value.byLongestPathLayersCounts[i]);
        }
    }, 60000);
});