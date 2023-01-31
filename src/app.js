const CELL_WIDTH = 16;
const CELL_HEIGHT = 16;
const screen = document.getElementById("screen");
screen.width = 640;
screen.height = 640;
const c = screen.getContext("2d");

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true,
        };
        this.x = this.col * CELL_WIDTH;
        this.y = this.row * CELL_HEIGHT;
        this.visited = false;
        this.active = false;
    }

    isDuplicate(anotherCell) {
        return this.row === anotherCell.row && this.col === anotherCell.col;
    }

    draw() {
        this._drawBackground();
        this._drawWalls();
    }

    _drawBackground() {
        if (this.active) {
            c.fillStyle = "#e63946";
        } else if (this.visited) {
            c.fillStyle = "#a8dadc";
        } else {
            c.fillStyle = "#ffffff";
        }
        c.fillRect(this.x, this.y, CELL_WIDTH, CELL_HEIGHT);
    }

    _drawWalls() {
        if (this.walls.top) {
            this._drawLine(this.x, this.y, this.x + CELL_WIDTH, this.y);
        }
        if (this.walls.right) {
            this._drawLine(
                this.x + CELL_WIDTH,
                this.y,
                this.x + CELL_WIDTH,
                this.y + CELL_HEIGHT
            );
        }
        if (this.walls.bottom) {
            this._drawLine(
                this.x + CELL_WIDTH,
                this.y + CELL_HEIGHT,
                this.x,
                this.y + CELL_HEIGHT
            );
        }
        if (this.walls.left) {
            this._drawLine(this.x, this.y + CELL_HEIGHT, this.x, this.y);
        }
    }

    _drawLine(xi, yi, xf, yf) {
        c.strokeStyle = "#457b9d";
        c.beginPath();
        c.moveTo(xi, yi);
        c.lineTo(xf, yf);
        c.stroke();
    }

    removeWall(side) {
        this.walls[side] = false;
    }

    visit() {
        this.visited = true;
    }

    activate() {
        this.active = true;
    }

    deactivate() {
        this.active = false;
    }
}

class Move {
    constructor(currentCell, previousCell) {
        this.currentCell = currentCell;
        this.previousCell = previousCell;
    }

    get direction() {
        const deltaRow = this.currentCell.row - this.previousCell.row;
        const deltaCol = this.currentCell.col - this.previousCell.col;
        if (deltaRow === -1) return "top";
        else if (deltaCol === 1) return "right";
        else if (deltaRow === 1) return "bottom";
        else if (deltaCol === -1) return "left";
    }
}

class CellStack {
    constructor(grid, initialRow, initialCol) {
        this.grid = grid;
        this.stack = this._buildStack(initialRow, initialCol);
        this.length = this.stack.length;
    }

    _buildStack(initialRow, initialCol) {
        return [new Move(this.grid[initialRow][initialCol], null)];
    }

    _getStackWithoutDuplicates(elementToBePushed) {
        return this.stack.filter(
            (stackElement) =>
                !stackElement.currentCell.isDuplicate(
                    elementToBePushed.currentCell
                )
        );
    }

    _pushElementAndRemoveDuplicates(elementToBePushed) {
        const stackWithoutDuplicates =
            this._getStackWithoutDuplicates(elementToBePushed);
        stackWithoutDuplicates.push(elementToBePushed);
        this.stack = stackWithoutDuplicates;
    }

    push(elementToBePushed) {
        this._pushElementAndRemoveDuplicates(elementToBePushed);
        this.length = this.stack.length;
    }

    pop() {
        const poppedElement = this.stack.pop();
        this.length = this.stack.length;
        return poppedElement;
    }
}

class Player {
    constructor(initialRow = 0, initialCol = 0) {
        this.row = initialRow;
        this.col = initialCol;
        [this.x, this.y] = this._getCoordinates(this.row, this.col);
    }

    _getCoordinates(row, col) {
        return [col * CELL_HEIGHT + 2, row * CELL_WIDTH + 2];
    }

    draw() {
        c.fillStyle = "#f1faee";
        c.fillRect(this.x, this.y, CELL_WIDTH - 4, CELL_HEIGHT - 4);
    }

    moveTo(row, col) {
        this.row = row;
        this.col = col;
        [this.x, this.y] = this._getCoordinates(row, col);
    }
}

class Grid {
    constructor() {
        this.isMazeReady = false;
        // this.isPlaying = true;
        // this.player = null;
        this.currentAnimationId = 0;
        this.numRows = Math.floor(screen.height / CELL_HEIGHT);
        this.numCols = Math.floor(screen.width / CELL_WIDTH);
        [this.exitX, this.exitY] = this.getRandomRowAndCol();
        this.grid = this._buildGrid();
        this.draw();
        // this.movePlayer = (event) => this._handleMove(event);
    }

    draw() {
        // this._clearScreen();
        this._drawCells();
        // this._drawPlayer();
    }

    _makeGridFilledWithZeros(numRows, numCols) {
        return Array(numRows)
            .fill(0)
            .map(() => Array(numCols).fill(0));
    }

    _fillGridWithCells(grid) {
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                grid[row][col] = new Cell(row, col);
            }
        }
    }

    _buildGrid() {
        const grid = this._makeGridFilledWithZeros(this.numRows, this.numCols);
        this._fillGridWithCells(grid);
        return grid;
    }

    _clearScreen() {
        c.clearRect(0, 0, screen.width, screen.height);
    }

    _clearGrid() {
        this.grid = this._buildGrid();
    }

    _drawCells() {
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[0].length; col++) {
                const cell = this.grid[row][col];
                cell.draw();
                cell.deactivate();
            }
        }
    }

    // _drawPlayer() {
    //     if (this.player) this.player.draw();
    // }

    _isValidCell(row, col) {
        return (
            row >= 0 &&
            row < this.numRows &&
            col >= 0 &&
            col < this.numCols &&
            this.grid[row][col].visited === false
        );
    }

    _shuffle(arr) {
        arr.sort(() => Math.random() - 0.5);
    }

    _getDirections() {
        const directions = [
            { deltaRow: -1, deltaCol: 0 }, // Up
            { deltaRow: 0, deltaCol: 1 }, // Right
            { deltaRow: 1, deltaCol: 0 }, // Down
            { deltaRow: 0, deltaCol: -1 }, // Left
        ];
        this._shuffle(directions);
        return directions;
    }

    _pushNeighborToStack(direction, currentCell, stack) {
        const { row, col } = currentCell;
        const { deltaRow, deltaCol } = direction;

        if (this._isValidCell(row + deltaRow, col + deltaCol)) {
            stack.push(
                new Move(this.grid[row + deltaRow][col + deltaCol], currentCell)
            );
        }
    }

    _pushNeighborsToStack(currentCell, stack) {
        const directions = this._getDirections();
        for (let i = 0; i < directions.length; i++) {
            this._pushNeighborToStack(directions[i], currentCell, stack);
        }
    }

    _updateCellState(move) {
        const { currentCell, previousCell } = move;
        if (previousCell && !currentCell.visited) this._removeWalls(move);
        currentCell.visit();
        currentCell.activate();
    }

    _dfs(stack) {
        const move = stack.pop();
        this._updateCellState(move);
        this._pushNeighborsToStack(move.currentCell, stack);
    }

    _startNewAnimation() {
        const animationId = this.currentAnimationId + 1;
        this.currentAnimationId++;
        return animationId;
    }

    _isCurrentAnimation(animationId) {
        return this.currentAnimationId === animationId;
    }

    getRandomRowAndCol() {
        const randomRow = Math.floor(Math.random() * this.numRows);
        const randomCol = Math.floor(Math.random() * this.numCols);
        return [randomRow, randomCol];
    }

    generateMazeAnimated() {
        this.isMazeReady = false;
        this._clearGrid();
        this._clearScreen();
        // this._stopPlaying();

        const animationId = this._startNewAnimation();
        const [initialRow, initialCol] = this.getRandomRowAndCol();
        const stack = new CellStack(this.grid, initialRow, initialCol);

        const animate = () => {
            if (!this._isCurrentAnimation(animationId)) return;
            if (stack.length > 0) {
                this._dfs(stack);
                this.draw();
                requestAnimationFrame(animate);
            } else {
                this.draw(); // Clear active cells after maze is finished
                this.isMazeReady = true;
            }
        };

        requestAnimationFrame(animate);
    }

    generateMaze() {
        this.currentAnimationId++;
        this._clearGrid();
        this._clearScreen();
        // this._stopPlaying();
        this.isMazeReady = false;
        const [initialRow, initialCol] = this.getRandomRowAndCol();
        const stack = new CellStack(this.grid, initialRow, initialCol);

        while (stack.length > 0) {
            this._dfs(stack);
        }

        this.draw();
        this.isMazeReady = true;
    }

    _removeWalls(move) {
        const { currentCell, previousCell, direction } = move;
        const wallsToRemove = {
            top: ["bottom", "top"],
            right: ["left", "right"],
            bottom: ["top", "bottom"],
            left: ["right", "left"],
        };
        currentCell.removeWall(wallsToRemove[direction][0]);
        previousCell.removeWall(wallsToRemove[direction][1]);
    }

    _getMoveDirection(currentRow, currentCol, nextRow, nextCol) {
        const deltaRow = nextRow - currentRow;
        const deltaCol = nextCol - currentCol;
        if (deltaRow === -1) return "top";
        else if (deltaCol === 1) return "right";
        else if (deltaRow === 1) return "bottom";
        else if (deltaCol === -1) return "left";
    }

    _isPathOpen(currentRow, currentCol, nextRow, nextCol) {
        const moveDirection = this._getMoveDirection(
            currentRow,
            currentCol,
            nextRow,
            nextCol
        );
        return !this._hasWall(currentRow, currentCol, moveDirection);
    }

    _hasWall(currentRow, currentCol, direction) {
        const currentCell = this.grid[currentRow][currentCol];
        return currentCell.walls[direction];
    }

    isValidMove(currentRow, currentCol, nextRow, nextCol) {
        if (
            this._isInsideGrid(nextRow, nextCol) &&
            this._isPathOpen(currentRow, currentCol, nextRow, nextCol)
        )
            return true;
        return false;
    }

    _isInsideGrid(row, col) {
        return row >= 0 && row < this.numRows && col >= 0 && col < this.numCols;
    }

    // _stopPlaying() {
    //     document.removeEventListener("click", this.movePlayer);
    //     this.isPlaying = false;
    //     this.player = null;
    // }

    // _handleMove(event) {
    //     const { key } = event;
    //     const directions = {
    //         ArrowUp: [-1, 0],
    //         ArrowRight: [0, 1],
    //         ArrowDown: [1, 0],
    //         ArrowLeft: [0, -1],
    //     };

    //     const isArrow = !!directions[key];
    //     if (!isArrow) return;

    //     const currentRow = this.player.row;
    //     const currentCol = this.player.col;
    //     const nextRow = currentRow + directions[key][0];
    //     const nextCol = currentCol + directions[key][1];

    //     if (this.isValidMove(currentRow, currentCol, nextRow, nextCol)) {
    //         this.player.moveTo(nextRow, nextCol);
    //     }
    // }

    // _listenToPlayerMoves() {
    //     document.addEventListener("keydown", this.movePlayer);
    // }

    // _startGameLoop() {
    //     this._listenToPlayerMoves();

    //     const animate = () => {
    //         console.log("looping");
    //         if (!this.isPlaying) return;
    //         this.draw();
    //         requestAnimationFrame(animate);
    //     };

    //     requestAnimationFrame(animate);
    // }

    // startGame() {
    //     if (!this.isMazeReady) return console.log("maze is not ready");
    //     this._stopPlaying();
    //     const [playerInitialRow, playerInitialCol] = this.getRandomRowAndCol();
    //     this.player = new Player(playerInitialRow, playerInitialCol);
    //     this.isPlaying = true;
    //     this._startGameLoop();
    // }
}

class Game {
    constructor() {
        this._player = null;
        this._isPlaying = false;
        this._grid = new Grid();
        this._movePlayer = (event) => this._handleMove(event);
    }

    generateMazeAnimated() {
        this._grid.generateMazeAnimated();
    }

    generateMaze() {
        this._grid.generateMaze();
    }

    start() {
        this._setup();
        this._startGameLoop();
    }

    _startGameLoop() {
        const animate = () => {
            if (!this._canPlay()) return;
            this._draw();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    _canPlay() {
        return this._isPlaying && this._grid.isMazeReady;
    }

    _clearScreen() {
        c.clearRect(0, 0, screen.width, screen.height);
    }

    _draw() {
        this._clearScreen();
        this._grid.draw();
        if (this._player) this._player.draw();
    }

    _setup() {
        if (this._grid.isMazeReady) {
            this._createPlayer();
            this._listenToPlayerMoves();
            this._isPlaying = true;
        }
    }

    _reset() {
        this._unlistenToPlayerMoves();
        this._deletePlayer();
        this._isPlaying = false;
    }

    _createPlayer() {
        const [playerInitialRow, playerInitialCol] =
            this._grid.getRandomRowAndCol();
        this._player = new Player(playerInitialRow, playerInitialCol);
    }

    _deletePlayer() {
        this._player = null;
    }

    _listenToPlayerMoves() {
        document.addEventListener("keydown", this._movePlayer);
    }

    _unlistenToPlayerMoves() {
        document.removeEventListener("keydown", this._movePlayer);
    }

    _handleMove(event) {
        const move = this._getMove(event.key);
        if (!move) return;

        const currentRow = this._player.row;
        const currentCol = this._player.col;
        const nextRow = currentRow + move[0];
        const nextCol = currentCol + move[1];

        if (this._grid.isValidMove(currentRow, currentCol, nextRow, nextCol)) {
            this._player.moveTo(nextRow, nextCol);
        }
    }

    _getMove(key) {
        const allowedMoves = {
            ArrowUp: [-1, 0],
            ArrowRight: [0, 1],
            ArrowDown: [1, 0],
            ArrowLeft: [0, -1],
        };
        return allowedMoves[key];
    }
}

const game = new Game();

const animateButton = document.getElementById("animate");
animateButton.addEventListener("click", () => game.generateMazeAnimated());
const generateInstButton = document.getElementById("generate-inst");
generateInstButton.addEventListener("click", () => game.generateMaze());
const playButton = document.getElementById("play");
playButton.addEventListener("click", () => game.start());
