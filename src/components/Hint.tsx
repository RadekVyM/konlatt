import { LuCircleHelp } from "react-icons/lu";
import Tooltip from "./Tooltip";
import { useRef } from "react";
import { cn } from "../utils/tailwind";

export default function Hint(props: {
    text: React.ReactNode,
    className?: string,
}) {
    const iconRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <div
                ref={iconRef}
                className={cn("rounded-full", props.className)}
                tabIndex={0}>
                <LuCircleHelp
                    className="scale-90" />
            </div>
            <Tooltip
                tooltip={props.text}
                elementRef={iconRef} />
        </>
    );
}