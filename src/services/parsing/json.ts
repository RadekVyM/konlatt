import { ConceptLattice } from "../../types/ConceptLattice";
import { FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import parseJsonConcepts from "./concepts/json";
import { INVALID_FILE_MESSAGE } from "./constants";
import parseJsonContext from "./context/json";

export default function parseJson(content: string): {
    context: FormalContext,
    concepts?: FormalConcepts,
    lattice?: ConceptLattice,
} {
    let jsonContent: any;    

    try {
        jsonContent = JSON.parse(content);
    }
    catch {
        throw new Error(INVALID_FILE_MESSAGE);
    }

    let context: FormalContext;
    let concepts: FormalConcepts | undefined = undefined;
    let lattice: ConceptLattice | undefined = undefined;

    if ("objects" in jsonContent && "attributes" in jsonContent && "relation" in jsonContent) {
        context = parseJsonContext(jsonContent);
    }
    else if ("objects" in jsonContent && "attributes" in jsonContent && "concepts" in jsonContent) {
        ({ context, concepts, lattice } = parseJsonConcepts(jsonContent));
    }
    else {
        throw new Error(INVALID_FILE_MESSAGE);
    }

    return {
        context,
        concepts,
        lattice,
    };
}