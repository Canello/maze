export default class Cell {
    constructor(row, col, isExit, cellWidth, cellHeight, colors, c) {
        this.row = row;
        this.col = col;
        this.isExit = isExit;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.colors = colors;
        this.c = c;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true,
        };
        this.x = this.col * this.cellWidth;
        this.y = this.row * this.cellHeight;
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
        } else if (this.active) this.c.fillStyle = this.colors.activeCell;
        else if (this.explored) this.c.fillStyle = this.colors.exploredCell;
        else if (this.visited) this.c.fillStyle = this.colors.visitedCell;
        else this.c.fillStyle = this.colors.blankCell;
        this.c.fillRect(this.x, this.y, this.cellWidth, this.cellHeight);
    }

    _drawExit() {
        this.c.fillStyle = this.colors.visitedCell;
        this.c.fillRect(this.x, this.y, this.cellWidth, this.cellHeight);
        this.c.fillStyle = this.colors.exitCell;
        this.c.fillRect(
            this.x + 2,
            this.y + 2,
            this.cellWidth - 4,
            this.cellHeight - 4
        );
    }

    _drawWalls() {
        if (this.walls.top) {
            this._drawLine(this.x, this.y, this.x + this.cellWidth, this.y);
        }
        if (this.walls.right) {
            this._drawLine(
                this.x + this.cellWidth,
                this.y,
                this.x + this.cellWidth,
                this.y + this.cellHeight
            );
        }
        if (this.walls.bottom) {
            this._drawLine(
                this.x + this.cellWidth,
                this.y + this.cellHeight,
                this.x,
                this.y + this.cellHeight
            );
        }
        if (this.walls.left) {
            this._drawLine(this.x, this.y + this.cellHeight, this.x, this.y);
        }
    }

    _drawLine(xi, yi, xf, yf) {
        this.c.strokeStyle = this.colors.wall;
        this.c.beginPath();
        this.c.moveTo(xi, yi);
        this.c.lineTo(xf, yf);
        this.c.stroke();
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
