import { NodeOffsetMemento } from "./NodeOffsetMemento";

export type DiagramOffsetMementos = { undos: ReadonlyArray<NodeOffsetMemento>, redos: ReadonlyArray<NodeOffsetMemento> }