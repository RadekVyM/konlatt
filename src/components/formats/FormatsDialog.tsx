import { useState } from "react";
import { DialogState } from "../../types/DialogState";
import { cn } from "../../utils/tailwind";
import ContentDialog from "../ContentDialog";
import Button from "../inputs/Button";
import CodePreviewer from "./CodePreviewer";
import HorizontalScroller from "../HorizontalScroller";
import { FormalContext, getAttributeObjects, getObjectAttributes } from "../../types/FormalContext";
import { convertToJson as convertItemsToJson } from "../../services/export/context-items/json";
import { convertToXml as convertItemsToXml } from "../../services/export/context-items/xml";
import { convertToBurmeister } from "../../services/export/context/burmeister";
import { convertToCsv as convertItemsToCsv } from "../../services/export/context-items/csv";
import { convertToJson as convertContextToJson } from "../../services/export/context/json";
import { convertToXml as convertContextToXml } from "../../services/export/context/xml";
import { convertToCsv as convertContextToCsv } from "../../services/export/context/csv";
import { convertToJson as convertItemToJson } from "../../services/export/context-item/json";
import { convertToXml as convertItemToXml } from "../../services/export/context-item/xml";
import { convertToCsv } from "../../services/export/context-item/csv";
import parseJson from "../../services/parsing/json";
import { FormalConcepts } from "../../types/FormalConcepts";
import { ConceptLattice } from "../../types/ConceptLattice";
import { convertToJson as convertConceptsToJson } from "../../services/export/concepts/json";
import { convertToXml } from "../../services/export/concepts/xml";

const { context: CONTEXT, concepts: CONCEPTS, lattice: LATTICE } = parseJson(`{
	"name": "Inner planets",
	"objects": ["Mercury", "Venus", "Earth", "Mars"],
	"attributes": ["Is_Terrestrial", "Has_Moons", "Is_Habitable", "Has_Dense_Atmosphere"],
	"concepts": [
		{
			"objects": [0, 1, 2, 3],
			"attributes": [0]
		},
		{
			"objects": [2, 3],
			"attributes": [0, 1]
		},
		{
			"objects": [1, 2],
			"attributes": [0, 3]
		},
		{
			"objects": [2],
			"attributes": [0, 1, 2, 3]
		}
	],
	"lattice": [
		[1, 0],
		[2, 0],
		[3, 1],
		[3, 2]
	]
}`) as {
    context: FormalContext,
    concepts: FormalConcepts,
    lattice: ConceptLattice,
};

type ExportedObjectId = "context" |
    "objects" |
    "object" |
    "attributes" |
    "attribute" |
    "concepts" |
    "concept"

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
    defaultFormatId: FormatId,
    formats: Array<Format>,
    description?: React.ReactNode,
}

type FormatBase = {
    id: FormatId,
    title: string,
    suffix?: string,
    isInput?: boolean,
    isOutput?: boolean,
}

type Format = {
    example: Array<string>,
    description?: React.ReactNode,
} & FormatBase

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

const KONLATT_CSV: FormatBase = {
    id: "csv",
    title: "CSV",
    suffix: "csv",
}

const EXPORTED_OBJECTS: Array<ExportedObject> = [
    {
        id: "context",
        title: "Formal context",
        defaultFormatId: "burmeister",
        formats: [
            {
                id: "burmeister",
                title: "Burmeister",
                suffix: "cxt",
                isInput: true,
                isOutput: true,
                example: convertToBurmeister(CONTEXT.name ?? "", CONTEXT).lines,
            },
            {
                ...KONLATT_JSON,
                isInput: true,
                isOutput: true,
                example: convertContextToJson(CONTEXT.name ?? "", CONTEXT).lines,
            },
            {
                ...KONLATT_XML,
                isInput: true,
                isOutput: true,
                example: convertContextToXml(CONTEXT.name ?? "", CONTEXT).lines,
            },
            {
                ...KONLATT_CSV,
                isInput: true,
                isOutput: true,
                example: convertContextToCsv(CONTEXT).lines,
            },
        ],
    },
    {
        id: "objects",
        title: "Objects",
        defaultFormatId: "konlatt-json",
        formats: [
            {
                ...KONLATT_JSON,
                isOutput: true,
                example: convertItemsToJson(CONTEXT.objects),
            },
            {
                ...KONLATT_XML,
                isOutput: true,
                example: convertItemsToXml(CONTEXT.objects, "object"),
            },
            {
                ...KONLATT_CSV,
                isOutput: true,
                example: convertItemsToCsv(CONTEXT.objects),
            },
        ],
    },
    {
        id: "object",
        title: "Object",
        defaultFormatId: "konlatt-json",
        formats: [
            {
                ...KONLATT_JSON,
                isOutput: true,
                example: convertItemToJson(
                    getObjectAttributes(CONTEXT, 1).map((attr) => CONTEXT.attributes[attr]),
                    CONTEXT.objects[1],
                    "object"
                ).lines,
            },
            {
                ...KONLATT_XML,
                isOutput: true,
                example: convertItemToXml(
                    getObjectAttributes(CONTEXT, 1).map((attr) => CONTEXT.attributes[attr]),
                    CONTEXT.objects[1],
                    "object"
                ).lines,
            },
            {
                ...KONLATT_CSV,
                isOutput: true,
                example: convertToCsv(getObjectAttributes(CONTEXT, 1).map((attr) => CONTEXT.attributes[attr])),
            },
        ],
    },
    {
        id: "attributes",
        title: "Attributes",
        defaultFormatId: "konlatt-json",
        formats: [
            {
                ...KONLATT_JSON,
                isOutput: true,
                example: convertItemsToJson(CONTEXT.attributes),
            },
            {
                ...KONLATT_XML,
                isOutput: true,
                example: convertItemsToXml(CONTEXT.attributes, "attribute"),
            },
            {
                ...KONLATT_CSV,
                isOutput: true,
                example: convertItemsToCsv(CONTEXT.attributes),
            },
        ],
    },
    {
        id: "attribute",
        title: "Attribute",
        defaultFormatId: "konlatt-json",
        formats: [
            {
                ...KONLATT_JSON,
                isOutput: true,
                example: convertItemToJson(
                    getAttributeObjects(CONTEXT, 1).map((obj) => CONTEXT.objects[obj]),
                    CONTEXT.attributes[1],
                    "attribute"
                ).lines,
            },
            {
                ...KONLATT_XML,
                isOutput: true,
                example: convertItemToXml(
                    getAttributeObjects(CONTEXT, 1).map((obj) => CONTEXT.objects[obj]),
                    CONTEXT.attributes[1],
                    "attribute"
                ).lines,
            },
            {
                ...KONLATT_CSV,
                isOutput: true,
                example: convertToCsv(getAttributeObjects(CONTEXT, 1).map((obj) => CONTEXT.objects[obj])),
            },
        ],
    },
    {
        id: "concepts",
        title: "Formal concepts",
        defaultFormatId: "konlatt-json",
        formats: [
            {
                ...KONLATT_JSON,
                isOutput: true,
                isInput: true,
                example: convertConceptsToJson(CONTEXT.objects, CONTEXT.attributes, CONCEPTS, CONTEXT.name ?? "", LATTICE.superconceptsMapping).lines,
            },
            {
                ...KONLATT_XML,
                isOutput: true,
                isInput: true,
                example: convertToXml(CONTEXT.objects, CONTEXT.attributes, CONCEPTS, CONTEXT.name ?? "", LATTICE.superconceptsMapping).lines,
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
            className="px-5 grid grid-cols-1 md:grid-cols-[calc(100%-15rem)_1fr] gap-5 max-h-full max-w-full overflow-y-auto thin-scrollbar">
            <div
                className="col-start-2 hidden md:block">
                <Contents
                    scrolledToExportedObjectId={scrolledToExportedObjectId} />
            </div>
            <div
                className="col-start-1 col-end-2 row-start-1 overflow-x-clip">
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

            {selectedFormat &&
                <>
                    <InputOutputList
                        format={selectedFormat} />

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
    format: Format,
}) {
    if (!props.format.isInput && !props.format.isOutput) {
        return undefined;
    }

    return (
        <div
            className="flex gap-2 mb-4">
            {props.format.isInput &&
                <Pill>
                    Input
                </Pill>}
            {props.format.isOutput &&
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