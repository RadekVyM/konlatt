import useExportExplorerConceptsStore from "../../stores/export/concepts/useExportExplorerConceptsStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import ToggleSwitch from "../inputs/ToggleSwitch";
import createExportConceptsButton from "./createExportConceptsButton";

const ExportExplorerConceptsButton = createExportConceptsButton(useExportExplorerConceptsStore, Options);

export default ExportExplorerConceptsButton;

function Options() {
    const includeLattice = useExportExplorerConceptsStore((state) => state.includeLattice);
    const lattice = useDataStructuresStore((state) => state.lattice);
    const setIncludeLattice = useExportExplorerConceptsStore((state) => state.setIncludeLattice);

    return (
        <div
            className="px-4 mt-2 flex flex-col gap-2">
            <ToggleSwitch
                disabled={!lattice}
                checked={includeLattice}
                onChange={(e) => setIncludeLattice(e.currentTarget.checked)}>
                Include lattice
            </ToggleSwitch>
        </div>
    );
}