import { SelectedFormatStoreType } from "../../stores/export/types/SelectedFormatStoreType";
import { TextResultStoreType } from "../../stores/export/types/TextResultStoreType";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import createDownloadButtonsComponent from "./createDownloadButtonsComponent";
import createTextResultPreviewerComponent from "./createTextResultPreviewerComponent";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";

export default function createExportConceptsButton(
    useStore: TextResultStoreType & SelectedFormatStoreType<ConceptExportFormat>,
    options: () => React.ReactNode
) {
    const Options = options;
    const TextPreviewer = createTextResultPreviewerComponent(useStore);

    const ITEMS: Array<ExportItem<ConceptExportFormat>> = [
        {
            key: "json",
            label: "JSON",
            content: TextPreviewer,
            buttons: createDownloadButtonsComponent(useStore, "exported-concepts.json"),
            options: () => <Options />,
        },
        {
            key: "xml",
            label: "XML",
            content: TextPreviewer,
            buttons: createDownloadButtonsComponent(useStore, "exported-concepts.xml"),
            options: () => <Options />,
        },
    ];

    return function ExportConceptsButton(props: ExportButtonProps) {
        // Result needs to be reset on hiding to prevent memory leaks
        const context = useDataStructuresStore((state) => state.context);
        const concepts = useDataStructuresStore((state) => state.concepts);

        return (
            <ExportButton<ConceptExportFormat>
                {...props}
                disabled={!context || !concepts}
                items={ITEMS}
                useSelectedFormatStore={useStore}
                onShowing={useStore.getState().resetResult}
                onShown={useStore.getState().triggerResultComputation}
                onHiding={useStore.getState().resetResult} />
        );
    }
}