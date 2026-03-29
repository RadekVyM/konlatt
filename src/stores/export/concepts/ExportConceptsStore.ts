import { ConceptExportFormat } from "../../../types/export/ConceptExportFormat";
import { TextResultExportStore } from "../createTextResultStoreBaseSlice";
import { IncludeLatticeSlice } from "./createIncludeLatticeSlice";

/**
 * Store that manages the export state and logic for concepts, 
 * including lattice inclusion settings and size validation.
 */
export type ExportConceptsStore = TextResultExportStore<ConceptExportFormat> &
    IncludeLatticeSlice