import { ConceptExportFormat } from "../../../types/export/ConceptExportFormat";
import { SelectedConceptSlice } from "../../createSelectedConceptSlice";
import { TextResultExportStore } from "../createTextResultStoreBaseSlice";

/**
 * Store that manages the export state and logic for an individual concept.
 */
export type ExportConceptStore = TextResultExportStore<ConceptExportFormat> & SelectedConceptSlice