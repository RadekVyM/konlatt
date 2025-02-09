import { LuChevronLeft } from "react-icons/lu";
import Button from "./inputs/Button";

export default function BackButton(props: {
    children?: React.ReactNode,
    onClick: () => void,
}) {
    return (
        <Button
            size="sm"
            className="pl-1 ml-2 mb-1"
            onClick={props.onClick}>
            <LuChevronLeft />
            {props.children}
        </Button>
    );
}