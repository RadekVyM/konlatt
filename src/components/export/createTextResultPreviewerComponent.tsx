import { LuLoaderCircle, LuTriangleAlert } from "react-icons/lu";
import { TextResultStoreType } from "../../stores/export/types/TextResultStoreType";
import { formatBytes } from "../../utils/numbers";
import Button from "../inputs/Button";
import TextPreviewer from "../TextPreviewer";

export default function createTextResultPreviewerComponent(useTextResultStore: TextResultStoreType) {
    const component = () => {
        const result = useTextResultStore((state) => state.result);
        const collapseRegions = useTextResultStore((state) => state.collapseRegions);
        const disabledComputation = useTextResultStore((state) => state.disabledComputation);
        const charactersCount = useTextResultStore((state) => state.charactersCount);
        const enableComputation = useTextResultStore((state) => state.enableComputation);

        if (disabledComputation) {
            return (
                <div
                    className="grid place-content-center text-center justify-items-center h-full">
                    <strong
                        className="text-lg text-on-surface mb-2">
                        Export paused
                    </strong>
                    <p
                        className="max-w-64 mb-3 text-sm text-on-surface-muted">
                        The file may be too large, which could make the process very slow or cause the application to crash
                    </p>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={enableComputation}>
                        <LuTriangleAlert /> Load it anyway
                    </Button>
                </div>
            );
        }

        if (!result) {
            return (
                <div
                    className="absolute inset-0 grid place-content-center">
                    <LuLoaderCircle
                        className="animate-spin w-8 h-8 text-on-surface-muted" />
                </div>
            );
        }

        return (
            <div
                className="grid grid-rows-[1fr_2rem] h-full max-h-full">
                <TextPreviewer
                    key={`${result[0]}-${result.length}`}
                    lines={result || []}
                    collapseRegions={collapseRegions}
                    className="w-full" />
                <footer
                    className="flex justify-end items-center gap-6 border-t border-outline-variant px-4 text-sm text-on-surface-muted">
                    <span>
                        ~{formatBytes(charactersCount)}
                    </span>

                    <span>
                        {result.length.toLocaleString()} lines
                    </span>
                </footer>
            </div>
        );
    };

    component.displayName = "TextResultPreviewer";

    return component;
}