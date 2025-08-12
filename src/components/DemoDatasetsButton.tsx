import { LuArchive } from "react-icons/lu";
import Button from "./inputs/Button";

export default function DemoDatasetsButton(props: {
    className?: string,
    onClick?: () => void,
}) {
    return (
        <Button
            variant="container"
            className={props.className}
            onClick={props.onClick}>
            <LuArchive />
            <span className="text-sm leading-4">Demo datasets</span>
        </Button>
    );
}