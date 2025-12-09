import { LuCheck, LuCopy } from "react-icons/lu";
import { TextResultStoreType } from "../../stores/export/types/TextResultStoreType";
import { useRef, useState } from "react";
import CheckBox from "../inputs/CheckBox";
import DownloadButtons from "./DownloadButtons";

const COPY_ENABLED_THRESHOLD = 15_000_000;
const COPY_SUCCESSFUL_TIMEOUT_LENGTH = 1500;

export default function createDownloadButtonsComponent(useTextResultStore: TextResultStoreType, fileName: string, joinCharacter: "" | "\n" = "") {
    const component = () => {
        const copySuccessfulTimeoutRef = useRef<number>(null);
        const [includeFormatting, setIncludeFormatting] = useState<boolean>(false);
        const [copySuccessful, setCopySuccessful] = useState<boolean>(false);
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
                if (copySuccessfulTimeoutRef.current !== null) {
                    clearTimeout(copySuccessfulTimeoutRef.current);
                }

                await navigator.clipboard.writeText(createFinalString(result, joinCharacter, includeFormatting));

                setCopySuccessful(true);
                copySuccessfulTimeoutRef.current = setTimeout(() => {
                    setCopySuccessful(false);
                }, COPY_SUCCESSFUL_TIMEOUT_LENGTH);
            } catch (err) {
                console.error("Failed to copy text: ", err);
            }
        }

        function onDownloadClick() {
            if (!result) {
                return;
            }

            const blob = new Blob([createFinalString(result, joinCharacter, includeFormatting)], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        return (
            <div
                className="grid grid-rows-[auto_auto] grid-cols-2 gap-x-2 gap-y-4 p-4">
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