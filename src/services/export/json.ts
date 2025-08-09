import { FormalConcept, FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import { INDENTATION } from "./constants";
import { generateRelations } from "./utils";

export function pushArray<T extends {}>(lines: Array<string>, values: ReadonlyArray<T>, name: string | null, indentation: string, withComma: boolean, transformer: (value: T) => string) {
    const start = name ? `${indentation}"${name}": ` : `${indentation}`;

    if (values.length <= 5) {
        lines.push(`${start}[${values.map(transformer).join(", ")}]${withComma ? "," : ""}`);
        return;
    }

    lines.push(`${start}[`);

    for (let i = 0; i < values.length; i++) {
        lines.push(`${indentation}${INDENTATION}${transformer(values[i])}${i === values.length - 1 ? "" : ","}`);
    }

    lines.push(`${indentation}]${withComma ? "," : ""}`);
}

export function stringTransformer<T extends {}>(value: T) {
    return `"${value}"`;
}

export function defaultTransformer<T extends {}>(value: T) {
    return value.toString();
}

export function pushRelations(lines: Array<string>, context: FormalContext, indentation: string, withComma: boolean) {
    lines.push(`${indentation}"relations": [`);

    for (const [object, attribute] of generateRelations(context)) {
        lines.push(`${indentation}${INDENTATION}[${object}, ${attribute}],`);
    }

    lines[lines.length - 1] = lines[lines.length - 1].slice(0, lines[lines.length - 1].length - 1);

    lines.push(`${indentation}]${withComma ? "," : ""}`);
}

export function pushConcepts(lines: Array<string>, formalConcepts: FormalConcepts, indentation: string, withComma: boolean) {
    lines.push(`${indentation}"concepts": [`);

    const conceptIndentation = `${indentation}${INDENTATION}`;

    for (let conceptIndex = 0; conceptIndex < formalConcepts.length; conceptIndex++) {
        const concept = formalConcepts[conceptIndex];
        pushConcept(lines, concept, conceptIndentation, conceptIndex !== formalConcepts.length - 1);
    }

    lines.push(`${indentation}]${withComma ? "," : ""}`);
}

export function pushConcept(lines: Array<string>, concept: FormalConcept, indentation: string, withComma: boolean, context?: FormalContext) {
    const conceptBodyIndentation = `${indentation}${INDENTATION}`;

    lines.push(`${indentation}{`);

    pushArray(lines, concept.objects, "objects", conceptBodyIndentation, true, context ? (object) => stringTransformer(context.objects[object]) : defaultTransformer);
    pushArray(lines, concept.attributes, "attributes", conceptBodyIndentation, false, context ? (attribute) => stringTransformer(context.attributes[attribute]) : defaultTransformer);

    lines.push(`${indentation}}${!withComma ? "" : ","}`);
}