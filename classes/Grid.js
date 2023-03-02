import Cell from "./Cell.js";
import CellStack from "./CellStack.js";
import Move from "./Move.js";

export default class Grid {
    constructor(numRows, numCols, cellWidth, cellHeight, colors, c, screen) {
        this.msPerFrame = 0;
        this.isMazeReady = false;
        this.currentAnimationId = 0;
        this.numRows = numRows;
        this.numCols = numCols;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.colors = colors;
        this.c = c;
        this.screen = screen;
        this.exitRow = null;
        this.exitCol = null;
        this.grid = this._buildGrid();
        this.draw();
    }

    setAnimationSpeed(speed) {
        if (speed === "fast") this.msPerFrame = 0;
        else if (speed === "medium") this.msPerFrame = 50;
        else if (speed === "slow") this.msPerFrame = 100;
        else if (speed === "instantaneous") this.msPerFrame = -1;
    }

    _makeGridFilledWithZeros(numRows, numCols) {
        return Array(numRows)
            .fill(0)
            .map(() => Array(numCols).fill(0));
    }

    _fillGridWithCells(grid) {
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                grid[row][col] = new Cell(
                    row,
                    col,
                    this.isExit(row, col),
                    this.cellWidth,
                    this.cellHeight,
                    this.colors,
                    this.c
                );
            }
        }
    }

    _buildGrid() {
        const grid = this._makeGridFilledWithZeros(this.numRows, this.numCols);
        this._fillGridWithCells(grid);
        return grid;
    }

    _clearScreen() {
        this.c.clearRect(0, 0, this.screen.width, this.screen.height);
    }

    _clearGrid() {
        this.grid = this._buildGrid();
    }

    draw() {
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[0].length; col++) {
                const cell = this.grid[row][col];
                cell.draw();
                cell.deactivate();
            }
        }
    }

    isExit(row, col) {
        return row === this.exitRow && col === this.exitCol;
    }

    _shouldVisit(row, col) {
        return this._isInsideGrid(row, col) && !this._hasBeenVisited(row, col);
    }

    _hasBeenVisited(row, col) {
        return this.grid[row][col].visited === true;
    }

    _shuffle(arr) {
        arr.sort(() => Math.random() - 0.5);
    }

    _getShuffledDirections() {
        const directions = [
            { deltaRow: -1, deltaCol: 0 }, // Up
            { deltaRow: 0, deltaCol: 1 }, // Right
            { deltaRow: 1, deltaCol: 0 }, // Down
            { deltaRow: 0, deltaCol: -1 }, // Left
        ];
        this._shuffle(directions);
        return directions;
    }

    _getNextRowAndCol(direction, currentCell) {
        const { row, col } = currentCell;
        const { deltaRow, deltaCol } = direction;
        const nextRow = row + deltaRow;
        const nextCol = col + deltaCol;
        return [nextRow, nextCol];
    }

    _pushNeighborToStack(direction, currentCell, stack) {
        const [nextRow, nextCol] = this._getNextRowAndCol(
            direction,
            currentCell
        );
        if (this._shouldVisit(nextRow, nextCol)) {
            stack.push(new Move(this.grid[nextRow][nextCol], currentCell));
        }
    }

    _pushNeighborsToStack(currentCell, stack) {
        const directions = this._getShuffledDirections();
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

    _isCurrentAnimation(animationId) {
        return this.currentAnimationId === animationId;
    }

    getRandomRowAndCol() {
        const randomRow = Math.floor(Math.random() * this.numRows);
        const randomCol = Math.floor(Math.random() * this.numCols);
        return [randomRow, randomCol];
    }

    generateMazeAnimated() {
        this._setupMazeGeneration();

        const [initialRow, initialCol] = this.getRandomRowAndCol();
        const stack = new CellStack(this.grid, initialRow, initialCol);
        const animationId = this.currentAnimationId;

        const animate = () => {
            setTimeout(() => {
                if (this.msPerFrame < 0) return this.generateMaze();
                if (!this._isCurrentAnimation(animationId)) return;
                if (stack.length > 0) {
                    this._dfs(stack);
                    this.draw();
                    requestAnimationFrame(animate);
                } else {
                    this.draw(); // Clear active cells after maze is finished
                    this.isMazeReady = true;
                }
            }, this.msPerFrame);
        };

        requestAnimationFrame(animate);
    }

    generateMaze() {
        this._setupMazeGeneration();

        const [initialRow, initialCol] = this.getRandomRowAndCol();
        const stack = new CellStack(this.grid, initialRow, initialCol);

        while (stack.length > 0) {
            this._dfs(stack);
        }

        this.draw();
        this.draw();
        this.isMazeReady = true;
    }

    _setupMazeGeneration() {
        this.currentAnimationId++;
        this.isMazeReady = false;
        this._createExit();
        this._clearGrid();
        this._clearScreen();
    }

    _createExit() {
        [this.exitRow, this.exitCol] = this.getRandomRowAndCol();
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

    exploreCell(row, col) {
        const cell = this.grid[row][col];
        cell.explore();
    }

    unexploreCell(row, col) {
        const cell = this.grid[row][col];
        cell.unexplore();
    }

    unexploreAllCells() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                const cell = this.grid[row][col];
                cell.unexplore();
            }
        }
    }
}
