/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.Game", {
    extend: qx.core.Object,
    type: "singleton",

    construct(){
        // noinspection JSAnnotator
        super();
    },

    properties: {
        minesLeft: {
            init: 0,
            check: "Integer",
            event: "changeMinesLeft"
        },

        difficulty: {
            init: "Low",
            check: ["Low", "Medium", "Hard"],
            event: "changeDifficulty",
            apply: "_applyDifficulty"
        },

        state: {
            init: "start",
            check: ["start", "over", "success"],
            event: "changeState",
            apply: "_applyState"
        }
    },

    statics: {
        DIFFICULTY_MAP: {
            Low: {
                mineCount: 10,
                colSize: 9,
                rowSize: 9
            },

            Medium: {
                mineCount: 40,
                colSize: 16,
                rowSize: 16
            },

            Hard: {
                mineCount: 99,
                colSize: 30,
                rowSize: 16
            }
        },

        SQUARE_COLORS: [ "", "blue", "green", "red", "navy", "brown", "cyan", "black", "white"],

        getSquareColorByCode(code){
            return demo.Miner.Game.SQUARE_COLORS[code];
        }
    },

    members: {
        _applyState(state){
            if (state === "over"){
                this.setMinesLeft(0);
            }
        },

        _applyDifficulty(){
            this.__updateMinesLeft();
        },

        __updateMinesLeft(){
            this.setMinesLeft(this.getMineCount());
        },

        startNew(){
            this.setState("over");
            this.setState("start");
            this.__updateMinesLeft();
        },

        getMineCount(){
            return this.__extractFieldFromMap("mineCount");
        },

        getColumnSize(){
            return this.__extractFieldFromMap("colSize");
        },

        getRowSize(){
            return this.__extractFieldFromMap("rowSize");
        },

        __extractFieldFromMap(difficulty){
            return this.constructor.DIFFICULTY_MAP[this.getDifficulty()][difficulty];
        },

        decreaseSpottedMinesByOne(){
            this.setMinesLeft(this.getMinesLeft() + 1);
        },

        increaseSpottedMinesByOne(){
            this.setMinesLeft(this.getMinesLeft() - 1);
        }
    }
});