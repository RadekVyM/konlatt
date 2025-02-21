export default function HighlightedSearchTerms(props: {
    text: string,
    regex?: RegExp,
}) {
    if (!props.regex) {
        return props.text;
    }

    return (
        <span>
            {props.text
                .split(props.regex)
                .filter((s) => s.length > 0)
                .map((s, index) => {
                    props.regex!.lastIndex = 0;
                    return props.regex!.test(s) ?
                        <span key={index} className="text-primary bg-primary-lite rounded-xs">{s}</span> :
                        s;
                })}
        </span>
    );
}