import useExportDiagramConceptStore from "../../stores/export/concepts/useExportDiagramConceptStore";
import createExportConceptButton from "./createExportConceptButton";

/**
 * Export button for downloading or copying selected concept on the diagram page.
 */
const ExportDiagramConceptButton = createExportConceptButton(useExportDiagramConceptStore);

export default ExportDiagramConceptButton;