import useExportExplorerConceptStore from "../../stores/export/concepts/useExportExplorerConceptStore";
import createExportConceptButton from "./createExportConceptButton";

const ExportExporerConceptButton = createExportConceptButton(useExportExplorerConceptStore);

export default ExportExporerConceptButton;