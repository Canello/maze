export default class Move {
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
