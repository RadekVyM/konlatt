const digits = `
B

10
7

0
1
2
3
4
5
6
7
8
9
a
b
c
d
e
f
g
X.XXXXX
.....XX
XXX.XX.
XXX..XX
.X.X.XX
XXXX..X
.XXXX.X
X....XX
XXXXXXX
XX.X.XX
`;

const lattice = `
B

14
16

I
II
III
IV
1
2
3
4
5
6
7
8
9
10
Boolean lattice
CDS lattice
geometric lattice
metric lattice
atomistic
Brouwerian
complemented
distributive
dually semimodular
graded
modular
relatively complemented
sectionally complemented
semimodular
Stonean
uniquely complemented
XXXXXXXXXXXXXXXX
.X..X.X.XX..X...
..X.X.X..X.XXX..
...X....XXX..X..
...X.X.XXXX..XX.
.XXXX.X.XXXXXX..
....X.X....XX...
..X.X.X..X.XXX..
....X...XX......
...X.X.XXXX..X..
....X.X..X......
......X..X...X..
.X..X.X.XX..X...
.X..X.X.XX.XX...
`;

const liveinwater = `
B

8
9

fish leech
bream
frog
dog
water weeds
reed
bean
corn
needs water to live
lives in water
lives on land
needs chlorophyll
dicotyledon
monocotyledon
can move
has limbs
breast feeds
XX....X..
XX....XX.
XXX...XX.
X.X...XXX
XX.X.X...
XXXX.X...
X.XXX....
X.XX.X...
`;

const tealady = `
B

18
14

Evelyn
Laura
Theresa
Brenda
Charlotte
Frances
Eleanor
Pearl
Ruth
Verne
Myra
Katherine
Syliva
Nora
Helen
Dorothy
Olivia
Flora
1
2
3
4
5
6
7
8
9
10
11
12
13
14
XXXXXX.XX.....
XXX.XXXX......
.XXXXXXXX.....
X.XXXXXX......
..XXX.X.......
..X.XX.X......
....XXXX......
.....X.XX.....
....X.XXX.....
......XXX..X..
.......XXX.X..
.......XXX.XXX
......XXXX.XXX
.....XX.XXXXXX
......XX.XXX..
.......XX.....
........X.X...
........X.X...
`;

export type TestValue = {
    readonly title: string,
    readonly fileContent: string,
    readonly contextCellsPerObject: number,
    readonly objectsCount: number,
    readonly attributesCount: number,
    readonly conceptsCount: number,
    readonly coverRelationSize: number,
    readonly byLongestPathLayersCounts: Array<number>,
}

export const DIGITS: TestValue = {
    title: "digits",
    fileContent: digits,
    contextCellsPerObject: 1,
    objectsCount: 10,
    attributesCount: 7,
    conceptsCount: 48,
    coverRelationSize: 120,
    byLongestPathLayersCounts: [
        1,
        5,
        11,
        13,
        11,
        6,
        1,
    ],
};
export const LATTICE: TestValue = {
    title: "lattice",
    fileContent: lattice,
    contextCellsPerObject: 1,
    objectsCount: 14,
    attributesCount: 16,
    conceptsCount: 24,
    coverRelationSize: 39,
    byLongestPathLayersCounts: [
        1,
        3,
        5,
        5,
        3,
        3,
        2,
        1,
        1,
    ],
};
export const LIVEINWATER: TestValue = {
    title: "liveinwater",
    fileContent: liveinwater,
    contextCellsPerObject: 1,
    objectsCount: 8,
    attributesCount: 9,
    conceptsCount: 19,
    coverRelationSize: 32,
    byLongestPathLayersCounts: [
        1,
        4,
        5,
        5,
        3,
        1,
    ],
};
export const TEALADY: TestValue = {
    title: "tealady",
    fileContent: tealady,
    contextCellsPerObject: 1,
    objectsCount: 18,
    attributesCount: 14,
    conceptsCount: 65,
    coverRelationSize: 148,
    byLongestPathLayersCounts: [
        1,
        7,
        14,
        14,
        9,
        7,
        8,
        4,
        1,
    ],
};