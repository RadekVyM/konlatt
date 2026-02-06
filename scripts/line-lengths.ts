// npx vite-node ./scripts/line-lengths.ts
// NODE_OPTIONS="--expose-gc" npx vite-node ./scripts/line-lengths.ts

import MoviesFinal from "../datasets/MoviesFinal.cxt?raw";
import tealady from "../datasets/tealady.cxt?raw";
import nom5crx from "../datasets/nom5crx.cxt?raw";
import nom10crx from "../datasets/nom10crx.cxt?raw";
import adultCensus2 from "../datasets/adult-census2.cxt?raw";
import clujWeatherProject from "../datasets/Cluj Weather Project - GIS Evaluation.cxt?raw";
import MathematicalFunctions from "../datasets/Mathematical functions.cxt?raw";
import Family from "../datasets/Family.cxt?raw";
import Boardgames_BGG from "../datasets/Boardgames_BGG.cxt?raw";
import gewaesser from "../datasets/gewaesser.cxt?raw";
import WingspanBirds from "../datasets/Wingspan Birds.cxt?raw";
import parseBurmeister from "../src/services/parsing/burmeister";
import { computeConcepts } from "../src/services/concepts";
import { conceptsToLattice } from "../src/services/lattice";
import { convertToJson as convertConceptsToJson } from "../src/services/export/concepts/json";
import { convertToXml as convertConceptsToXml } from "../src/services/export/concepts/xml";
import { convertToSvg as convertDiagramToSvg } from "../src/services/export/diagram/svg";
import { convertToTikz as convertDiagramToTikz } from "../src/services/export/diagram/tikz";
import { FormalConcept } from "../src/types/FormalConcepts";
import { FormalContext } from "../src/types/FormalContext";
import { createPoint, Point } from "../src/types/Point";
import { Link } from "../src/types/Link";
import { ConceptLabel } from "../src/types/ConceptLabel";
import { createLabels, getLinks } from "../src/utils/diagram";
import { LabelGroup } from "../src/types/export/LabelGroup";
import { HsvaColor } from "../src/types/HsvaColor";

type Average = {
    average: number,
    averageTrimmed: number,
}

const datasets = [
    MoviesFinal,
    tealady,
    nom5crx,
    nom10crx,
    adultCensus2,
    clujWeatherProject,
    Family,
    MathematicalFunctions,
    Boardgames_BGG,
    gewaesser,
    WingspanBirds,
];

const conceptsAverageSums = {
    json: createDefaultAverage(),
    xml: createDefaultAverage(),
};

const diagramAverageSums = {
    svg: createDefaultAverage(),
    tikz: createDefaultAverage(),
};

for (const dataset of datasets) {
    forceGC();

    const context = parseBurmeister(dataset);
    const { concepts } = await computeConcepts(context);
    const { lattice } = await conceptsToLattice(concepts, context);
    const { layout, conceptToLayoutIndexesMapping } = generateLayout(concepts.length);
    const links = getLinks(concepts.map((c) => ({ conceptIndex: c.index })), lattice.subconceptsMapping, null, null, false);

    measureConcepts(context, concepts, lattice.subconceptsMapping);

    measureDiagram(
        layout,
        links,
        conceptToLayoutIndexesMapping,
        createLabels(
            "objects",
            context.objects,
            lattice.objectsLabeling,
            "bottom",
            { maxLineLength: 25, maxLinesCount: 3 }),
        createLabels(
            "attributes",
            context.attributes,
            lattice.attributesLabeling,
            "top",
            { maxLineLength: 25, maxLinesCount: 3 }));
}

printAverage(conceptsAverageSums.json, datasets.length, "concepts - JSON");
printAverage(conceptsAverageSums.xml, datasets.length, "concepts - XML");
printAverage(diagramAverageSums.svg, datasets.length, "diagram - SVG");
printAverage(diagramAverageSums.tikz, datasets.length, "diagram - TikZ");


function generateLayout(nodesCount: number) {
    const layout = new Array<Point>(nodesCount);
    const conceptToLayoutIndexesMapping = new Map<number, number>();

    for (let i = 0; i < nodesCount; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        layout[i] = createPoint(x, y, 0);
        conceptToLayoutIndexesMapping.set(i, i);
    }

    return {
        layout,
        conceptToLayoutIndexesMapping,
    };
}

function measureConcepts(
    context: FormalContext,
    concepts: Array<FormalConcept>,
    latticeRelation: ReadonlyArray<Set<number>>
) {
    const name = "Just a name";

    {
        const json = convertConceptsToJson(
            context.objects,
            context.attributes,
            concepts,
            name,
            latticeRelation);

        const jsonAverages = averageLength(json.lines);

        conceptsAverageSums.json.average += jsonAverages.average;
        conceptsAverageSums.json.averageTrimmed += jsonAverages.averageTrimmed;
    }

    forceGC();

    {
        const xml = convertConceptsToXml(
            context.objects,
            context.attributes,
            concepts,
            name,
            latticeRelation);

        const xmlAverages = averageLength(xml.lines);

        conceptsAverageSums.xml.average += xmlAverages.average;
        conceptsAverageSums.xml.averageTrimmed += xmlAverages.averageTrimmed;
    }

    forceGC();
}

function measureDiagram(
    layout: Array<Point>,
    links: Array<Link>,
    conceptToLayoutIndexesMapping: Map<number, number>,
    attributeLabels: Array<ConceptLabel>,
    objectLabels: Array<ConceptLabel>
) {
    {
        const color: HsvaColor = { hue: 0, saturation: 0, value: 0, alpha: 1 };
        const svg = convertDiagramToSvg(
            layout,
            links,
            conceptToLayoutIndexesMapping,
            { width: 100, height: 100, centerX: 0, centerY: 0, scale: 1 },
            [
                ...attributeLabels.map(conceptLabelToLabelGroup),
                ...objectLabels.map(conceptLabelToLabelGroup),
            ],
            {
                nodeRadius: 4,
                linkThickness: 2,
                backgroundColor: color,
                defaultNodeColor: color,
                defaultLinkColor: color,
                font: "Arial",
                textBackgroundType: "box",
                textSize: 12,
                textColor: color,
                textBackgroundColor: color,
                textOutlineColor: color,
            });

        const svgAverages = averageLength(svg.lines);

        diagramAverageSums.svg.average += svgAverages.average;
        diagramAverageSums.svg.averageTrimmed += svgAverages.averageTrimmed;
    }

    forceGC();

    {
        const xml = convertDiagramToTikz(
            layout,
            links,
            conceptToLayoutIndexesMapping,
            attributeLabels,
            objectLabels);

        const tikzAverages = averageLength(xml.lines);

        diagramAverageSums.tikz.average += tikzAverages.average;
        diagramAverageSums.tikz.averageTrimmed += tikzAverages.averageTrimmed;
    }

    forceGC();
}

function printAverage(averageSum: Average, count: number, prefix: string) {
    const average = averageSum.average / count;
    const averageTrimmed = averageSum.averageTrimmed / count;

    console.log(`${prefix}: [${average}, ${averageTrimmed} - ${(average + averageTrimmed) / 2}]`);
}

function conceptLabelToLabelGroup(label: ConceptLabel): LabelGroup {
    return {
        layoutIndex: label.conceptIndex,
        placement: label.placement,
        relativeRect: { width: 20, height: 5, x: 0, y: 0 },
        labels: label.text.split("\n").map((line) => ({ text: line, relativeRect: { width: 20, height: 5, x: 0, y: 0 } })),
    };
}

function createDefaultAverage(): Average {
    return {
        average: 0,
        averageTrimmed: 0,
    };
}

function averageLength(lines: Array<string>) {
    const sum = lines.reduce((previous, current) => previous + current.length, 0);
    const sumTrimmed = lines.reduce((previous, current) => previous + current.trim().length, 0);

    return {
        average: sum / lines.length,
        averageTrimmed: sumTrimmed / lines.length,
    };
}

function forceGC() {
    const gc = (globalThis as any).gc;
    if (typeof gc === "function") {
        gc();
    }
    else {
        console.warn("GC not exposed. Run with --expose-gc");
    }
}