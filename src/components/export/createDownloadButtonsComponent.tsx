import { LuCheck, LuCopy } from "react-icons/lu";
import { TextResultStoreType } from "../../stores/export/types/TextResultStoreType";
import { useState } from "react";
import CheckBox from "../inputs/CheckBox";
import DownloadButtons from "./DownloadButtons";
import { downloadBlob } from "../../utils/export";
import useCopySuccessful from "../../hooks/useCopySuccesful";

const COPY_ENABLED_THRESHOLD = 15_000_000;

export default function createDownloadButtonsComponent(useTextResultStore: TextResultStoreType, fileName: string, joinCharacter: "" | "\n" = "") {
    const component = () => {
        const [includeFormatting, setIncludeFormatting] = useState<boolean>(false);
        const [copySuccessful, setCopySuccessful] = useCopySuccessful();
        const result = useTextResultStore((state) => state.result);
        const disabledComputation = useTextResultStore((state) => state.disabledComputation);
        const charactersCount = useTextResultStore((state) => state.charactersCount);

        const copyDisabled = charactersCount > COPY_ENABLED_THRESHOLD;

        async function onCopyClick() {
            if (!result || disabledComputation || copyDisabled) {
                return;
            }

            try {
                setCopySuccessful(false);

                await navigator.clipboard.writeText(createFinalString(result, joinCharacter, includeFormatting));

                setCopySuccessful(true);
            } catch (err) {
                console.error("Failed to copy text: ", err);
            }
        }

        function onDownloadClick() {
            if (!result) {
                return;
            }

            const blob = new Blob([createFinalString(result, joinCharacter, includeFormatting)], { type: "text/plain" });
            downloadBlob(blob, fileName);
        }

        return (
            <div
                className="grid grid-rows-[auto_auto] grid-cols-2 gap-x-2 gap-y-4 px-4 pb-4">
                <CheckBox
                    className="col-start-1 col-end-3"
                    checked={includeFormatting}
                    onChange={(e) => setIncludeFormatting(e.currentTarget.checked)}>
                    Include formatting
                </CheckBox>

                <DownloadButtons
                    onCopyClick={onCopyClick}
                    copyDisabled={!result || disabledComputation || copyDisabled}
                    copyButtonIcon={copySuccessful ? LuCheck : LuCopy}
                    downloadDisabled={!result || disabledComputation}
                    onDownloadClick={onDownloadClick} />
            </div>
        );
    };

    component.displayName = "DownloadButtons";

    return component;
}

function createFinalString(lines: Array<string>, joinCharacter: "" | "\n", includeFormatting: boolean) {
    return includeFormatting ?
        lines.join("\n") :
        lines.map((line) => line.trimStart()).join(joinCharacter);
}