import Container from "./Container";
import "./CardContainer.css";
import { cn } from "../../utils/tailwind";

/**
 * Layout wrapper for card-based content. 
 * Renders as a `<section>` with overflow clipping and relative positioning.
 */
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