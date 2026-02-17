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
import { withoutExtension } from "../utils/string";
import DemoDatasetsButton from "./DemoDatasetsButton";
import DemoDatasetsDialog from "./DemoDatasetsDialog";
import useDialog from "../hooks/useDialog";
import { LuCheck } from "react-icons/lu";
import { ImportFormat } from "../types/ImportFormat";
import CsvSeparatorSelect from "./CsvSeparatorSelect";
import { CsvSeparator } from "../types/CsvSeparator";
import InputLabel from "./inputs/InputLabel";
import { triggerInitialization } from "../services/triggers";

const DEFAULT_FILE_FORMAT: ImportFormat = "burmeister";
const FILE_TYPES: Array<{ key: ImportFormat, label: string, idealExtension: string }> = [
    { key: "burmeister", label: "Burmeister (.cxt)", idealExtension: ".cxt" },
    { key: "json", label: "Konlatt JSON (.json)", idealExtension: ".json" },
    { key: "xml", label: "Konlatt XML (.xml)", idealExtension: ".xml" },
    { key: "csv", label: "CSV (.csv)", idealExtension: ".csv" },
];

export default function NewProjectDialog(props: {
    state: DialogState,
}) {
    const navigate = useNavigate();
    const { selectedFile, setSelectedFile } = useNewProjectStore();
    const [selectedFileFormat, setSelectedFileFormat] = useState<ImportFormat>(DEFAULT_FILE_FORMAT);
    const [selectedCsvSeparator, setSelectedCsvSeparator] = useState<CsvSeparator>(",");
    const [disabled, setDisabled] = useState(false);
    const datasetsDialogState = useDialog();

    useEffect(() => {
        setDisabled(false);

        if (!props.state.isOpen) {
            setSelectedFile(null);
            setSelectedFileFormat(DEFAULT_FILE_FORMAT);
        }
    }, [props.state.isOpen]);

    function onFileSelect(file: File | null | undefined) {
        setSelectedFile(file);

        if (!file) {
            return;
        }

        for (const item of FILE_TYPES) {
            if (file.name.endsWith(item.idealExtension)) {
                setSelectedFileFormat(item.key);
                return;
            }
        }
    }

    async function onCreateClick() {
        if (!selectedFile) {
            return;
        }

        setDisabled(true);

        triggerInitialization(
            await selectedFile.text(),
            selectedFileFormat,
            selectedCsvSeparator,
            withoutExtension(selectedFile.name),
            async () => {
                navigate("/project/context", { replace: true });
                setDisabled(false);
                await props.state.hide();
            },
            () => setDisabled(false));
    }

    return (
        <>
            <ContentDialog
                ref={props.state.dialogRef}
                state={props.state}
                heading="New project"
                className="w-full max-w-xl max-h-full rounded-md"
                disabled={disabled}>
                <div
                    className="pt-2">
                    {!selectedFile ?
                        <>
                            <LargeFileSelection
                                className="w-full mb-3"
                                accept={FILE_INPUT_ACCEPT}
                                file={selectedFile}
                                onFileSelect={onFileSelect}
                                disabled={disabled} />

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
                                onFileSelect={onFileSelect}
                                disabled={disabled}>
                                {selectedFile?.name || "Choose file"}
                            </FileSelection>

                            <InputLabel>File format</InputLabel>

                            <div
                                className="flex gap-2">
                                <ComboBox
                                    id="file-type-selection"
                                    className="flex-1"
                                    onKeySelectionChange={setSelectedFileFormat}
                                    selectedKey={selectedFileFormat}
                                    items={FILE_TYPES}
                                    disabled={disabled} />
                                <FormatsButton
                                    disabled={disabled} />
                            </div>

                            {selectedFileFormat === "csv" &&
                                <>
                                    <InputLabel className="mt-3">Separator</InputLabel>

                                    <CsvSeparatorSelect
                                        id={`import-csv-separator`}
                                        selectedCsvSeparator={selectedCsvSeparator}
                                        onCsvSeparatorChange={setSelectedCsvSeparator} />
                                </>}

                            <Button
                                variant="primary"
                                className="ml-auto mt-6"
                                onClick={onCreateClick}
                                disabled={!selectedFile || disabled}>
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