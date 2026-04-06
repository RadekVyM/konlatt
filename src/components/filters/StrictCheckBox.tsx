import Hint from "../Hint";
import CheckBox from "../inputs/CheckBox";

/**
 * Specialized checkbox for toggling "strict filtering" logic.
 */
export default function StrictCheckBox(props: {
    checked: boolean,
    onChange: (value: boolean) => void,
}) {
    return (
        <CheckBox
            className="mx-6.5 mb-2 mt-1"
            checked={props.checked}
            onChange={(e) => props.onChange(e.currentTarget.checked)}>
            Match all filters
            <Hint
                text={<>
                    When checked, items must match all selected filters.<br/>Otherwise, items matching any selected filter are shown.
                </>} />
        </CheckBox>
    );
}