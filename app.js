const COLORS = {
    player: "coral",
    blinkingPlayer: "#e63946",
    blankCell: "#cfcfce",
    activeCell: "#63bec2",
    visitedCell: "#e0e1dd",
    exploredCell: "#e8cbbe",
    exitCell: "#87c97b",
    wall: "#4d4f45",
};
let MS_PER_FRAME = 0;
const CELL_WIDTH = 20;
const CELL_HEIGHT = 20;
const NUM_ROWS = 24;
const NUM_COLS = 24;
const screen = document.getElementById("screen");
screen.width = NUM_COLS * CELL_WIDTH;
screen.height = NUM_ROWS * CELL_HEIGHT;
const c = screen.getContext("2d");

class Cell {
    constructor(row, col, isExit) {
        this.row = row;
        this.col = col;
        this.isExit = isExit;
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
        this.explored = false;
    }

    isDuplicate(anotherCell) {
        return this.row === anotherCell.row && this.col === anotherCell.col;
    }

    draw() {
        this._drawBackground();
        this._drawWalls();
    }

    _drawBackground() {
        if (this.isExit) {
            this._drawExit();
            return;
        } else if (this.active) c.fillStyle = COLORS.activeCell;
        else if (this.explored) c.fillStyle = COLORS.exploredCell;
        else if (this.visited) c.fillStyle = COLORS.visitedCell;
        else c.fillStyle = COLORS.blankCell;
        c.fillRect(this.x, this.y, CELL_WIDTH, CELL_HEIGHT);
    }

    _drawExit() {
        c.fillStyle = COLORS.visitedCell;
        c.fillRect(this.x, this.y, CELL_WIDTH, CELL_HEIGHT);
        c.fillStyle = COLORS.exitCell;
        c.fillRect(this.x + 2, this.y + 2, CELL_WIDTH - 4, CELL_HEIGHT - 4);
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
        c.strokeStyle = COLORS.wall;
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

    explore() {
        this.explored = true;
    }

    unexplore() {
        this.explored = false;
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
        this._blinkCounting = 0;
        this._isShowing = true;
    }

    _getCoordinates(row, col) {
        return [col * CELL_HEIGHT + 2, row * CELL_WIDTH + 2];
    }

    draw() {
        c.fillStyle = this._isShowing ? COLORS.player : COLORS.blinkingPlayer;
        c.fillRect(this.x, this.y, CELL_WIDTH - 4, CELL_HEIGHT - 4);
    }

    moveTo(row, col) {
        this.row = row;
        this.col = col;
        [this.x, this.y] = this._getCoordinates(row, col);
    }

    blink() {
        const blinkFrameInterval = 15;
        this._isShowing = this._blinkCounting <= blinkFrameInterval;
        if (this._blinkCounting <= 1.5 * blinkFrameInterval) {
            this._blinkCounting++;
        } else {
            this._blinkCounting = 0;
        }
    }
}

class Grid {
    constructor() {
        this.isMazeReady = false;
        this.currentAnimationId = 0;
        this.numRows = Math.floor(screen.height / CELL_HEIGHT);
        this.numCols = Math.floor(screen.width / CELL_WIDTH);
        this.exitRow = null;
        this.exitCol = null;
        this.grid = this._buildGrid();
        this.draw();
    }

    _makeGridFilledWithZeros(numRows, numCols) {
        return Array(numRows)
            .fill(0)
            .map(() => Array(numCols).fill(0));
    }

    _fillGridWithCells(grid) {
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                grid[row][col] = new Cell(row, col, this.isExit(row, col));
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

    _isValidCell(row, col) {
        return this._isInsideGrid(row, col) && !this._hasBeenVisited(row, col);
    }

    _hasBeenVisited(row, col) {
        return this.grid[row][col].visited === true;
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
        const nextRow = row + deltaRow;
        const nextCol = col + deltaCol;

        if (this._isValidCell(nextRow, nextCol)) {
            stack.push(new Move(this.grid[nextRow][nextCol], currentCell));
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
                if (MS_PER_FRAME < 0) return this.generateMaze();
                if (!this._isCurrentAnimation(animationId)) return;
                if (stack.length > 0) {
                    this._dfs(stack);
                    this.draw();
                    requestAnimationFrame(animate);
                } else {
                    this.draw(); // Clear active cells after maze is finished
                    this.isMazeReady = true;
                }
            }, MS_PER_FRAME);
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

class UI {
    constructor(game) {
        this._game = game;
        this._setupButtons();
        this.resetTime();
        this._currentTimerTipId = 0;
        this._currentMazeIsNotReadyTipId = 0;
    }

    setTime(time) {
        const timer = document.getElementById("timer");
        timer.innerHTML = "";
        const newTime = document.createTextNode(time);
        timer.appendChild(newTime);
    }

    resetTime() {
        const timer = document.getElementById("timer");
        const time = document.createTextNode(30);
        timer.appendChild(time);
    }

    _setupButtons() {
        this._setupAnimateButton();
        this._setupPlayButton();
        this._setupAnimationSpeedButtons();
        this._setVictoryButton();
        this._setDefeatButton();
    }

    _setVictoryButton() {
        const victoryButton = document.getElementById("victory-button");
        victoryButton.addEventListener("click", () => this.confirmVictory());
    }

    _setDefeatButton() {
        const defeatButton = document.getElementById("defeat-button");
        defeatButton.addEventListener("click", () => this.confirmDefeat());
    }

    _setupAnimateButton() {
        const animateButton = document.getElementById("animate");
        animateButton.addEventListener("click", () =>
            this._game.generateMazeAnimated()
        );
    }

    _setupPlayButton() {
        const playButton = document.getElementById("play");
        playButton.addEventListener("click", () => this._game.start());
    }

    _setupAnimationSpeedButtons() {
        const slowButton = document.getElementById("animation-slow");
        const mediumButton = document.getElementById("animation-medium");
        const fastButton = document.getElementById("animation-fast");
        const instantaneousButton = document.getElementById(
            "animation-instantaneous"
        );
        slowButton.addEventListener("click", () => {
            this._setAnimationSpeed("slow");
            this._setCurrentSpeedButton("slow");
        });
        mediumButton.addEventListener("click", () => {
            this._setAnimationSpeed("medium");
            this._setCurrentSpeedButton("medium");
        });
        mediumButton.click();
        fastButton.addEventListener("click", () => {
            this._setAnimationSpeed("fast");
            this._setCurrentSpeedButton("fast");
        });
        instantaneousButton.addEventListener("click", () => {
            this._setAnimationSpeed("instantaneous");
            this._setCurrentSpeedButton("instantaneous");
        });
    }

    _setCurrentSpeedButton(speed) {
        const buttons = {
            slow: document.getElementById("animation-slow"),
            medium: document.getElementById("animation-medium"),
            fast: document.getElementById("animation-fast"),
            instantaneous: document.getElementById("animation-instantaneous"),
        };

        const currentButton = buttons[speed];
        const otherButtons = Object.keys(buttons)
            .filter((key) => key !== speed)
            .map((key) => buttons[key]);

        for (let button of otherButtons) {
            button.classList.remove("current-speed");
        }
        currentButton.classList.add("current-speed");
    }

    _setAnimationSpeed(speed) {
        if (speed === "fast") MS_PER_FRAME = 0;
        else if (speed === "medium") MS_PER_FRAME = 50;
        else if (speed === "slow") MS_PER_FRAME = 100;
        else if (speed === "instantaneous") MS_PER_FRAME = -1;
    }

    showVictoryPopUp() {
        const popUp = document.getElementById("victory-pop-up");
        popUp.classList.remove("hidden");
    }

    confirmVictory() {
        this._hideVictoryPopUp();
        this._game.reset();
    }

    confirmDefeat() {
        this.hideDefeatPopUp();
        this._game.reset();
    }

    _hideVictoryPopUp() {
        const popUp = document.getElementById("victory-pop-up");
        popUp.classList.add("hidden");
    }

    showMazeIsNotReadyTip() {
        this._currentMazeIsNotReadyTipId++;
        const mazeIsNotReadyTipId = this._currentMazeIsNotReadyTipId;

        const mazeIsNotReadyTip = document.getElementById(
            "maze-is-not-ready-tip"
        );
        mazeIsNotReadyTip.classList.remove("hidden");
        setTimeout(() => {
            if (mazeIsNotReadyTipId === this._currentMazeIsNotReadyTipId)
                this.hideMazeIsNotReadyTip();
        }, 3000);
    }

    hideMazeIsNotReadyTip() {
        const mazeIsNotReadyTip = document.getElementById(
            "maze-is-not-ready-tip"
        );
        mazeIsNotReadyTip.classList.add("hidden");
    }

    showTimerTip() {
        this._currentTimerTipId++;
        const timerTipId = this._currentTimerTipId;

        const timerTip = document.getElementById("timer-tip");
        timerTip.classList.remove("hidden");
        setTimeout(() => {
            if (timerTipId === this._currentTimerTipId) this.hideTimerTip();
        }, 5000);
    }

    hideTimerTip() {
        const timerTip = document.getElementById("timer-tip");
        timerTip.classList.add("hidden");
    }

    showDefeatTip() {
        const defeatTip = document.getElementById("defeat-tip");
        defeatTip.classList.remove("hidden");
    }

    hideDefeatTip() {
        const defeatTip = document.getElementById("defeat-tip");
        defeatTip.classList.add("hidden");
    }

    showDefeatPopUp() {
        const defeatPopUp = document.getElementById("defeat-pop-up");
        defeatPopUp.classList.remove("hidden");
    }

    hideDefeatPopUp() {
        const defeatPopUp = document.getElementById("defeat-pop-up");
        defeatPopUp.classList.add("hidden");
    }
}

class Timer {
    constructor(UI, initialTime = 60) {
        this.UI = UI;
        this.initialTime = initialTime;
        this.time = this.initialTime;
        this.currentCountingId = 0;
        this._setup();
    }

    _setup() {
        this.isRunning = true;
        this.UI.setTime(this.time);
        this.currentCountingId++;
    }

    _updateTime(countingId) {
        setTimeout(() => {
            if (!this.isRunning) return;
            if (countingId === this.currentCountingId) {
                this.time--;
                this.UI.setTime(this.time);
                this._updateTime(countingId);
            }
        }, 1000);
    }

    start() {
        this.UI.showTimerTip();
        this._setup();
        const countingId = this.currentCountingId;
        this._updateTime(countingId);
    }

    stop() {
        this.isRunning = false;
        this.UI.hideTimerTip();
    }

    restart() {
        this.isRunning = true;
        this.start();
    }

    reset() {
        this.time = this.initialTime;
        this.UI.setTime(this.time);
        this.UI.hideTimerTip();
    }
}

class Game {
    constructor() {
        this._grid = new Grid();
        this._player = null;
        this._currentGameLoopId = 0;
        this._movePlayer = (event) => this._handleMove(event);
        this.UI = new UI(this);
        this.timer = new Timer(this.UI);
    }

    generateMazeAnimated() {
        this.UI.hideMazeIsNotReadyTip();
        this.timer.stop();
        this.reset();
        this._grid.generateMazeAnimated();
    }

    generateMaze() {
        this.UI.hideMazeIsNotReadyTip();
        this.timer.stop();
        this.reset();
        this._grid.generateMaze();
    }

    start() {
        if (!this._grid.isMazeReady) this.UI.showMazeIsNotReadyTip();
        this.reset();
        this._setup();
        this._startGameLoop();
    }

    _startGameLoop() {
        const gameLoopId = this._currentGameLoopId;

        const animate = () => {
            if (!this._player) return;
            if (!this._grid.isMazeReady) return;
            if (gameLoopId !== this._currentGameLoopId) return;
            if (this._hasFinished()) this._handleFinish();
            if (this._hasLost()) this._handleDefeat();
            this._draw();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    _hasFinished() {
        return this._grid.isExit(this._player.row, this._player.col);
    }

    _hasLost() {
        return this.timer.time < 0;
    }

    _handleFinish() {
        this.timer.stop();
        if (this._hasLost()) {
            this.UI.showDefeatPopUp();
        } else {
            this.UI.showVictoryPopUp();
        }
    }

    _handleDefeat() {
        this.UI.showDefeatTip();
    }

    _clearScreen() {
        c.clearRect(0, 0, screen.width, screen.height);
    }

    _draw() {
        this._clearScreen();
        this._grid.draw();
        if (this._player) {
            this._player.blink();
            this._player.draw();
        }
    }

    _setup() {
        if (this._grid.isMazeReady) {
            this._createPlayer();
            this._listenToPlayerMoves();
            this._currentGameLoopId++;
            this.timer.start();
        }
    }

    reset() {
        this._unlistenToPlayerMoves();
        this._deletePlayer();
        this._grid.unexploreAllCells();
        this.timer.reset();
        this.UI.hideDefeatTip();
        this._draw();
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
            this._grid.exploreCell(currentRow, currentCol);
            this._grid.exploreCell(nextRow, nextCol);
        }
    }

    _getMove(key) {
        const allowedMoves = {
            ArrowUp: [-1, 0],
            w: [-1, 0],

            ArrowLeft: [0, -1],
            a: [0, -1],

            ArrowDown: [1, 0],
            s: [1, 0],

            ArrowRight: [0, 1],
            d: [0, 1],
        };
        return allowedMoves[key];
    }
}

new Game();