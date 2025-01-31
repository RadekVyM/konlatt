import { ContextResponseType } from "./ContextResponseType";
import { RawFormalContext } from "./RawFormalContext";

export type ContextParsingResponse = {
    type: ContextResponseType
}

export type ContextParsingEndResponse = {
    context: RawFormalContext,
    type: "end"
} & ContextParsingResponse