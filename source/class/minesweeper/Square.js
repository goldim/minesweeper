/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("minesweeper.Square", {
    extend: qx.ui.form.Button,

    construct() {
        super("");
        this.addListener("contextmenu", this._onRightClick, this);
        this.addListener("execute", this._onExecute, this);
    },

    properties: {
        appearance: {
            init: "square",
            refine: true
        },

        value: {
            init: 0,
            check: "Integer"
        },

        columnNo: {
            init: 0,
            check: "Integer"
        },

        rowNo: {
            init: 0,
            check: "Integer"
        },

        blocked: {
            init: false,
            check: "Boolean"
        }
    },

    events: {
        "open": "qx.event.type.Event",
        "blast": "qx.event.type.Event"
    },

    members: {
        _onExecute() {
            if (this.getBlocked()) {
                return;
            }
            if (!this.hasState("flagged")) {
                if (this.hasState("mined")) {
                    this.addState("blasted");
                    this.fireEvent("blast");
                } else {
                    this.fireEvent("open");
                }
            }
        },

        _onRightClick() {
            if (this.getBlocked()) {
                return;
            }
            const game = minesweeper.Game.getInstance();

            if (this.hasState("flagged")) {
                this.replaceState("flagged", "questioned");
                game.decreaseSpottedMinesByOne();
            } else if (this.hasState("questioned")) {
                this.removeState("questioned");
            } else if (!(minesweeper.Game.getInstance().getMinesLeft() === 0 && !this.hasState("flagged"))) {
                this.addState("flagged");
                game.increaseSpottedMinesByOne();
            }
        }
    }
});
