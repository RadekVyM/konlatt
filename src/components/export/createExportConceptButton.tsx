import React, { useLayoutEffect } from "react";
import useExportDiagramConceptStore from "../../stores/export/concepts/useExportDiagramConceptStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import createDownloadButtonsComponent from "./createDownloadButtonsComponent";
import createTextResultPreviewerComponent from "./createTextResultPreviewerComponent";
import ExportButton from "./ExportButton";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { ExportItem } from "./types/ExportItem";
import { ExportConceptStore } from "../../stores/export/concepts/ExportConceptStore";
import { StoreApi, UseBoundStore } from "zustand";

export type ExportConceptButtonType = (props: {
    conceptIndex: number;
} & ExportButtonProps) => React.ReactNode

export default function createExportConceptButton(
    useStore: UseBoundStore<StoreApi<ExportConceptStore>>
): ExportConceptButtonType {
    const TextPreviewer = createTextResultPreviewerComponent(useStore);

    const ITEMS: Array<ExportItem<ConceptExportFormat>> = [
        {
            key: "json",
            label: "JSON",
            content: TextPreviewer,
            buttons: createDownloadButtonsComponent(useExportDiagramConceptStore, "exported-concept.json"),
        },
        {
            key: "xml",
            label: "XML",
            content: TextPreviewer,
            buttons: createDownloadButtonsComponent(useExportDiagramConceptStore, "exported-concept.xml"),
        },
    ];

    return function ExportConceptButton(props: {
        conceptIndex: number,
    } & ExportButtonProps) {
        const context = useDataStructuresStore((state) => state.context);
        const concepts = useDataStructuresStore((state) => state.concepts);

        useLayoutEffect(() => {
            useStore.getState().setSelectedConceptIndex(props.conceptIndex);
        }, [props.conceptIndex]);

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