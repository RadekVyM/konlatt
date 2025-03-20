import { expect, test } from "vitest";
import { __collect, conceptsCover, parseBurmeister } from "../../../../src/wasm/as";
import { DIGITS, LATTICE, LIVEINWATER, TEALADY, TestValue } from "../../../constants/flowTestValues";
import { computeConcepts } from "../../../../src/services/conceptComputation";

test.each<TestValue>([
    DIGITS,
    LATTICE,
    LIVEINWATER,
    TEALADY,
    //NOM5SHUTTLE,
])("concepts cover", async (value) => {
    const context = parseBurmeister(value.fileContent);
    const concepts = await computeConcepts(context as any);
    const lattice = conceptsCover(concepts.concepts as any, context);
    expect(lattice.reduce((prev, curr) => prev + curr.length, 0))
        .toBe(value.coverRelationSize);
}, 60000);