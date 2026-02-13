import { create } from "zustand";
import { ConceptExportFormat } from "../../../types/export/ConceptExportFormat";
import createTextResultStoreBaseSlice from "../createTextResultStoreBaseSlice";
import { w, withFallback } from "../../../utils/stores";
import useDiagramStore from "../../diagram/useDiagramStore";
import createIncludeLatticeSlice, { initialState as includeLatticeInitialState } from "./createIncludeLatticeSlice";
import { ExportConceptsStore } from "./ExportConceptsStore";
import { withConceptsExportResult, withConceptsExportTooLarge } from "./utils";

type ExportDiagramConceptsStoreState = {
    includeHighlightedConceptsOnly: boolean,
}

type ExportConceptsStoreActions = {
    setIncludeHighlightedConceptsOnly: React.Dispatch<React.SetStateAction<boolean>>,
}

export type ExportDiagramConceptsStore = ExportConceptsStore &
    ExportDiagramConceptsStoreState &
    ExportConceptsStoreActions

const initialState: ExportDiagramConceptsStoreState = {
    includeHighlightedConceptsOnly: true,
};

const useExportDiagramConceptsStore = create<ExportDiagramConceptsStore>((set) => ({
    ...initialState,
    ...includeLatticeInitialState,
    setIncludeHighlightedConceptsOnly: (includeHighlightedConceptsOnly) => set((old) => w({
        includeHighlightedConceptsOnly: (typeof includeHighlightedConceptsOnly === "function" ?
            includeHighlightedConceptsOnly(old.includeHighlightedConceptsOnly) :
            includeHighlightedConceptsOnly)
    }, old, withTooLarge, withResult)),
    ...createIncludeLatticeSlice(set, withResult, withTooLarge),
    ...createTextResultStoreBaseSlice<ConceptExportFormat, ExportDiagramConceptsStore>(
        "json",
        { ...initialState },
        set,
        withResult,
        withTooLarge),
}));

export default useExportDiagramConceptsStore;

function withTooLarge(newState: Partial<ExportDiagramConceptsStore>, oldState: ExportDiagramConceptsStore): Partial<ExportDiagramConceptsStore> {
    return withConceptsExportTooLarge(
        newState,
        oldState,
        getSublatticeConceptIndexes(newState, oldState));
}

function withResult(newState: Partial<ExportDiagramConceptsStore>, oldState: ExportDiagramConceptsStore): Partial<ExportDiagramConceptsStore> {
    return withConceptsExportResult(
        newState,
        oldState,
        getSublatticeConceptIndexes(newState, oldState));
}

function getSublatticeConceptIndexes(newState: Partial<ExportDiagramConceptsStore>, oldState: ExportDiagramConceptsStore) {
    // This should ideally not be dependent on useDiagramStore, but it does not really matter...
    const sublatticeConceptIndexes = useDiagramStore.getState().sublatticeConceptIndexes;
    const includeHighlightedConceptsOnly = withFallback(
        newState.includeHighlightedConceptsOnly,
        oldState.includeHighlightedConceptsOnly);
    return includeHighlightedConceptsOnly ? [...(sublatticeConceptIndexes?.values() || [])] : [];
}