import { cn } from "../../utils/tailwind";

export default function InputLabel(props: {
    children?: React.ReactNode,
    className?: string,
} & React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            {...props}
            className={cn("text-sm mb-0.5 block", props.className)} />
    );
}