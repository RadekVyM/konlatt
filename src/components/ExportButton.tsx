import { LuDownload } from "react-icons/lu";
import Button from "./inputs/Button";

export default function ExportButton(props: {
    className?: string,
}) {
    return (
        <Button
            className={props.className}
            title="Export"
            variant="icon-default"
            size="sm">
            <LuDownload />
        </Button>
    );
}