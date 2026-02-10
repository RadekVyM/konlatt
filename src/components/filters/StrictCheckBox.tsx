import CheckBox from "../inputs/CheckBox";

export default function StrictCheckBox(props: {
    checked: boolean,
    onChange: (value: boolean) => void,
}) {
    return (
        <CheckBox
            className="mx-6.5 mb-2"
            checked={props.checked}
            onChange={(e) => props.onChange(e.currentTarget.checked)}>
            Use strict filtering
        </CheckBox>
    );
}