import { FormalContext } from "../types/FormalContext";
import parseBurmeister from "./parsing/burmeister";

export async function parseFileContent(content: string): Promise<FormalContext> {
    // TODO: Support more formats
    const context = parseBurmeister(content);
    return new Promise((resolve) => resolve(context));
}