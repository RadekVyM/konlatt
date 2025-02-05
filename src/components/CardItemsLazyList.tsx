import { RefObject } from "react";
import { cn } from "../utils/tailwind";

export default function CardItemsLazyList(props: {
    observerTargetRef: RefObject<HTMLDivElement | null>,
    children: React.ReactNode,
    className?: string,
}) {
    return (
        <div
            className={cn("overflow-y-auto thin-scrollbar", props.className)}>
            <ul className="px-1 pb-2">
                {props.children}
            </ul>

            <div ref={props.observerTargetRef} className="h-0.5"></div>
        </div>
    );
}