import Move from "./Move.js";

export default class CellStack {
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
