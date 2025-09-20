import { ConceptLattice } from "../../types/ConceptLattice";
import { CsvSeparator } from "../../types/CsvSeparator";
import { FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import { ImportFormat } from "../../types/ImportFormat";
import parseBurmeister from "./burmeister";
import parseCsv from "./csv";
import parseJson from "./json";
import parseXml from "./xml";

export async function parseFileContent(content: string, format: ImportFormat, separator?: CsvSeparator): Promise<{
    context: FormalContext,
    concepts?: FormalConcepts,
    lattice?: ConceptLattice,
}> {
    let context: FormalContext;
    let concepts: FormalConcepts | undefined = undefined;
    let lattice: ConceptLattice | undefined = undefined;

    switch (format) {
        case "burmeister":
            context = parseBurmeister(content);
            break;
        case "json":
            ({ context, concepts, lattice } = parseJson(content));
            break;
        case "xml":
            ({ context, concepts, lattice } = parseXml(content));
            break;
        case "csv":
            if (!separator) {
                throw new Error("Separator was not defined.");
            }

            context = parseCsv(content, separator);
            break;
    }

    return new Promise((resolve) => resolve({ context, concepts, lattice }));
}