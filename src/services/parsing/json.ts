import { FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import { INVALID_FILE_MESSAGE } from "./constants";
import parseJsonContext from "./context/json";

export default function parseJson(content: string): {
    context: FormalContext,
    concepts?: FormalConcepts,
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

    if ("objects" in jsonContent && "attributes" in jsonContent && "relations" in jsonContent) {
        context = parseJsonContext(jsonContent);
    }
    else {
        throw new Error(INVALID_FILE_MESSAGE);
    }

    return {
        context,
        concepts,
    };
}