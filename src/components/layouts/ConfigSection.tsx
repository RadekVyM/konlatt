import { cn } from "../../utils/tailwind";

export default function ConfigSection(props: {
    heading?: React.ReactNode,
    children?: React.ReactNode,
    className?: string,
}) {
    return (
        <section
            className={cn("mb-5 flex flex-col gap-2", props.className)}>
            {props.heading &&
                <h3
                    className="font-semibold">
                    {props.heading}
                </h3>}
            {props.children}
        </section>
    );
}