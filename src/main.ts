const canvas = <HTMLCanvasElement>document.querySelector(".canvas-grid");
const ctx = canvas.getContext("2d");

const rowsInput = <HTMLInputElement>document.querySelector("input#rows");
const colsInput = <HTMLInputElement>document.querySelector("input#columns");

let ROW = Number(rowsInput.value);
let COL = Number(colsInput.value);

const rowsOutput = <HTMLOutputElement>document.querySelector("#rowValueLabel");
const colsOutput = <HTMLOutputElement>document.querySelector("#colValueLabel");
rowsOutput.innerHTML = String(ROW);
colsOutput.innerHTML = String(COL);

const gridRowColInput = <HTMLFormElement>document.querySelector("#row-column-input");
gridRowColInput.addEventListener("input", () => {
    ROW = Number(rowsInput.value);
    COL = Number(colsInput.value);
});

const cellSize = 32;
const cellGap = 1;

let grid: Array<Array<number>> = [];
const generateGridBtn = <HTMLButtonElement>document.querySelector("#generate-grid");
generateGridBtn.addEventListener("click", () => {
    grid = new Array(ROW).fill(0);
    for (let i = 0; i < ROW; i++) {
        grid[i] = new Array(COL).fill(0);
    }

    canvas.width = COL * cellSize;
    canvas.height = ROW * cellSize;
    fillGrid();
});

const colors = {
    light_gray: "rgb(170, 170, 170)",
    dark_gray: "rgb(100, 100, 100)",
    black: "rgb(0, 0, 0)",
    red: "rgb(255, 0, 0)",
    green: "rgb(0, 255, 0)",
    orange: "rgb(242, 153, 48)",
    blue: "rgb(84, 103, 176)",
};

const fillGrid = () => {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            switch (grid[r][c]) {
                case 0: // space
                    ctx.fillStyle = colors.light_gray;
                    break;
                case 1: // shadow
                    ctx.fillStyle = colors.dark_gray;
                    break;
                case 2: // wall
                    ctx.fillStyle = colors.black;
                    break;
                case 3:
                    ctx.fillStyle = colors.red;
                    break;
                case 4:
                    ctx.fillStyle = colors.green;
                    break;
                case 5:
                    ctx.fillStyle = colors.orange;
                    break;
                case 6:
                    ctx.fillStyle = colors.blue;
                    break;
            }
            ctx.fillRect(
                c * cellSize + cellGap,
                r * cellSize + cellGap,
                cellSize - cellGap * 2,
                cellSize - cellGap * 2
            );
        }
    }
};

let gridX: number = 0,
    gridY: number = 0;
const convertToGridPos = (e: MouseEvent) => {
    let mouseX = e.offsetX;
    let mouseY = e.offsetY;

    let temp: number;
    try {
        temp = Math.floor(mouseX / cellSize);

        if (temp < 0 || temp >= COL) {
            throw new Error("gridX out of index");
        }
    } catch (error: any) {
        console.error("ERROR ", error.message);
    }

    gridX = temp;

    try {
        temp = Math.floor(mouseY / cellSize);

        if (temp < 0 || temp >= ROW) {
            throw new Error("gridY out of index");
        }
    } catch (error: any) {
        console.error("ERROR", error.message);
    }

    gridY = temp;
};

const gridMouseHover = (e: MouseEvent) => {
    if (grid.length === 0) return;

    convertToGridPos(e);
    fillGrid();
};

canvas.addEventListener("mouseenter", gridMouseHover);

const wallButton = document.querySelector("#wall-button");
const startButton = document.querySelector("#start-button");
const goalButton = document.querySelector("#goal-button");
const eraseButton = document.querySelector("#erase-button");
const resetButton = document.querySelector("#reset-button");

let drawMode = 0;

wallButton.addEventListener("click", () => {
    drawMode = 2;
});
startButton.addEventListener("click", () => {
    drawMode = 3;
});
goalButton.addEventListener("click", () => {
    drawMode = 4;
});
eraseButton.addEventListener("click", () => {
    drawMode = 0;
});

resetButton.addEventListener("click", () => {
    if (grid.length === 0) return;

    for (let row of grid) {
        row.fill(0);
    }
    fillGrid();
});

const drawModeButtons = <HTMLFormElement>document.querySelector("#draw-mode");
drawModeButtons.addEventListener("click", () => {
    let drawModeLabel = <HTMLOutputElement>document.querySelector("#draw-mode-label");
    switch (drawMode) {
        case 0:
            drawModeLabel.value = "Erase";
            break;
        case 1:
            break;
        case 2:
            drawModeLabel.value = "Wall";
            break;
        case 3:
            drawModeLabel.value = "Start";
            break;
        case 4:
            drawModeLabel.value = "Goal";
            break;
    }
});

let isCanvasPressed: boolean = false;
canvas.onmouseenter = (e: MouseEvent) => {
    if (grid.length === 0) return;

    canvas.onmousedown = (event: MouseEvent) => {
        isCanvasPressed = true;
        dragToDraw(event);
    };

    canvas.onmouseup = () => {
        isCanvasPressed = false;
    };

    canvas.onmousemove = (event) => dragToDraw(event);
};

canvas.onmouseleave = () => {
    isCanvasPressed = false;
};

const dragToDraw = (e: MouseEvent) => {
    if (isCanvasPressed) {
        convertToGridPos(e);
        grid[gridY][gridX] = drawMode;
        fillGrid();
    }
};

const validateGrid = () => {
    if (grid.length === 0) return;

    let startNodeCount = 0;
    let goalNodeCount = 0;

    for (let row of grid) {
        for (let v of row) {
            if (v === 3) startNodeCount++;
            else if (v === 4) goalNodeCount++;
        }
    }

    // console.log(`start: ${startNodeCount}, goal: ${goalNodeCount}`);

    if (startNodeCount === 1 && goalNodeCount === 1) return true;
    return false;
};

class GridNode {
    row: number;
    col: number;
    adjacents: GridNode[];

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
        this.adjacents = [];
    }
    addAjacents() {
        if (this.row > 0 && grid[this.row - 1][this.col] !== 2) {
            this.adjacents.push(new GridNode(this.row - 1, this.col));
        }
        if (this.row < ROW - 1 && grid[this.row + 1][this.col] !== 2) {
            this.adjacents.push(new GridNode(this.row + 1, this.col));
        }
        if (this.col > 0 && grid[this.row][this.col - 1] !== 2) {
            this.adjacents.push(new GridNode(this.row, this.col - 1));
        }
        if (this.col < COL - 1 && grid[this.row][this.col + 1] !== 2) {
            this.adjacents.push(new GridNode(this.row, this.col + 1));
        }
    }

    toString() {
        return `{ row: ${this.row}, col: ${this.col} }`;
    }
}

let graphNodes: Array<Array<GridNode>>;
let startNode: GridNode;
let goalNode: GridNode;
let gridBackup: Array<Array<number>> = [];

const gridToGraph = () => {
    if (grid.length === 0) return;

    graphNodes = [];

    for (let r = 0; r < ROW; r++) {
        graphNodes.push(new Array<GridNode>());

        for (let c = 0; c < COL; c++) {
            graphNodes[r].push(new GridNode(r, c));
            graphNodes[r][c].addAjacents();

            if (grid[r][c] === 3) {
                startNode = graphNodes[r][c];
            } else if (grid[r][c] === 4) {
                goalNode = graphNodes[r][c];
            }
        }
    }

    // console.log(graphNodes);
    let isValid = validateGrid();

    if (!isValid) {
        console.error("invalid grid!");
        const resultDiv = document.querySelector("#path-result");
        resultDiv.innerHTML = "Invalid grid! 💢";
        return;
    }
};

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

const traceRouteBFS = async (start: GridNode, goal: GridNode, output: Map<string, GridNode>) => {
    let currentNode = goal;
    let stack = [];
    let iter = 1;

    while (!isSameNode(currentNode, start)) {
        let currentNodeData = output.get(currentNode.toString());
        currentNode = new GridNode(currentNodeData.row, currentNodeData.col);
        if (!isSameNode(currentNode, start)) stack.push(currentNode);
    }

    while (stack.length !== 0) {
        ++iter;
        let currentNode = stack.pop();
        grid[currentNode.row][currentNode.col] = 5;
        fillGrid();

        await timer(30);
    }

    return iter;
};

const traceRoute = async (start: GridNode, goal: GridNode, output: Map<string, GBFSData>) => {
    let currentNode = goal;
    let stack = [];
    let iter = 1;

    while (!isSameNode(currentNode, start)) {
        let currentNodeData = output.get(currentNode.toString());
        currentNode = new GridNode(currentNodeData.parentNode.row, currentNodeData.parentNode.col);
        if (!isSameNode(currentNode, start)) stack.push(currentNode);
    }

    while (stack.length !== 0) {
        iter++;
        let currentNode = stack.pop();
        grid[currentNode.row][currentNode.col] = 5;
        fillGrid();

        await timer(30);
    }
    return iter;
};

const resetGridToPreviousState = () => {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            if (grid[r][c] === 5 || grid[r][c] === 6) {
                grid[r][c] = 0;
            }
        }
    }
};

const BFSButton = document.querySelector("#BFS-button");
BFSButton.addEventListener("click", () => {
    let output = new Map<string, GridNode>();

    const loop = async () => {
        let isFound: boolean;
        let result = await BFS(startNode, goalNode, output);

        console.log(`result : ${result}`);

        return result;
    };

    const resultDiv = document.querySelector("#path-result");
    resultDiv.innerHTML = "";
    resetGridToPreviousState();
    gridToGraph();

    loop().then((result) => {
        if (result) {
            traceRouteBFS(startNode, goalNode, output).then((result) => {
                resultDiv.innerHTML = `👉 Path length : ${result}`;
            });
        } else {
            console.log("Cannot find route");
            resultDiv.innerHTML = "Cannot find route!";
        }
    });
});

const GBFSButton = document.querySelector("#GBFS-button");
GBFSButton.addEventListener("click", () => {
    let gbfs_output = new Map<string, GBFSData>();
    async function loop() {
        let isFound: boolean;

        let result = await GBFS(startNode, goalNode, gbfs_output);

        console.log(`result : ${result}`);

        return result;
    }

    const resultDiv = document.querySelector("#path-result");
    resultDiv.innerHTML = "";
    resetGridToPreviousState();
    gridToGraph();

    loop().then((result) => {
        if (result) {
            traceRoute(startNode, goalNode, gbfs_output).then((result) => {
                resultDiv.innerHTML = `👉 Path length : ${result}`;
            });
        } else {
            console.log("Cannot find route");
            resultDiv.innerHTML = "Cannot find route!";
        }
    });
});

const ASTARButton = document.querySelector("#ASTAR-button");
ASTARButton.addEventListener("click", () => {
    async function loop() {
        let isFound: boolean;
        let result = await ASTAR(startNode, goalNode, astar_output);
        console.log(`result : ${result}`);

        return result;
    }

    const resultDiv = document.querySelector("#path-result");
    resultDiv.innerHTML = "";
    resetGridToPreviousState();
    gridToGraph();

    let astar_output = new Map<string, AstarData>();

    loop().then((result) => {
        if (result) {
            traceRoute(startNode, goalNode, astar_output).then((result) => {
                resultDiv.innerHTML = `👉 Path length : ${result}`;
            });
        } else {
            console.log("Cannot find route");
            resultDiv.innerHTML = "Cannot find route!";
        }
    });
});

const isSameNode = (a: GridNode, b: GridNode) => {
    return a.row === b.row && a.col === b.col;
};

const BFS = async (start: GridNode, goal: GridNode, map: Map<string, GridNode>) => {
    let queue = [];
    queue.push(start);

    const BFSLoop = async () => {
        let isPathFound = false;
        while (queue.length !== 0) {
            let currentNode: GridNode = queue.at(0);
            queue.shift();

            for (let adjacent of currentNode.adjacents) {
                if (isSameNode(adjacent, goalNode)) {
                    map.set(adjacent.toString(), currentNode);
                    return true;
                }

                if (!map.has(adjacent.toString()) && !isSameNode(adjacent, start)) {
                    adjacent.addAjacents();
                    map.set(adjacent.toString(), currentNode);
                    queue.push(adjacent);

                    if (!isSameNode(adjacent, goalNode)) {
                        grid[adjacent.row][adjacent.col] = 6;
                    }
                    fillGrid();

                    await timer(10);
                }
            }
        }
        return isPathFound;
    };

    let result = await BFSLoop();
    return result;
};

class GBFSData {
    constructor(n: GridNode, parent: GridNode, hx: number) {
        this.row = n.row;
        this.col = n.col;
        this.parentNode = parent;
        this.adjacents = n.adjacents;
        this.hx = hx;
        this.isOpen = false;
        this.isClosed = false;
    }
    row: number;
    col: number;
    parentNode: GridNode;
    adjacents: Array<GridNode>;
    hx: number;
    isOpen: boolean;
    isClosed: boolean;
}

const hx = (a: GridNode, b: GridNode) => {
    let rowDiff = Math.abs(a.row - b.row);
    let colDiff = Math.abs(a.col - b.col);
    return rowDiff + colDiff;
};

const getSmallestHx = (queue: Map<string, GBFSData>) => {
    let min = Number.MAX_VALUE;
    let minNode: string;

    for (let k of queue.keys()) {
        let currentNodeData = queue.get(k);
        if (currentNodeData.hx < min) {
            min = currentNodeData.hx;
            minNode = k;
        }
    }

    return minNode;
};

const GBFS = async (start: GridNode, goal: GridNode, map: Map<string, GBFSData>) => {
    let queue = new Map<string, GBFSData>();
    // let pair = new Map<string, GBFSData>();

    let startData = new GBFSData(start, undefined, hx(start, goal));

    queue.set(start.toString(), startData);
    // pair.set(start.toString(), startData);

    const GBFSLoop = async () => {
        let isPathfound = false;

        while (!(queue.size === 0)) {
            let currentNodeStr = getSmallestHx(queue);
            let currentNodeData = queue.get(currentNodeStr);
            queue.delete(currentNodeStr);

            if (isSameNode(new GridNode(currentNodeData.row, currentNodeData.col), goal)) {
                isPathfound = true;
                break;
            }

            currentNodeData.isOpen = false;
            currentNodeData.isClosed = true;
            map.set(currentNodeStr, currentNodeData);

            for (let adj of currentNodeData.adjacents) {
                adj.addAjacents();
                let adjNodeData = map.get(adj.toString());

                if (adjNodeData === undefined) {
                    adjNodeData = new GBFSData(adj, undefined, 0);
                    map.set(adj.toString(), adjNodeData);
                }

                if (!adjNodeData.isClosed) {
                    adjNodeData.parentNode = new GridNode(currentNodeData.row, currentNodeData.col);

                    if (!adjNodeData.isOpen) {
                        adjNodeData.hx = hx(adj, goal);
                        adjNodeData.isOpen = true;
                        queue.set(adj.toString(), adjNodeData);

                        if (!isSameNode(adj, goal)) {
                            grid[adj.row][adj.col] = 6;
                        }
                        fillGrid();

                        await timer(10);
                    }
                }
            }
        }

        return isPathfound;
    };

    let result = await GBFSLoop();
    return result;
};

class AstarData extends GBFSData {
    constructor(n: GridNode, parent: GridNode, hx: number, gx: number) {
        super(n, parent, hx);
        this.gx = gx;
    }
    gx: number;
    fx: number;
}

const getSmallestFx = (queue: Map<string, AstarData>) => {
    let min = Number.MAX_VALUE;
    let minNode: string;

    for (let k of queue.keys()) {
        let currentNodeData = queue.get(k);
        if (currentNodeData.fx < min) {
            min = currentNodeData.fx;
            minNode = k;
        }
    }

    return minNode;
};

const ASTAR = async (start: GridNode, goal: GridNode, map: Map<string, AstarData>) => {
    let queue = new Map<string, AstarData>();

    let startData = new AstarData(start, undefined, hx(start, goal), 0);
    startData.fx = startData.hx;

    queue.set(start.toString(), startData);

    const ASTARLoop = async () => {
        let isPathfound = false;

        while (!(queue.size === 0)) {
            let currentNodeStr = getSmallestFx(queue);
            let currentNodeData = queue.get(currentNodeStr);
            queue.delete(currentNodeStr);

            if (isSameNode(new GridNode(currentNodeData.row, currentNodeData.col), goal)) {
                isPathfound = true;
                break;
            }

            currentNodeData.isOpen = false;
            currentNodeData.isClosed = true;
            map.set(currentNodeStr, currentNodeData);

            for (let adj of currentNodeData.adjacents) {
                adj.addAjacents();
                let adjNodeData = map.get(adj.toString());

                if (adjNodeData === undefined) {
                    adjNodeData = new AstarData(adj, undefined, 0, 0);
                    map.set(adj.toString(), adjNodeData);
                }

                if (!adjNodeData.isClosed) {
                    adjNodeData.parentNode = new GridNode(currentNodeData.row, currentNodeData.col);

                    if (!adjNodeData.isOpen) {
                        adjNodeData.hx = hx(adj, goal);
                        adjNodeData.gx = currentNodeData.gx + 1;
                        adjNodeData.fx = adjNodeData.hx + adjNodeData.gx;
                        adjNodeData.isOpen = true;
                        queue.set(adj.toString(), adjNodeData);

                        if (!isSameNode(adj, goal)) {
                            grid[adj.row][adj.col] = 6;
                        }
                        fillGrid();

                        await timer(10);
                    } else {
                        let newGx = currentNodeData.gx + 1;
                        if (newGx < adjNodeData.gx) {
                            adjNodeData.parentNode = new GridNode(currentNodeData.row, currentNodeData.col);
                            adjNodeData.gx = newGx;
                        }
                    }
                }
                map.set(adj.toString(), adjNodeData);
            }
        }

        return isPathfound;
    };

    let result = await ASTARLoop();
    return result;
};
