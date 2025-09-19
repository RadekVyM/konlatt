import useExportConceptsStore from "../../stores/export/useExportConceptsStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import ToggleSwitch from "../inputs/ToggleSwitch";
import createDownloadButtonsComponent from "./createDownloadButtonsComponent";
import createTextResultPreviewerComponent from "./createTextResultPreviewerComponent";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

const TextPreviewer = createTextResultPreviewerComponent(useExportConceptsStore);

const ITEMS: Array<ExportItem<ConceptExportFormat>> = [
    {
        key: "json",
        label: "JSON",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportConceptsStore, "exported-concepts.json"),
        options: () => <Options />,
    },
    {
        key: "xml",
        label: "XML",
        content: TextPreviewer,
        buttons: createDownloadButtonsComponent(useExportConceptsStore, "exported-concepts.xml"),
        options: () => <Options />,
    },
];

export default function ExportConceptsButton(props: ExportButtonProps) {
    // Result needs to be reset on hiding to prevent memomory leaks
    const context = useDataStructuresStore((state) => state.context);
    const concepts = useDataStructuresStore((state) => state.concepts);

    return (
        <ExportButton<ConceptExportFormat>
            {...props}
            disabled={!context || !concepts}
            items={ITEMS}
            useSelectedFormatStore={useExportConceptsStore}
            onShowing={useExportConceptsStore.getState().resetResult}
            onShown={useExportConceptsStore.getState().triggerResultComputation}
            onHiding={useExportConceptsStore.getState().resetResult} />
    );
}

function Options() {
    const csvSeparator = useExportConceptsStore((state) => state.includeHighlightedConceptsOnly);
    const includeLattice = useExportConceptsStore((state) => state.includeLattice);
    const lattice = useDataStructuresStore((state) => state.lattice);
    const setCsvSeparator = useExportConceptsStore((state) => state.setIncludeHighlightedConceptsOnly);
    const setIncludeLattice = useExportConceptsStore((state) => state.setIncludeLattice);

    return (
        <div
            className="px-4 mt-2 flex flex-col gap-2">
            <ToggleSwitch
                checked={csvSeparator}
                onChange={(e) => setCsvSeparator(e.currentTarget.checked)}>
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