import { LuCheck, LuTrash } from "react-icons/lu";
import { DialogState } from "../../types/DialogState";
import ContentDialog from "../ContentDialog";
import Button from "../inputs/Button";

export default function FilterDialog(props: {
    state: DialogState,
    children?: React.ReactNode,
    clearDisabled?: boolean,
    onClearClick: () => void,
    onApplyClick: () => void,
}) {
    return (
        <ContentDialog
            className="max-w-xl max-h-[30rem] h-full overflow-hidden px-0"
            headerClassName="px-5"
            ref={props.state.dialogRef}
            state={props.state}
            heading="Filters">
            {props.children}
            <footer
                className="px-5 pt-3 flex gap-2 justify-between items-center">
                <Button
                    onClick={props.onClearClick}
                    size="sm"
                    disabled={props.clearDisabled}>
                    <LuTrash />
                    Clear filters
                </Button>
                <Button
                    variant="primary"
                    onClick={async () => {
                        await props.state.hide();
                        props.onApplyClick();
                    }}>
                    <LuCheck />
                    Apply filters
                </Button>
            </footer>
        </ContentDialog>
    );
}