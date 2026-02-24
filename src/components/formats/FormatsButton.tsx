import { LuInfo } from "react-icons/lu";
import useDialog from "../../hooks/useDialog";
import Button from "../inputs/Button";
import FormatsDialog from "./FormatsDialog";
import useIsMaxSm from "../../hooks/useIsMaxSm";

/**
 * Button component that triggers a dialog displaying supported file formats.
 */
export default function FormatsButton(props: {
    className?: string,
    variant?: "container" | "icon-container" | "dynamic-sm-container",
    disabled?: boolean,
}) {
    const variant = props.variant || "icon-container";
    const withText = variant !== "icon-container";
    const isMaxSm = useIsMaxSm();
    const dialogState = useDialog();

    return (
        <>
            <Button
                className={props.className}
                title={isMaxSm || !withText ? "Supported formats" : undefined}
                variant={variant}
                onClick={dialogState.show}
                disabled={props.disabled}>
                <LuInfo />
                {withText &&
                    <span className="text-sm leading-4">Supported formats</span>}
            </Button>

            <FormatsDialog
                state={dialogState} />
        </>
    );
}