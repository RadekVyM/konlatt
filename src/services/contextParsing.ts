import { RawFormalContext } from "../types/RawFormalContext";
import { __collect, parseBurmeister as parseBurmeisterAs } from "../as";

export function parseBurmeister(content: string): RawFormalContext {
    const context = parseBurmeisterAs(content) as RawFormalContext;
    __collect();
    return context;
}