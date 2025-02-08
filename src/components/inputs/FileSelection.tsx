import { useRef, useState } from "react";
import Button from "../inputs/Button";
import { cn } from "../../utils/tailwind";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "../variants/buttonVariants";
import { LuFile, LuFileUp } from "react-icons/lu";

export function FileSelection(props: {
    className?: string,
    children?: React.ReactNode,
    accept?: string,
    fileType?: string,
    file: File | null | undefined,
    onFileSelect: (file: File | null | undefined) => void,
}) {
    return (
        <FileSelectionBase
            className={cn(props.className, "grid grid-flow-col")}
            onFileSelect={props.onFileSelect}
            accept={props.accept}
            fileType={props.fileType}
            variant="container">
            <LuFile
                className="w-4 h-4"/>
            <span className="truncate">{props.file?.name || "Choose file"}</span>
        </FileSelectionBase>
    )
}

export function LargeFileSelection(props: {
    className?: string,
    children?: React.ReactNode,
    accept?: string,
    fileType?: string,
    file: File | null | undefined,
    onFileSelect: (file: File | null | undefined) => void,
}) {
    return (
        <FileSelectionBase
            className={cn(
                "grid place-content-center p-12 border-dashed text-on-surface-container-muted hover:text-on-surface-container-muted",
                "border-2 border-outline border-dashed",
                props.className)}
            onFileSelect={props.onFileSelect}
            accept={props.accept}
            fileType={props.fileType}>
            <div
                className="grid grid-flow-row justify-items-center gap-y-4">
                <LuFileUp
                    className="w-8 h-8"/>
                <span className="font-semibold">
                    {props.file?.name || <>Click to upload <span className="font-normal">or drag and drop</span></>}
                </span>
            </div>
        </FileSelectionBase>
    )
}

function FileSelectionBase(props: {
    className?: string,
    children?: React.ReactNode,
    accept?: string,
    fileType?: string,
    onFileSelect: (file: File | null | undefined) => void,
} & VariantProps<typeof buttonVariants>) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    function onDrop(e: React.DragEvent<HTMLElement>) {
        e.preventDefault();

        const file = getDragFile(e);

        if (file && (!props.fileType || file.type.startsWith(props.fileType))) {
            props.onFileSelect(file);

            if (inputRef.current) {
                inputRef.current.files = e.dataTransfer.files;
            }
        }
    }

    return (
        <>
            <Button
                className={cn(isDragOver && "bg-surface-dim-container", props.className)}
                variant={props.variant}
                size={props.size}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragOver(true)}
                onDragLeave={() => setIsDragOver(false)}
                onPointerLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}>
                {props.children}
            </Button>

            <input
                ref={inputRef}
                type="file"
                accept={props.accept}
                className="hidden"
                onChange={(e) => {
                    const item = e.target.files?.item(0);

                    if (item) {
                        props.onFileSelect(item);
                    }
                }} />
        </>
    )
}

function getDragFile(e: React.DragEvent<HTMLElement>) {
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const item = e.dataTransfer.items[0];
        if (item.kind === "file") {
            return item.getAsFile();
        }
    }
    else if (e.dataTransfer.files.length > 0) {
        return e.dataTransfer.files[0];
    }
    return null;
}