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