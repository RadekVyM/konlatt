import { cn } from "../utils/tailwind";

export default function PageContainer(props: {
    children: React.ReactNode,
    className?: string,
}) {
    return (
        <div
            className={cn("flex-1 max-h-full overflow-hidden pb-4 px-4", props.className)}>
            {props.children}
        </div>
    );
}