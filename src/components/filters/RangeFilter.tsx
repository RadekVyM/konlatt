import { cn } from "../../utils/tailwind";
import RangeSlider from "../inputs/RangeSlider";
import NumberInput from "../inputs/NumberInput";

export default function RangeFilter(props: {
    id: string,
    className?: string,
    maxCount: number,
    min: number,
    max: number,
    onMinChange: (value: number) => void,
    onMaxChange: (value: number) => void,
}) {
    return (
        <div
            className={cn("flex-1 px-5 py-1 max-h-full grid grid-cols-2 content-start gap-2", props.className)}>
            <NumberInput
                id={`${props.id}-min`}
                label="Min count"
                step={1}
                min={0}
                max={props.max}
                value={props.min}
                onChange={(value) => props.onMinChange(Math.min(Math.max(value, 0), props.max))} />
            <NumberInput
                id={`${props.id}-max`}
                label="Max count"
                step={1}
                min={props.min}
                max={props.maxCount}
                value={props.max}
                onChange={(value) => props.onMaxChange(Math.min(Math.max(value, props.min), props.maxCount))} />
            <RangeSlider
                className="col-span-2"
                min={0}
                max={props.maxCount}
                bottom={props.min}
                top={props.max}
                onBottomChange={props.onMinChange}
                onTopChange={props.onMaxChange} />
        </div>
    );
}