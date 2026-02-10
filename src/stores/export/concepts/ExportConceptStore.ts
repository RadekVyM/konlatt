import { ConceptExportFormat } from "../../../types/export/ConceptExportFormat";
import { SelectedConceptSlice } from "../../createSelectedConceptSlice";
import { TextResultExportStore } from "../createTextResultStoreBaseSlice";

export type ExportConceptStore = TextResultExportStore<ConceptExportFormat> & SelectedConceptSlice