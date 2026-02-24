import useExportExplorerConceptStore from "../../stores/export/concepts/useExportExplorerConceptStore";
import createExportConceptButton from "./createExportConceptButton";

/**
 * Export button for downloading or copying selected concept on the explorer page.
 */
const ExportExporerConceptButton = createExportConceptButton(useExportExplorerConceptStore);

export default ExportExporerConceptButton;