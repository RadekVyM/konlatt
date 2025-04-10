import { useEffect, useState } from "react";
import { DialogState } from "../types/DialogState";
import ContentDialog from "./ContentDialog";
import { FileSelection, LargeFileSelection } from "./inputs/FileSelection";
import Button from "./inputs/Button";
import ComboBox from "./inputs/ComboBox";
import { useNavigate } from "react-router-dom";
import useConceptLattice from "../hooks/useConceptLattice";
import useNewProjectStore from "../hooks/stores/useNewProjectStore";
import { FILE_INPUT_ACCEPT } from "../constants/files";
import FormatsButton from "./formats/FormatsButton";

const DEFAULT_FILE_TYPE = "burmeister";
const FILE_TYPES: Array<{ key: string, label: string }> = [
    { key: "burmeister", label: "Burmeister (.cxt)" },
    { key: "txt", label: "Text (.txt)" },
    { key: "csv", label: "CSV (.csv)" },
];

export default function NewProjectDialog(props: {
    state: DialogState,
}) {
    const navigate = useNavigate();
    const { setupLattice } = useConceptLattice();
    const { selectedFile, setSelectedFile } = useNewProjectStore();
    const [selectedFileType, setSelectedFileType] = useState<string>(DEFAULT_FILE_TYPE);

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
        setupLattice(selectedFile);
        await props.state.hide();
    }

    return (
        <ContentDialog
            ref={props.state.dialogRef}
            state={props.state}
            heading="New project"
            className="w-full max-w-xl max-h-full rounded-md">
            <div
                className="pt-2">
                {!selectedFile ?
                    <LargeFileSelection
                        className="w-full"
                        accept={FILE_INPUT_ACCEPT}
                        file={selectedFile}
                        onFileSelect={setSelectedFile} /> :
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
                            className="mb-4 flex gap-2">
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
                            Create
                        </Button>
                    </>}
            </div>
        </ContentDialog>
    );
}