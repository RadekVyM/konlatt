import { useState } from "react";
import { DialogState } from "../../types/DialogState";
import { cn } from "../../utils/tailwind";
import ContentDialog from "../ContentDialog";
import burmeisterContextExample from "./examples/context.cxt?raw";
import jsonContextExample from "./examples/context.json?raw";
import csvContextExample from "./examples/context.csv?raw";
import xmlContextExample from "./examples/context.xml?raw";
import Button from "../inputs/Button";
import CodePreviewer from "./CodePreviewer";
import HorizontalScroller from "../HorizontalScroller";

type ExportedObjectId = "context" |
    "objects" |
    "attributes" |
    "concepts" |
    "lattice"

type FormatId = "burmeister" |
    "konlatt-json" |
    "konlatt-xml" |
    "csv" |
    "html" |
    "latex" |
    "png" |
    "jpg" |
    "svg" |
    ""

type ExportedObject = {
    id: ExportedObjectId,
    title: string,
    isInput?: boolean,
    isOutput?: boolean,
    defaultFormatId: FormatId,
    formats: Array<Format>,
    description?: React.ReactNode,
}

type FormatBase = {
    id: FormatId,
    title: string,
    suffix?: string,
}

type Format = {
    id: FormatId,
    title: string,
    suffix?: string,
    example: string,
    description?: React.ReactNode,
}

const KONLATT_JSON: FormatBase = {
    id: "konlatt-json",
    title: "Konlatt JSON",
    suffix: "json",
}

const KONLATT_XML: FormatBase = {
    id: "konlatt-xml",
    title: "Konlatt XML",
    suffix: "xml",
}

const EXPORTED_OBJECTS: Array<ExportedObject> = [
    {
        id: "context",
        title: "Formal context",
        isInput: true,
        isOutput: true,
        defaultFormatId: "burmeister",
        formats: [
            {
                id: "burmeister",
                title: "Burmeister",
                suffix: "cxt",
                example: burmeisterContextExample,
            },
            {
                ...KONLATT_JSON,
                example: jsonContextExample,
            },
            {
                ...KONLATT_XML,
                example: xmlContextExample,
            },
            {
                id: "csv",
                title: "CSV",
                suffix: "csv",
                example: csvContextExample,
            },
        ],
    },
    {
        id: "objects",
        title: "Objects",
        isOutput: true,
        defaultFormatId: "konlatt-json",
        formats: [
            {
                ...KONLATT_JSON,
                example: jsonContextExample,
            },
            {
                ...KONLATT_XML,
                example: xmlContextExample,
            },
        ],
    },
    {
        id: "attributes",
        title: "Attributes",
        isOutput: true,
        defaultFormatId: "konlatt-json",
        formats: [
            {
                ...KONLATT_JSON,
                example: jsonContextExample,
            },
            {
                ...KONLATT_XML,
                example: xmlContextExample,
            },
        ],
    },
    {
        id: "concepts",
        title: "Formal concepts",
        isOutput: true,
        isInput: true,
        defaultFormatId: "konlatt-json",
        formats: [
            {
                ...KONLATT_JSON,
                example: jsonContextExample,
            },
            {
                ...KONLATT_XML,
                example: xmlContextExample,
            },
        ],
    },
    {
        id: "lattice",
        title: "Concept lattice",
        isOutput: true,
        defaultFormatId: "konlatt-json",
        formats: [
            {
                ...KONLATT_JSON,
                example: jsonContextExample,
            },
            {
                ...KONLATT_XML,
                example: xmlContextExample,
            },
        ],
    },
];

export default function FormatsDialog(props: {
    state: DialogState,
    formatTitleId?: FormatId,
}) {
    return (
        <ContentDialog
            className="max-w-5xl max-h-full overflow-hidden px-0 pb-0"
            headerClassName="px-5"
            ref={props.state.dialogRef}
            state={props.state}
            heading="Supported formats">
            <DialogContent />
        </ContentDialog>
    );
}

function DialogContent() {
    const { scrolledToExportedObjectId, onScroll } = useScrolledToExportedObject();

    return (
        <div
            onScroll={onScroll}
            className="px-5 grid grid-cols-1 md:grid-cols-[1fr_15rem] gap-5 max-h-full overflow-y-auto thin-scrollbar">
            <div
                className="col-start-2 hidden md:block">
                <Contents
                    scrolledToExportedObjectId={scrolledToExportedObjectId} />
            </div>
            <div
                className="col-start-1 col-end-2 row-start-1">
                {EXPORTED_OBJECTS.map((exportedObject) =>
                    <ExportedObjectSection
                        key={exportedObject.id}
                        exportedObject={exportedObject} />)}
            </div>
        </div>
    );
}

function Contents(props: {
    scrolledToExportedObjectId: ExportedObjectId,
}) {
    return (
        <div
            className="sticky top-4 border-l border-outline pl-5 mt-4">
            <Title className="text-base">Contents</Title>

            <ul
                className="flex flex-col gap-1">
                {EXPORTED_OBJECTS.map((exportedObject) =>
                    <li
                        key={exportedObject.id}>
                        <ContentsLink
                            formatId={exportedObject.id}
                            className={cn(props.scrolledToExportedObjectId === exportedObject.id && "text-on-surface-container")}>
                            {exportedObject.title}
                        </ContentsLink>
                    </li>)}
            </ul>
        </div>
    );
}

function ContentsLink(props: {
    formatId: string,
    children: React.ReactNode,
    className?: string,
}) {
    return (
        <a
            className={cn("hover:text-on-surface-container transition-colors text-sm text-on-surface-container-muted", props.className)}
            href={`#${props.formatId}`}
            onClick={(e) => {
                e.preventDefault();
                document.querySelector(`#${props.formatId}`)?.scrollIntoView({
                    behavior: "smooth",
                });
            }}>
            {props.children}
        </a>
    );
}

function ExportedObjectSection(props: {
    exportedObject: ExportedObject,
}) {
    const [selectedFormatId, setSelectedFormatId] = useState<string>(props.exportedObject.defaultFormatId);
    const selectedFormat = props.exportedObject.formats.find((format) => format.id === selectedFormatId);

    return (
        <section
            className="mb-4 isolate"
            id={props.exportedObject.id}>
            <div
                className="pt-4 -mx-1 px-1 sticky top-0 bottom-0 z-20 bg-surface-container">
                <Title>
                    {props.exportedObject.title}
                </Title>
            </div>

            {props.exportedObject.description &&
                <p
                    className="mb-4">
                    {props.exportedObject.description}
                </p>}

            <HorizontalScroller
                className="mb-3">
                {props.exportedObject.formats.map((format) =>
                    <Button
                        key={format.id}
                        size="sm"
                        className="w-fit text-nowrap"
                        variant={selectedFormatId === format.id ? "primary" : "default"}
                        onClick={() => setSelectedFormatId(format.id)}>
                        {format.title}
                    </Button>)}
            </HorizontalScroller>

            <InputOutputList
                exportedObject={props.exportedObject} />

            {selectedFormat &&
                <>
                    {selectedFormat.description &&
                        <p
                            className="mb-3">
                            {selectedFormat.description}
                        </p>}
                    <CodePreviewer
                        title={`${props.exportedObject.title}.${selectedFormat.suffix}`}
                        content={selectedFormat.example} />
                </>}
        </section>
    );
}

function Title(props: {
    children: React.ReactNode,
    id?: string,
    as?: "h3" | "h4",
    className?: string,
}) {
    const HeaderElem = props.as || "h3";

    return (
        <HeaderElem
            id={props.id}
            className={cn("pb-2 font-semibold text-lg", props.className)}>
            {props.children}
        </HeaderElem>
    );
}

function Pill(props: {
    children?: React.ReactNode,
}) {
    return (
        <div
            className="text-xs bg-primary-lite text-primary-dim px-2 py-0.5 rounded-md font-semibold flex gap-1.5 items-center">
            {props.children}
        </div>
    );
}

function InputOutputList(props: {
    exportedObject: ExportedObject,
}) {
    if (!props.exportedObject.isInput && !props.exportedObject.isOutput) {
        return undefined;
    }

    return (
        <div
            className="flex gap-2 mb-4">
            {props.exportedObject.isInput &&
                <Pill>
                    Input
                </Pill>}
            {props.exportedObject.isOutput &&
                <Pill>
                    Output
                </Pill>}
        </div>
    );
}

function useScrolledToExportedObject() {
    const [scrolledToExportedObjectId, setScrolledToExportedObjectId] = useState<ExportedObjectId>("context");

    function onScroll(e: React.UIEvent<HTMLDivElement, UIEvent>) {
        const sections = [...e.currentTarget.querySelectorAll<HTMLElement>(":scope > * > section")];
        const scrollTop = e.currentTarget.scrollTop;
        const scrollHeight = e.currentTarget.scrollHeight;
        const containerOffsetTop = e.currentTarget.offsetTop;

        if (Math.abs(scrollTop - scrollHeight) < 0.8) {
            const section = sections[sections.length - 1];
            // Danger ahead...
            setScrolledToExportedObjectId(section.id as ExportedObjectId);
            return;
        }

        for (const section of sections) {
            const detectEarlierOffset = 50;
            const offsetTop = section.offsetTop - containerOffsetTop - detectEarlierOffset;

            if (scrollTop >= offsetTop && scrollTop < offsetTop + section.offsetHeight) {
                // Danger ahead...
                setScrolledToExportedObjectId(section.id as ExportedObjectId);
                return;
            }
        }
    }

    return {
        scrolledToExportedObjectId,
        onScroll,
    };
}