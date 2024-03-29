/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("minesweeper.Board", {
    extend: qx.ui.container.Composite,

    construct() {
        super(new qx.ui.layout.Grid());
        this.__setupHandlers();
    },

    properties: {
        appearance: {
            init: "board",
            refine: true
        },

        blocked: {
            init: false,
            check: "Boolean",
            apply: "_applyBlocked"
        }
    },

    members: {
        __setupHandlers() {
            const game = minesweeper.Game.getInstance();
            game.addListener("changeDifficulty", function() {
                this.update();
            }, this);
            game.addListener("changeState", function(e) {
                if (e.getData() === "start") {
                    this.update();
                }
            }, this);
        },

        update() {
            this.resetBlocked();
            const game = minesweeper.Game.getInstance();
            this.__colSize = game.getColumnSize();
            this.__rowSize = game.getRowSize();
            this.__mineCount = game.getMineCount();
            this.prepare();
        },

        prepare() {
            this.removeAll();
            this.__fillBoard();
            this.__generateMines();
            this.__evaluateValues();
        },

        _applyBlocked(blocked) {
            this.forEverySquare(function(square) {
                if (this.__isSquare(square)) {
                    square.setBlocked(blocked);
                }
            }.bind(this));
        },

        __fillBoard() {
            this.forEverySquareWithIndexes(function(column, row) {
                this.add(this.__createSquare(column, row), {row, column});
            }.bind(this));
        },

        __generateMines() {
            let count = this.__mineCount;
            while (count) {
                const column = this.randomInteger(0, this.__colSize);
                const row = this.randomInteger(0, this.__rowSize);
                const square = this.getLayout().getCellWidget(row, column);
                if (!square.hasState("mined")) {
                    square.addState("mined");
                    square.setValue(9);
                    count--;
                }
            }
        },

        __getSquareAroundCoords() {
            return [[1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [-1, -1], [-1, 1], [1, -1]];
        },

        showAllMines() {
            this.forEverySquare(function(square) {
                if (this.__isSquare(square) && square.hasState("mined")) {
                    const column = square.getColumnNo();
                    const row = square.getRowNo();
                    const mine = this.__createMineLabel();
                    if (square.hasState("blasted")) {
                        mine.addState("blasted");
                    }
                    square.destroy();

                    this.add(mine, {row, column});
                }
            }.bind(this));
        },

        randomInteger(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        },

        forEverySquareWithIndexes(handler) {
            for (let column = 0; column < this.__colSize; column++) {
                for (let row = 0; row < this.__rowSize; row++) {
                    handler(column, row);
                }
            }
        },

        forEverySquare(handler) {
            this.forEverySquareWithIndexes(function(column, row) {
                const square = this.getLayout().getCellWidget(row, column);
                handler(square);
            }.bind(this));
        },

        __evaluateValues() {
            this.forEverySquare(function(square) {
                if (square instanceof minesweeper.Square) {
                    const count = this.__getSquareAroundCoords()
                        .filter(function(coords) {
                            return this.checkMine(square.getColumnNo() + coords[0], square.getRowNo() + coords[1]);
                        }, this)
                        .length;
                    square.setValue(count);
                }
            }.bind(this));
        },

        __isSquare(square) {
            return square instanceof minesweeper.Square;
        },

        checkMine(column, row) {
            const square = this.getLayout().getCellWidget(row, column);
            return this.__isSquare(square) && square.hasState("mined");
        },

        __createSquare(column, row) {
            const square = new minesweeper.Square().set({width: 32, height: 32});
            square.setColumnNo(column);
            square.setRowNo(row);
            square.addListener("blast", this._onBlast, this);
            square.addListener("open", this._onOpen, this);
            return square;
        },

        _onOpen(e) {
            const square = e.getTarget();
            const column = square.getColumnNo();
            const row = square.getRowNo();
            let value = square.getValue();
            square.destroy();
            if (!value) {
                value = "";
                this.__attended = [];
                this.expandSpaceFromSquare(column, row);
            } else {
                this.add(this.__createColoredLabel(value), {row, column});
            }
            this.__checkFinished();
        },

        __createColoredLabel(value) {
            const valueStr = value.toString();
            const atom = new minesweeper.OpenedSquare(valueStr);
            atom.addState(`mines-around-${valueStr}`);
            return atom;
        },

        __createEmptyLabel() {
            return new minesweeper.OpenedSquare(null);
        },

        __createMineLabel() {
            const mine = new minesweeper.OpenedSquare(null);
            mine.addState("mined");
            return mine;
        },

        __checkOutOfBorders(column, row) {
            return column < 0 || row < 0 || column === this.__colSize || row === this.__rowSize;
        },

        __checkFinished() {
            let countRevealedSquares = 0;
            this.forEverySquare(function(square) {
                if (!(this.__isSquare(square))) {
                    countRevealedSquares++;
                }
            }.bind(this));
            if (countRevealedSquares === (this.__colSize * this.__rowSize) - this.__mineCount) {
                this.setBlocked(true);
                minesweeper.Game.getInstance().setState("success");
            }
        },

        expandSpaceFromSquare(column, row) {
            if (this.__checkOutOfBorders(column, row)) {
                return;
            }
            if (this.__attended.some(coords => coords.column === column && coords.row === row)) {
                return; 
            }
            this.__attended.push({column, row});
            const square = this.getLayout().getCellWidget(row, column);
            if (this.__isSquare(square)) {
                if (!square.hasState("mined")) {
                    if (square.getValue() === 0) {
                        square.destroy();
                        this.add(this.__createEmptyLabel(), {row, column});
                    } else if (square.getValue() > 0) {
                        square.destroy();
                        this.add(this.__createColoredLabel(square.getValue()), {row, column});
                        return;
                    }
                }
            }
            this.__getSquareAroundCoords().forEach(function(coords) {
                this.expandSpaceFromSquare(column + coords[0], row + coords[1]);
            }, this);
        },

        _onBlast() {
            this.showAllMines();
            this.setBlocked(true);
            minesweeper.Game.getInstance().setState("over");
        }
    }
});
