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

    members: {
        refresh(){
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
            this.fillBoard(difficultyOptions.colSize, difficultyOptions.rowSize);
            this.generateMines(difficultyOptions.mineCount, difficultyOptions.colSize, difficultyOptions.rowSize);
            this.evaluateValues();
        },

        fillBoard(colCount, rowCount){
            for (let column = 0; column < colCount; column++){
                for (let row = 0; row < rowCount; row++){
                    this.add(this.__createSquare(column, row), {row, column});
                }
            }
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

        showAllMines(){
            for (let column = 0; column < this.__colSize; column++){
                for (let row = 0; row < this.__rowSize; row++){
                    const square = this.getLayout().getCellWidget(row, column);
                    if (square instanceof demo.Miner.Square && square.getMined()){
                        square.destroy();
                        this.add(new qx.ui.basic.Atom(null, "demo/Miner/miner.png").set({width: 32, height: 32}), {row, column});
                    }
                }
            }
        },

        randomInteger(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        },

        evaluateValues(){
            for (let column = 0; column < this.__colSize; column++){
                for (let row = 0; row < this.__rowSize; row++){
                    const square = this.getLayout().getCellWidget(row, column);
                    if (square instanceof demo.Miner.Square){
                        const count = [
                            {column: column + 1, row},
                            {column, row: row + 1},
                            {column: column + 1, row: row + 1},
                            {column: column - 1, row},
                            {column, row: row - 1},
                            {column: column - 1, row: row - 1},
                            {column: column - 1, row: row + 1},
                            {column: column + 1, row: row - 1}
                        ].filter(function(coords) { return this.checkIfMine(coords.column, coords.row) }, this).length;
                        square.setValue(count);
                    }
                }
            }
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
                this.add(new qx.ui.basic.Atom(value.toString()).set({width: 32, height: 32}), {row, column});
            }
        },

        openKeyIfZero(column, row){
            if (column < 0 || row < 0 || column === this.__colSize || row === this.__rowSize){
                return;
            }
            if (this.__attended.some(coords => coords.column === column && coords.row === row)) return;
            this.__attended.push({column, row});
            const square = this.getLayout().getCellWidget(row, column);
            if (square instanceof demo.Miner.Square){
                if (square.getValue() === 0 && !square.getMined()){
                    square.destroy();
                    this.add(new qx.ui.basic.Atom(null).set({width: 32, height: 32}), {row, column});
                } else if (square.getValue() > 0 && !square.getMined()){
                    square.destroy();
                    this.add(new qx.ui.basic.Atom(square.getValue().toString()).set({width: 32, height: 32}), {row, column});
                    return;
                }
            }
            this.openKeyIfZero(column - 1, row);
            this.openKeyIfZero(column + 1, row);
            this.openKeyIfZero(column, row + 1);
            this.openKeyIfZero(column, row - 1);
        },

        _onBlast(){
            this.showAllMines();
            this.fireEvent("gameOver");
        }
    }
});