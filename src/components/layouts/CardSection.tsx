import { cn } from "../../utils/tailwind";

export default function CardSection(props: {
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <div
            className={cn("pt-3 flex flex-col overflow-hidden bg-inherit absolute top-0 left-0 bottom-0 right-0", props.className)}>
            {props.children}
        </div>
    )
}