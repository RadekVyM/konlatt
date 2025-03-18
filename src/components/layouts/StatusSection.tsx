import { LuLoaderCircle } from "react-icons/lu";
import useProjectStore from "../../hooks/stores/useProjectStore";
import { cn } from "../../utils/tailwind";
import { useRef } from "react";

export default function StatusSection(props: {
    className?: string,
}) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const progressMessage = useProjectStore((state) => state.progressMessage);
    const file = useProjectStore((state) => state.file);

    return (
        <div
            className={cn("flex flex-col items-center text-center max-w-80", props.className)}
            onPointerEnter={() => popoverRef.current?.showPopover()}
            onPointerLeave={() => popoverRef.current?.hidePopover()}>
            {file &&
                <span
                    className="text-sm text-on-surface line-clamp-1">
                    {file.name}
                </span>}
            {progressMessage &&
                <span
                    className="text-xs text-on-surface-muted flex items-center gap-1.5">
                    <LuLoaderCircle className="animate-spin" />
                    {progressMessage}
                </span>}

            <div
                ref={popoverRef}
                popover="auto"
                className="bg-surface-container shadow-2xl shadow-shade border border-outline-variant left-[50%] -translate-x-1/2 py-2 px-3 mt-1.5 rounded-lg w-full max-w-80">
                {file &&
                    <span
                        className="text-sm text-on-surface">
                        {file.name}
                    </span>}
            </div>
        </div>
    );
}