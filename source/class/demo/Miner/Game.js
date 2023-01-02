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
        difficulty: {
            init: "Low",
            check: ["Low", "Medium", "Hard"],
            event: "changeDifficulty"
        },

        state: {
            init: "start",
            check: ["start", "over", "success"],
            event: "changeState"
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
                mineCount: 10,
                colSize: 16,
                rowSize: 16
            },

            Hard: {
                mineCount: 99,
                colSize: 30,
                rowSize: 16
            }
        },

        SQUARE_COLORS: [ "", "blue", "green", "red", "purple", "yellow" ],

        getSquareColorByCode(code){
            return demo.Miner.Game.SQUARE_COLORS[code];
        }
    },

    members: {
        startNew(){
            this.setState("over");
            this.setState("start");
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
        }
    }
});