import { useEffect, useState } from "react";
import { DialogState } from "../types/DialogState";
import ContentDialog from "./ContentDialog";
import { FileSelection, LargeFileSelection } from "./inputs/FileSelection";
import Button from "./inputs/Button";
import ComboBox from "./inputs/ComboBox";
import { useNavigate } from "react-router-dom";
import useNewProjectStore from "../stores/useNewProjectStore";
import { FILE_INPUT_ACCEPT } from "../constants/files";
import FormatsButton from "./formats/FormatsButton";
import { triggerInitialization } from "../services/triggers";
import { withoutExtension } from "../utils/string";
import DemoDatasetsButton from "./DemoDatasetsButton";
import DemoDatasetsDialog from "./DemoDatasetsDialog";
import useDialog from "../hooks/useDialog";
import { LuCheck } from "react-icons/lu";

const DEFAULT_FILE_TYPE = "burmeister";
const FILE_TYPES: Array<{ key: string, label: string }> = [
    { key: "burmeister", label: "Burmeister (.cxt)" },
];

export default function NewProjectDialog(props: {
    state: DialogState,
}) {
    const navigate = useNavigate();
    const { selectedFile, setSelectedFile } = useNewProjectStore();
    const [selectedFileType, setSelectedFileType] = useState<string>(DEFAULT_FILE_TYPE);
    const datasetsDialogState = useDialog();

    useEffect(() => {
        if (!props.state.isOpen) {
            setSelectedFile(null);
            setSelectedFileType(DEFAULT_FILE_TYPE);
        }
    }, [props.state.isOpen]);

    async function onCreateClick() {
        if (!selectedFile) {
            return;
        }

        navigate("/project/context", { replace: true });
        triggerInitialization(await selectedFile.text(), withoutExtension(selectedFile.name));
        await props.state.hide();
    }

    return (
        <>
            <ContentDialog
                ref={props.state.dialogRef}
                state={props.state}
                heading="New project"
                className="w-full max-w-xl max-h-full rounded-md">
                <div
                    className="pt-2">
                    {!selectedFile ?
                        <>
                            <LargeFileSelection
                                className="w-full mb-3"
                                accept={FILE_INPUT_ACCEPT}
                                file={selectedFile}
                                onFileSelect={setSelectedFile} />

                            <div
                                className="grid grid-cols-2 justify-items-stretch gap-3">
                                <DemoDatasetsButton
                                    className="w-full justify-center"
                                    onClick={async () => {
                                        props.state.hide();
                                        datasetsDialogState.show();
                                    }} />
                                <FormatsButton
                                    className="w-full justify-center"
                                    withText />
                            </div>
                        </> :
                        <>
                            <FileSelection
                                className="mb-4"
                                accept={FILE_INPUT_ACCEPT}
                                file={selectedFile}
                                onFileSelect={setSelectedFile}>
                                {selectedFile?.name || "Choose file"}
                            </FileSelection>

                            <label className="text-sm mb-1 block">File format</label>

                            <div
                                className="mb-6 flex gap-2">
                                <ComboBox
                                    id="file-type-selection"
                                    className="flex-1"
                                    onKeySelectionChange={setSelectedFileType}
                                    selectedKey={selectedFileType}
                                    items={FILE_TYPES} />
                                <FormatsButton />
                            </div>

                            <Button
                                variant="primary"
                                className="ml-auto"
                                onClick={onCreateClick}
                                disabled={!selectedFile}>
                                <LuCheck /> Create project
                            </Button>
                        </>}
                </div>
            </ContentDialog>

            <DemoDatasetsDialog
                state={datasetsDialogState} />
        </>
    );
}