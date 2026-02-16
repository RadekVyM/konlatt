import { Billboard, Text } from "@react-three/drei";
import { themedColor } from "./diagram/utils";
import { LABEL_COLOR_DARK, LABEL_COLOR_LIGHT } from "../../constants/canvas-drawing";
import { Point } from "../../types/Point";
import useGlobalsStore from "../../stores/useGlobalsStore";

export default function R3FLabel(props: {
    id: string,
    position?: Point,
    textPosition: Point,
    renderOrder: number,
    depthTest: boolean,
    text: string,
    anchorY: "top" | "bottom",
    visible: boolean,
    scale: number
}) {
    const currentTheme = useGlobalsStore((state) => state.currentTheme);

    return (
        <Billboard
            position={props.position}
            visible={props.visible}
            scale={props.scale}>
            <Text
                key={`${props.id}-${currentTheme}`}
                color={themedColor(LABEL_COLOR_LIGHT, LABEL_COLOR_DARK, currentTheme)}
                anchorX="center"
                anchorY={props.anchorY}
                position={props.textPosition}
                textAlign="center"
                outlineWidth={0.01}
                outlineColor={themedColor(LABEL_COLOR_DARK, LABEL_COLOR_LIGHT, currentTheme)}
                fontWeight={600}
                fontSize={0.09}
                renderOrder={props.renderOrder}>
                <meshBasicMaterial depthTest={props.depthTest} depthWrite={props.depthTest} />
                {props.text}
            </Text>
        </Billboard>
    );
}