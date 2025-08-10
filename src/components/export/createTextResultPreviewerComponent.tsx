import { TextResultStoreType } from "../../stores/export/types/TextResultStoreType";
import TextPreviewer from "../TextPreviewer";

export default function createTextResultPreviewerComponent(useTextResultStore: TextResultStoreType) {
    const component = () => {
        const result = useTextResultStore((state) => state.result);
        const collapseRegions = useTextResultStore((state) => state.collapseRegions);

        if (!result) {
            return undefined;
        }

        console.log(result.length)

        return (
            
            <TextPreviewer
                lines={result || []}
                collapseRegions={collapseRegions}
                className="w-full h-full" />
        );
    };

    component.displayName = "TextResultPreviewer";

    return component;
}