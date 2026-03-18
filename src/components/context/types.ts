export type ContextItem = {
    index: number,
    title: string
}

export type ContextCompleteItem = {
    items: ReadonlyArray<ContextItem>
} & ContextItem
