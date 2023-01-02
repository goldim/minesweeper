/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

/**
 * This is an example of a contrib library, providing a very special button
 * @asset(demo/Miner/*)
 */
qx.Class.define("demo.Miner.Board", {
    extend: qx.ui.container.Composite,

    construct(){
        // noinspection JSAnnotator
        super();
        this.setLayout(new qx.ui.layout.Grid());
        this.setDifficulty("Low");
    },

    events: {
        "gameOver": "qx.event.type.Event",
        "finished": "qx.event.type.Event"
    },

    properties: {
        blocked: {
            init: false,
            check: "Boolean",
            apply: "_applyBlocked"
        }
    },

    members: {
        refresh(){
            this.setBlocked(false);
            this.setDifficulty(this.__difficulty);
        },

        setDifficulty(difficulty){
            this.removeAll();

            const options = {
                Low: {
                    mineCount: 10,
                    colSize: 9,
                    rowSize: 9
                },

                Medium: {
                    mineCount: 10,
                    colSize: 16,
                    rowSize: 16
                },

                Hard: {
                    mineCount: 99,
                    colSize: 30,
                    rowSize: 16
                }
            };

            this.__difficulty = difficulty;
            const difficultyOptions = options[difficulty];
            this.__colSize = difficultyOptions.colSize;
            this.__rowSize = difficultyOptions.rowSize;
            this.__mineCount = difficultyOptions.mineCount;
            this.fillBoard();
            this.generateMines(difficultyOptions.mineCount, difficultyOptions.colSize, difficultyOptions.rowSize);
            this.evaluateValues();
        },

        _applyBlocked(blocked){
            this.forEverySquare(function(row, column){
                const square = this.getLayout().getCellWidget(row, column);
                if (square instanceof demo.Miner.Square){
                    square.setBlocked(blocked);
                }
            }.bind(this));
        },

        fillBoard(){
            this.forEverySquare(function(column, row){
                this.add(this.__createSquare(column, row), {row, column});
            }.bind(this));
        },

        generateMines(count, colSize, rowSize){
            while (count){
                const column = this.randomInteger(0, colSize);
                const row = this.randomInteger(0, rowSize);
                const square = this.getLayout().getCellWidget(row, column);
                if (!square.getMined()){
                    square.setMined(true);
                    count--;
                }
            }
        },

        __getSquareAroundCoords(column, row){
            return [
                {column: column + 1, row},
                {column, row: row + 1},
                {column: column + 1, row: row + 1},
                {column: column - 1, row},
                {column, row: row - 1},
                {column: column - 1, row: row - 1},
                {column: column - 1, row: row + 1},
                {column: column + 1, row: row - 1}
            ];
        },

        showAllMines(){
            this.forEverySquare(function(column, row){
                const square = this.getLayout().getCellWidget(row, column);
                if (square instanceof demo.Miner.Square && square.getMined()){
                    square.destroy();
                    this.add(this.__createMineLabel(), {row, column});
                }
            }.bind(this));
        },

        randomInteger(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        },

        forEverySquare(handler){
            for (let column = 0; column < this.__colSize; column++){
                for (let row = 0; row < this.__rowSize; row++){
                    handler(column, row);
                }
            }
        },

        evaluateValues(){
            this.forEverySquare(function(column, row){
                const square = this.getLayout().getCellWidget(row, column);
                if (square instanceof demo.Miner.Square){
                    const count = this.__getSquareAroundCoords(column, row).filter(function(coords) {
                        return this.checkIfMine(coords.column, coords.row)
                    }, this).length;
                    square.setValue(count);
                }
            }.bind(this));
        },

        checkIfMine(column, row){
            const square = this.getLayout().getCellWidget(row, column);
            return square instanceof demo.Miner.Square && square.getMined();
        },

        __createSquare(column, row){
            const square = new demo.Miner.Square().set({width: 32, height: 32});
            square.setColumnNo(column);
            square.setRowNo(row);
            square.addListener("blast", this._onBlast, this);
            square.addListener("open", this._onOpen, this);
            return square;
        },

        _onOpen(e){
            const square = e.getTarget();
            const column = square.getColumnNo();
            const row = square.getRowNo();
            let value = square.getValue();
            square.destroy();
            if (!value){
                value = "";
                this.__attended = [];
                this.openKeyIfZero(column, row);
            } else {
                this.add(this.__createColoredLabel(value), {row, column});
            }
        },

        __createColoredLabel(value){
            const atom = new qx.ui.basic.Atom(value.toString()).set({width: 32, height: 32});
            atom.setTextColor(demo.Miner.Square.CELL_COLORS[value]);
            return atom;
        },

        __createEmptyLabel(){
            return new qx.ui.basic.Atom(null).set({width: 32, height: 32});
        },

        __createMineLabel(){
            return new qx.ui.basic.Atom(null, "demo/Miner/miner.png").set({width: 32, height: 32});
        },

        __checkOutOfBorders(column, row){
            return column < 0 || row < 0 || column === this.__colSize || row === this.__rowSize;
        },

        __checkFinished(){
            let countRevealedSquares = 0;
            this.forEverySquare(function(column, row){
                const square = this.getLayout().getCellWidget(row, column);
                if (!(square instanceof demo.Miner.Square)) {
                    countRevealedSquares++;
                }
            }.bind(this));
            if (countRevealedSquares === (this.__colSize * this.__rowSize) - this.__mineCount){
                this.setBlocked(true);
                this.fireEvent("finished");
            }
        },

        openKeyIfZero(column, row){
            if (this.__checkOutOfBorders(column, row)){
                return;
            }
            if (this.__attended.some(coords => coords.column === column && coords.row === row)) return;
            this.__attended.push({column, row});
            const square = this.getLayout().getCellWidget(row, column);
            if (square instanceof demo.Miner.Square){
                if (square.getValue() === 0 && !square.getMined()){
                    square.destroy();
                    this.add(this.__createEmptyLabel(), {row, column});
                } else if (square.getValue() > 0 && !square.getMined()){
                    square.destroy();
                    this.add(this.__createColoredLabel(square.getValue()), {row, column});
                    return;
                }
            }
            this.__getSquareAroundCoords(column, row).forEach(function(coords) {
                this.openKeyIfZero(coords.column, coords.row);
            }, this);
        },

        _onBlast(){
            this.showAllMines();
            this.setBlocked(true);
            this.fireEvent("gameOver");
        }
    }
});