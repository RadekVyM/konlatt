import { ConceptExportFormat } from "../../../types/export/ConceptExportFormat";
import { TextResultExportStore } from "../createTextResultStoreBaseSlice";
import { IncludeLatticeSlice } from "./createIncludeLatticeSlice";

export type ExportConceptsStore = TextResultExportStore<ConceptExportFormat> &
    IncludeLatticeSlice