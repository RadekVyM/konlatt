import { LuCircleHelp, LuExternalLink, LuGithub, LuScale } from "react-icons/lu";
import Button from "./inputs/Button";
import ContentDialog from "./ContentDialog";
import { DialogState } from "../types/DialogState";
import useDialog from "../hooks/useDialog";
import { cn } from "../utils/tailwind";

export default function AboutButton(props: {
    className?: string,
}) {
    const dialogState = useDialog();

    return (
        <>
            <Button
                className={props.className}
                variant="icon-default"
                onClick={dialogState.show}
                title="About">
                <LuCircleHelp />
            </Button>

            <AboutDialog
                state={dialogState} />
        </>
    );
}

function AboutDialog(props: {
    state: DialogState,
}) {
    return (
        <ContentDialog
            className="max-w-4xl max-h-full overflow-hidden px-0 pb-0"
            headerClassName="px-5"
            ref={props.state.dialogRef}
            state={props.state}
            heading="About">
            <DialogContent />
        </ContentDialog>
    );
}

function DialogContent() {
    return (
        <div
            className="px-5 pb-5 pt-3 max-h-full max-w-full overflow-y-auto thin-scrollbar">
            <Description />
        </div>
    );
}

function Description() {
    return (
        <>
            <p className="mb-4">
                Konlatt is a streamlined web application built for the intuitive visualization and analysis of concept lattices.
                It bridges the gap between complex Formal Concept Analysis (FCA) and user-friendly interaction,
                making conceptual data exploration accessible to anyone with a browser.
            </p>

            <h3 className="mb-2 font-bold">Core Functionality</h3>
            <List className="mb-6">
                <li><Highlighted>Intuitive Visualization:</Highlighted> Automatically render formal contexts into clean, readable Hasse diagrams.</li>
                <li><Highlighted>Smart Analysis:</Highlighted> Highlight specific parts of the lattice to uncover hidden dependencies.</li>
                <li><Highlighted>Manual Layout Control:</Highlighted> Click and drag nodes to fine-tune the visual structure for presentations or clarity.</li>
                <li><Highlighted>Ready-to-use Exports:</Highlighted> Download your finalized lattice directly for research papers or documentation.</li>
            </List>

            <h3 className="mb-2 font-bold text-lg">Built With</h3>
            <p className="mb-3">
                Konlatt leverages a modern web stack to ensure high performance and a seamless user experience without the need for local installations.
                Its source code is released under the MIT License, meaning you are free to use, modify, and distribute the software for both personal and commercial projects.
            </p>

            <div className="mb-5 flex gap-2">
                <Button
                    to="https://github.com/RadekVyM/konlatt"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="container"
                    size="sm">
                    <LuGithub /> Source Code <LuExternalLink className="inline-flex text-xs" />
                </Button>
                <Button
                    to="https://github.com/RadekVyM/konlatt/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="container"
                    size="sm">
                    <LuScale /> MIT License <LuExternalLink className="inline-flex text-xs" />
                </Button>
            </div>

            <h4 className="mb-2 font-bold">Core Stack & Tooling</h4>
            <List className="mb-4">
                <li>
                    <Link href="https://www.typescriptlang.org/">TypeScript</Link>
                </li>
                <li>
                    <Link href="https://isocpp.org/">C++</Link>
                </li>
                <li>
                    <Link href="https://emscripten.org/">Emscripten</Link>
                </li>
                <li>
                    <Link href="https://vite.dev/">Vite</Link>
                </li>
                <li>
                    <Link href="https://vite-pwa-org.netlify.app/">PWA Vite Plugin</Link>
                </li>
            </List>

            <h4 className="mb-2 font-bold">Frontend & State</h4>
            <List className="mb-4">
                <li>
                    <Link href="https://react.dev/">React</Link>
                </li>
                <li>
                    <Link href="https://reactrouter.com/">React Router</Link>
                </li>
                <li>
                    <Link href="https://zustand.docs.pmnd.rs/">Zustand</Link>
                </li>
            </List>

            <h4 className="mb-2 font-bold">Visualization</h4>
            <List className="mb-4">
                <li>
                    <Link href="https://threejs.org/">Three.js</Link>
                </li>
                <li>
                    <Link href="https://r3f.docs.pmnd.rs/">React Three Fiber</Link>
                </li>
                <li>
                    <Link href="https://drei.docs.pmnd.rs/">Drei</Link>
                </li>
                <li>
                    <Link href="https://bettertyped.github.io/react-zoom-pan-pinch">React Zoom Pan Pinch</Link>
                </li>
            </List>

            <h4 className="mb-2 font-bold">Styling & UI</h4>
            <List className="mb-4">
                <li>
                    <Link href="https://tailwindcss.com/">Tailwind CSS</Link>
                </li>
                <li>
                    <Link href="https://github.com/dcastil/tailwind-merge">tailwind-merge</Link>
                </li>
                <li>
                    <Link href="https://github.com/lukeed/clsx">clsx</Link>
                </li>
                <li>
                    <Link href="https://cva.style/docs">Class Variance Authority</Link>
                </li>
                <li>
                    <Link href="https://react-icons.github.io/react-icons/">React Icons</Link>
                    <List>
                        <li>
                            <Link href="https://lucide.dev/" className="mr-1.5">Lucide</Link>
                            <LinkTag href="https://lucide.dev/license">ISC License</LinkTag>
                        </li>
                    </List>
                </li>
            </List>

            <h4 className="mb-2 font-bold">Mathematics & Data</h4>
            <List className="mb-4">
                <li>
                    <span>
                        <Link href="https://libeigen.gitlab.io/" className="mr-1.5">Eigen</Link>
                        <LinkTag href="https://libeigen.gitlab.io/#license" className="mr-1">MPL2</LinkTag>
                        <LinkTag href="https://gitlab.com/libeigen/eigen">Source Code</LinkTag>
                    </span>
                </li>
                <li>
                    <Link href="https://github.com/NaturalIntelligence/fast-xml-parser">fast-xml-parser</Link>
                </li>
            </List>

            <h4 className="mb-2 font-bold">Algorithms</h4>
            <List>
                <li>
                    <Link href="https://www.researchgate.net/publication/228522038_In-Close_a_fast_algorithm_for_computing_formal_concepts">InClose</Link>
                </li>
                <li>
                    <Link href="https://www.researchgate.net/publication/220693390_Romano_G_Concept_Data_Analysis_Theory_and_Applications_Wiley_New_York">Concepts Cover</Link>
                </li>
                <li>
                    <Link href="https://en.wikipedia.org/wiki/Layered_graph_drawing">Sugiyama framework</Link>
                </li>
                <li>
                    <Link href="https://www.researchgate.net/publication/220923353_Automated_Lattice_Drawing">Ralph Freese, "Automated Lattice Drawing"</Link>
                </li>
                <li>
                    <Link href="https://arxiv.org/pdf/2102.02684">ReDraw</Link>
                </li>
                <li>
                    <Link href="https://link.springer.com/content/pdf/10.1007/3-540-45848-4_3">Brandes and Köpf, "Fast and Simple Horizontal Coordinate Assignment"</Link>
                </li>
                <li>
                    <Link href="https://kups.ub.uni-koeln.de/54863/1/zaik2002-433.pdf">Wilhelm Barth, Michael Jünger and Petra Mutzel, "Simple and Efficient Bilayer Cross Counting"</Link>
                </li>
            </List>
        </>
    );
}

function Highlighted(props: {
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <span
            className={cn("font-semibold", props.className)}>
            {props.children}
        </span>
    );
}

function Link(props: {
    href: string,
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <a
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("text-primary-dim hover:underline", props.className)}>
            {props.children} <LuExternalLink className="inline-flex text-xs mb-1" />
        </a>
    );
}

function LinkTag(props: {
    href: string,
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <a
            href={props.href}
            className={cn("hover:underline text-xs text-on-surface-container-muted border border-outline py-0.5 px-1 rounded-sm", props.className)}>
            {props.children} <LuExternalLink className="inline-flex text-xs mb-1" />
        </a>
    );
}

function List(props: {
    className?: string,
    children?: React.ReactNode,
}) {
    return (
        <ul className={cn("list-disc ml-5 marker:text-primary", props.className)}>
            {props.children}
        </ul>
    );
}