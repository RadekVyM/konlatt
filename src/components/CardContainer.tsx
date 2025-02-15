import { cn } from "../utils/tailwind";
import Container from "./Container";
import "./CardContainer.css";

export function CardContainer(props: {
    children?: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
}) {
    return (
        <Container
            as="section"
            className={cn("card-container relative overflow-clip", props.className)}
            style={props.style}>
            {props.children}
        </Container>
    );
}