import "./CodePreviewer.css";

export default function CodePreviewer(props: {
    title: string,
    content: string,
}) {
    const lines = props.content.split("\n");

    return (
        <div
            className="border border-outline rounded-md bg-surface flex flex-col mb-4">
            <small
                className="w-full border-b border-outline px-4 py-2 text-on-surface-muted">
                {props.title}
            </small>
            <div
                className="flex-1 py-2 grid grid-cols-[auto_1fr] auto-rows-fr gap-x-2 overflow-x-auto max-w-full cursor-text thin-scrollbar">

                {lines.map((line, index) =>
                    <pre
                        key={index}
                        data-line={index + 1}
                        className="code-line"
                        style={{
                            gridRowStart: index + 1,
                            gridRowEnd: index + 2,
                        }}>
                        {line}
                    </pre>)}

                <div
                    className="col-start-1 col-end-2 row-start-1 -my-2 border-r border-outline sticky left-0"
                    style={{
                        gridRowEnd: lines.length + 1,
                    }}>
                </div>
            </div>
        </div>
    );
}