import { create } from "zustand";
import { ConceptExportFormat } from "../../../types/export/ConceptExportFormat";
import createTextResultStoreBaseSlice from "../createTextResultStoreBaseSlice";
import createIncludeLatticeSlice, { initialState as includeLatticeInitialState } from "./createIncludeLatticeSlice";
import { ExportConceptsStore } from "./ExportConceptsStore";
import { withConceptsExportResult, withConceptsExportTooLarge } from "./utils";

type ExportEplorerConceptsStoreState = {
}

type ExportExplorerStoreActions = {
}

export type ExportExplorerConceptsStore = ExportConceptsStore &
    ExportEplorerConceptsStoreState &
    ExportExplorerStoreActions

const initialState: ExportEplorerConceptsStoreState = {
};

const useExportExplorerConceptsStore = create<ExportExplorerConceptsStore>((set) => ({
    ...initialState,
    ...includeLatticeInitialState,
    ...createIncludeLatticeSlice(set, withResult, withTooLarge),
    ...createTextResultStoreBaseSlice<ConceptExportFormat, ExportExplorerConceptsStore>(
        "json",
        { ...initialState },
        set,
        withResult,
        withTooLarge),
}));

export default useExportExplorerConceptsStore;

function withTooLarge(newState: Partial<ExportExplorerConceptsStore>, oldState: ExportExplorerConceptsStore): Partial<ExportExplorerConceptsStore> {
    return withConceptsExportTooLarge(
        newState,
        oldState,
        []);
}

function withResult(newState: Partial<ExportExplorerConceptsStore>, oldState: ExportExplorerConceptsStore): Partial<ExportExplorerConceptsStore> {
    return withConceptsExportResult(
        newState,
        oldState,
        []);
}