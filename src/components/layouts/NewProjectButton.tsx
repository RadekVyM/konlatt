import { LuFilePlus } from "react-icons/lu";
import useNewProjectStore from "../../stores/useNewProjectStore";
import Button from "../inputs/Button";
import useIsMaxSm from "../../hooks/useIsMaxSm";
import useIsMaxXs from "../../hooks/useIsMaxXs";

/**
 * Specialized button component that triggers the `NewProjectDialog`.
 */
export default function NewProjectButton(props: {
    variant?: "dynamic-sm-container",
}) {
    const variant = props.variant || "dynamic-xs-container";
    const isMaxSm = useIsMaxSm();
    const isMaxXs = useIsMaxXs();
    const dialogState = useNewProjectStore((state) => state.dialogState);

    const showTitle = (isMaxSm && variant === "dynamic-sm-container") ||
        (isMaxXs && variant === "dynamic-xs-container");

    return (
        <Button
            className="justify-self-end col-start-3"
            variant={variant}
            onClick={dialogState?.show}
            title={showTitle ? "New project" : undefined}>
            <LuFilePlus />
            <span className="text-sm leading-4">New project</span>
        </Button>
    );
}