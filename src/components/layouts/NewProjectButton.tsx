import { LuFolderPlus } from "react-icons/lu";
import useNewProjectStore from "../../stores/useNewProjectStore";
import Button from "../inputs/Button";

export default function NewProjectButton() {
    const dialogState = useNewProjectStore((state) => state.dialogState);

    return (
        <Button
            className="justify-self-end col-start-3"
            variant="container"
            onClick={dialogState?.show}>
            <LuFolderPlus />
            <span className="text-sm leading-4">New project</span>
        </Button>
    );
}