import { LuInfo } from "react-icons/lu";
import useDialog from "../../hooks/useDialog";
import Button from "../inputs/Button";
import FormatsDialog from "./FormatsDialog";

export default function FormatsButton(props: {
    className?: string,
    withText?: boolean,
}) {
    const dialogState = useDialog();

    return (
        <>
            <Button
                className={props.className}
                variant={props.withText ? "container" : "icon-container"}
                onClick={dialogState.show}>
                <LuInfo />
                {props.withText &&
                    <span className="text-sm leading-4">Supported formats</span>}
            </Button>

            <FormatsDialog
                state={dialogState} />
        </>
    );
}