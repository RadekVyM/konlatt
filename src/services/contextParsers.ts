import { RawFormalContext } from "../types/RawFormalContext";
import { parseBurmeister as parseBurmeisterAs } from "../as";

export function parseBurmeister(content: string): RawFormalContext {
    return parseBurmeisterAs(content) as RawFormalContext;
}