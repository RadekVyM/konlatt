import { XMLParser } from "fast-xml-parser";
import { FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import { INVALID_FILE_MESSAGE } from "./constants";
import parseXmlContext from "./context/xml";
import parseXmlConcepts from "./concepts/xml";

export default function parseXml(content: string): {
    context: FormalContext,
    concepts?: FormalConcepts,
} {
    let xmlContent: any;    

    try {
        const parser = new XMLParser({
            ignoreAttributes: false,
        });
        xmlContent = parser.parse(content);
    }
    catch {
        throw new Error(INVALID_FILE_MESSAGE);
    }

    let context: FormalContext;
    let concepts: FormalConcepts | undefined = undefined;

    if ("context" in xmlContent && "objects" in xmlContent.context && "attributes" in xmlContent.context && "relation" in xmlContent.context) {
        context = parseXmlContext(xmlContent);
    }
    else if ("context" in xmlContent && "objects" in xmlContent.context && "attributes" in xmlContent.context && "concepts" in xmlContent.context) {
        ({ context, concepts } = parseXmlConcepts(xmlContent));
    }
    else {
        throw new Error(INVALID_FILE_MESSAGE);
    }

    return {
        context,
        concepts,
    };
}