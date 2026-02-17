/**
 * Performs a Breadth-First Search (BFS) traversal on a directed or undirected graph.
 * @param startIndex - The node index where the search begins.
 * @param relation - An adjacency list representing the graph, where each index contains a `Set` of neighboring node indices.
 * @param work - A callback function executed for every node visited during the traversal.
 */
export function breadthFirstSearch(startIndex: number, relation: ReadonlyArray<Set<number>>, work: (index: number) => void) {
    const visited = new Array<boolean>(relation.length);
    const queue = new Array<number>();

    queue.push(startIndex);

    while (queue.length > 0) {
        const currentIndex = queue.shift()!;

        work(currentIndex);

        for (const neighbor of relation[currentIndex].values()) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                queue.push(neighbor);
            }
        }
    }
}