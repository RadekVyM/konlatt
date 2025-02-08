import { cn } from "../utils/tailwind";
import Container from "./Container";

export function CardSection(props: {
    children?: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
}) {
    return (
        <Container
            as="section"
            className={cn("pt-3 flex flex-col overflow-hidden", props.className)}
            style={props.style}>
            {props.children}
        </Container>
    );
}