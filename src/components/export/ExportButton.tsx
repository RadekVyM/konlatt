import { LuDownload } from "react-icons/lu";
import Button from "../inputs/Button";
import ExportDialog from "./ExportDialog";
import { useNavigate } from "react-router-dom";

export default function ExportButton(props: {
    className?: string,
    isHighlighted?: boolean,
    route: string,
}) {
    const navigate = useNavigate();

    return (
        <>
            <Button
                className={props.className}
                title="Export"
                variant={props.isHighlighted ? "icon-secondary" : "icon-default"}
                size={props.isHighlighted ? "default" : "sm"}
                onClick={() => navigate(props.route)}>
                <LuDownload />
            </Button>
            
            <ExportDialog
                route={props.route} />
        </>
    );
}