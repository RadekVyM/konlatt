import { parseBurmeister } from "../parsing/burmeister";
import { formalContextHasAttribute } from "../types/FormalContext";

export function hasAttributes(burmeisterContext: string, object: i32, attributes: Array<i32>): boolean {
    const context = parseBurmeister(burmeisterContext);

    for (let i = 0; i < attributes.length; i++) {
        if (!formalContextHasAttribute(context, object, attributes[i]))
            return false;
    }

    return true;
}