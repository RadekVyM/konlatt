import { ConceptLattice } from "../ConceptLattice";
import { CsvSeparator } from "../CsvSeparator";
import { LayoutComputationOptions } from "../diagram/LayoutComputationOptions";
import { FormalConcepts } from "../FormalConcepts";
import { FormalContext } from "../FormalContext";
import { ImportFormat } from "../ImportFormat";

export type MainWorkerRequest = CancellationRequest | ContextParsingRequest | ConceptComputationRequest | LatticeComputationRequest | LayoutComputationRequest

export type CompleteMainWorkerRequest = {
    jobId: number,
    time: number,
} & MainWorkerRequest

export type ContextParsingRequest = {
    type: "parse-context",
    content: string,
    format: ImportFormat,
    csvSeparator?: CsvSeparator,
} & BaseRequest

export type ConceptComputationRequest = {
    type: "concepts",
} & BaseRequest

export type LatticeComputationRequest = {
    type: "lattice",
} & BaseRequest

export type LayoutComputationRequest = {
    type: "layout",
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
    options: LayoutComputationOptions,
} & BaseRequest

export type CancellationRequest = {
    type: "cancel",
    jobId: number,
} & BaseRequest

export type CompleteLayoutComputationRequest = {
    type: "layout",
    supremum: number,
    infimum: number,
    conceptsCount: number,
    subconceptsMappingArrayBuffer: Int32Array,
    options: LayoutComputationOptions,
} & BaseRequest

type BaseRequest = {
    context?: FormalContext
    concepts?: FormalConcepts,
    lattice?: ConceptLattice,
}