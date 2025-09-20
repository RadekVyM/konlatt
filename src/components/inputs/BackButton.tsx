import { LuChevronLeft } from "react-icons/lu";
import Button from "./Button";

export default function BackButton(props: {
    children?: React.ReactNode,
    onClick: () => void,
}) {
    return (
        <Button
            size="sm"
            className="pl-1 ml-2 mb-1.5"
            onClick={props.onClick}>
            <LuChevronLeft />
            <span
                className="line-clamp-1 text-start">
                {props.children}
            </span>
        </Button>
    );
}