import useExportDiagramConceptsStore from "../../stores/export/concepts/useExportDiagramConceptsStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import ToggleSwitch from "../inputs/ToggleSwitch";
import createExportConceptsButton from "./createExportConceptsButton";

const ExportDiagramConceptsButton = createExportConceptsButton(useExportDiagramConceptsStore, Options);

export default ExportDiagramConceptsButton;

function Options() {
    const includeHighlightedConceptsOnly = useExportDiagramConceptsStore((state) => state.includeHighlightedConceptsOnly);
    const includeLattice = useExportDiagramConceptsStore((state) => state.includeLattice);
    const lattice = useDataStructuresStore((state) => state.lattice);
    const setIncludeHighlightedConceptsOnly = useExportDiagramConceptsStore((state) => state.setIncludeHighlightedConceptsOnly);
    const setIncludeLattice = useExportDiagramConceptsStore((state) => state.setIncludeLattice);

    return (
        <div
            className="px-4 mt-2 flex flex-col gap-2">
            <ToggleSwitch
                checked={includeHighlightedConceptsOnly}
                onChange={(e) => setIncludeHighlightedConceptsOnly(e.currentTarget.checked)}>
                Highlighted sublattice only
            </ToggleSwitch>
            <ToggleSwitch
                disabled={!lattice}
                checked={includeLattice}
                onChange={(e) => setIncludeLattice(e.currentTarget.checked)}>
                Include lattice
            </ToggleSwitch>
        </div>
    );
}