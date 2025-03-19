import { FILE_INPUT_ACCEPT } from "../../constants/files";
import useNewProjectStore from "../../hooks/stores/useNewProjectStore";
import { LargeFileSelection } from "../inputs/FileSelection";

export default function InitialPage() {
    const dialogState = useNewProjectStore((state) => state.dialogState);
    const { selectedFile, setSelectedFile } = useNewProjectStore();

    function onFileSelect(file: File | null | undefined) {
        setSelectedFile(file);

        if (file) {
            dialogState?.show();
        }
    }

    return (
        <div
            className="pt-2 pb-4 px-4 h-full">
            <LargeFileSelection
                className="w-full h-full"
                accept={FILE_INPUT_ACCEPT}
                file={selectedFile}
                onFileSelect={onFileSelect} />
        </div>
    );
}