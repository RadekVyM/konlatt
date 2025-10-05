import { LuDownload } from "react-icons/lu";
import Button from "../inputs/Button";
import ExportDialog from "./ExportDialog";
import { useNavigate } from "react-router-dom";
import { ExportItem } from "./types/ExportItem";
import { ExportButtonProps } from "./types/ExportButtonProps";
import { SelectedFormatStoreType } from "../../stores/export/types/SelectedFormatStoreType";

export default function ExportButton<TKey extends string>(props: {
    isHighlighted?: boolean,
    items: Array<ExportItem<TKey>>,
    useSelectedFormatStore: SelectedFormatStoreType<TKey>,
    disabled?: boolean,
    content?: React.ReactNode,
} & ExportButtonProps) {
    const navigate = useNavigate();

    return (
        <>
            <Button
                className={props.className}
                title="Export"
                disabled={props.disabled}
                variant={props.isHighlighted ? "icon-secondary" : "icon-default"}
                size={props.isHighlighted ? "default" : "sm"}
                onClick={() => navigate(props.route)}>
                <LuDownload />
            </Button>

            <ExportDialog
                route={props.route}
                items={props.items}
                useSelectedFormatStore={props.useSelectedFormatStore}
                content={props.content}
                onShowing={props.onShowing}
                onShown={props.onShown}
                onHiding={props.onHiding}
                onHidden={props.onHidden} />
        </>
    );
}