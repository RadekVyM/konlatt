export type ExportItem<TKey extends string> = {
    key: TKey,
    label: string,
    options?: () => React.ReactNode,
    content: () => React.ReactNode,
}