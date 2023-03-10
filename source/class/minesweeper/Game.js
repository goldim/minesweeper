/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("minesweeper.Game", {
    extend: qx.core.Object,
    type: "singleton",

    construct() {
        // noinspection JSAnnotator
        super();
        this.__timer = new minesweeper.Timer();
    },

    properties: {
        minesLeft: {
            init: 0,
            check: "Integer",
            event: "changeMinesLeft"
        },

        difficulty: {
            init: "low",
            check: function(value) {
                return minesweeper.Game.getDifficulties().includes(value);
            },
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
        DIFFICULTY_OPTIONS: {
            low: {
                mineCount: 10,
                colSize: 9,
                rowSize: 9
            },

            medium: {
                mineCount: 40,
                colSize: 16,
                rowSize: 16
            },

            hard: {
                mineCount: 99,
                colSize: 30,
                rowSize: 16
            }
        },

        getDifficulties() {
            return Object.keys(minesweeper.Game.DIFFICULTY_OPTIONS);
        }
    },

    members: {
        _applyState(state) {
            switch (state) {
                case "start":
                    this.__timer.start();
                    break;
                case "over":
                case "success":
                    this.setMinesLeft(0);
                    this.__timer.stop();
                    break;
            }
        },

        _applyDifficulty() {
            this.setState("start");
            this.__timer.start();
            this.__updateMinesLeft();
        },

        __updateMinesLeft() {
            this.setMinesLeft(this.getMineCount());
        },

        startNew() {
            this.setState("over");
            this.setState("start");
            this.__updateMinesLeft();
        },

        getMineCount() {
            return this.__extractFieldFromMap("mineCount");
        },

        getColumnSize() {
            return this.__extractFieldFromMap("colSize");
        },

        getRowSize() {
            return this.__extractFieldFromMap("rowSize");
        },

        __extractFieldFromMap(difficulty) {
            return this.constructor.DIFFICULTY_OPTIONS[this.getDifficulty()][difficulty];
        },

        decreaseSpottedMinesByOne() {
            this.setMinesLeft(this.getMinesLeft() + 1);
        },

        increaseSpottedMinesByOne() {
            this.setMinesLeft(this.getMinesLeft() - 1);
        },

        getTimer() {
            return this.__timer;
        }
    }
});
