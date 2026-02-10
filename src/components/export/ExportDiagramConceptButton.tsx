import useExportDiagramConceptStore from "../../stores/export/concepts/useExportDiagramConceptStore";
import createExportConceptButton from "./createExportConceptButton";

const ExportDiagramConceptButton = createExportConceptButton(useExportDiagramConceptStore);

export default ExportDiagramConceptButton;