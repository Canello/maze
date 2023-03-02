import Player from "./Player.js";
import Grid from "./Grid.js";
import UI from "./UI.js";
import Timer from "./Timer.js";

export default class Game {
    constructor(numRows, numCols, cellWidth, cellHeight, colors, c, screen) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.colors = colors;
        this.c = c;
        this.screen = screen;
        this._grid = new Grid(
            this.numRows,
            this.numCols,
            this.cellWidth,
            this.cellHeight,
            this.colors,
            this.c,
            this.screen
        );
        this._player = null;
        this._currentGameLoopId = 0;
        this._movePlayer = (event) => this._handleMove(event);
        this.UI = new UI(this, this._grid);
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
        this.c.clearRect(0, 0, this.screen.width, this.screen.height);
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
        this._player = new Player(
            playerInitialRow,
            playerInitialCol,
            this.cellWidth,
            this.cellHeight,
            this.colors,
            this.c
        );
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
