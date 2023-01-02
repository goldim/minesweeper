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
                    count: 10,
                    width: 9,
                    height: 9
                },

                Medium: {
                    count: 10,
                    width: 16,
                    height: 16
                },

                Hard: {
                    count: 99,
                    width: 30,
                    height: 16
                }
            };

            this.__difficulty = difficulty;
            const difficultyOptions = options[difficulty];
            this.__width = difficultyOptions.width;
            this.__height = difficultyOptions.height;
            this.fillBoard(difficultyOptions.width, difficultyOptions.height);
            this.generateMines(difficultyOptions.count, difficultyOptions.width, difficultyOptions.height);
        },

        fillBoard(colCount, rowCount){
            for (let i = 0; i < rowCount; i++){
                for (let j = 0; j < colCount; j++){
                    this.add(this.__createSquare(i, j), {row: j, column: i});
                }
            }
        },

        generateMines(count, width, height){
            while (count){
                const i = this.randomInteger(0, height);
                const j = this.randomInteger(0, width);
                const square = this.getLayout().getCellWidget(i, j);
                if (!square.getMined()){
                    square.setMined(true);
                    count--;
                }
            }
        },

        showAllMines(){
            console.log(this.__width, this.__height);
            for (let i = 0; i < this.__width; i++){
                for (let j = 0; j < this.__height; j++){
                    const square = this.getLayout().getCellWidget(i, j);
                    console.log(square, i, j);
                    if (square instanceof demo.Miner.Square && square.getMined()){
                        square.destroy();
                        this.add(new qx.ui.basic.Atom(null, "demo/Miner/miner.png").set({width: 32, height: 32}), {row: i, column: j});
                    }
                }
            }
        },

        randomInteger(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        },

        evaluateValues(){

        },

        __createSquare(x, y){
            const square = new demo.Miner.Square().set({width: 32, height: 32});
            square.setX(x);
            square.setY(y);
            square.addListener("blast", this._onBlast, this);
            square.addListener("open", this._onOpen, this);
            return square;
        },

        _onOpen(e){
            const square = e.getTarget();
            const x = square.getX();
            const y = square.getY();
            const value = square.getValue();
            square.destroy();
            this.add(new qx.ui.basic.Atom(value.toString()).set({width: 32, height: 32}), {row: y, column: x});
        },

        _onBlast(){
            this.showAllMines();
            this.fireEvent("gameOver");
        }
    }
});