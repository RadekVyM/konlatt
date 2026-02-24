import { LuArchive } from "react-icons/lu";
import Button from "./inputs/Button";
import useIsMaxSm from "../hooks/useIsMaxSm";

/**
 * Button component intended for triggering an action for displaying the demo datasets dialog.
*/
export default function DemoDatasetsButton(props: {
    className?: string,
    variant?: "container" | "dynamic-sm-container",
    onClick?: () => void,
}) {
    const variant = props.variant || "container";
    const isMaxSm = useIsMaxSm();

    return (
        <Button
            variant={variant}
            className={props.className}
            onClick={props.onClick}
            title={isMaxSm ? "Demo datasets" : undefined}>
            <LuArchive />
            <span className="text-sm leading-4">Demo datasets</span>
        </Button>
    );
}