import Game from "./classes/Game.js";

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
const CELL_WIDTH = 20;
const CELL_HEIGHT = 20;
const NUM_ROWS = 24;
const NUM_COLS = 24;
const screen = document.getElementById("screen");
screen.width = NUM_COLS * CELL_WIDTH;
screen.height = NUM_ROWS * CELL_HEIGHT;
const c = screen.getContext("2d");

new Game(NUM_ROWS, NUM_COLS, CELL_WIDTH, CELL_HEIGHT, COLORS, c, screen);
