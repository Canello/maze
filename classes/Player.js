export default class Player {
    constructor(
        initialRow = 0,
        initialCol = 0,
        cellWidth,
        cellHeight,
        colors,
        c
    ) {
        this.row = initialRow;
        this.col = initialCol;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.colors = colors;
        this.c = c;
        [this.x, this.y] = this._getCoordinates(this.row, this.col);
        this._blinkCounting = 0;
        this._isShowing = true;
    }

    _getCoordinates(row, col) {
        return [col * this.cellHeight + 2, row * this.cellWidth + 2];
    }

    draw() {
        this.c.fillStyle = this._isShowing
            ? this.colors.player
            : this.colors.blinkingPlayer;
        this.c.fillRect(
            this.x,
            this.y,
            this.cellWidth - 4,
            this.cellHeight - 4
        );
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
