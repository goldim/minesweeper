/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.Square", {
    extend: qx.ui.form.Button,

    construct(){
        // noinspection JSAnnotator
        super("");
        this.addListener("contextmenu", this._onRightClick, this);
        this.addListener("execute", this._onExecute, this);
    },

    properties: {
        appearance: {
            init: "square",
            refine: true
        },

        mined: {
            init: false,
            check: "Boolean",
            apply: "_applyMined"
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
        },

        blasted: {
            init: false,
            check: "Boolean"
        }
    },

    events: {
        "blast": "qx.event.type.Event",
        "open": "qx.event.type.Event"
    },

    members: {
        _applyMined(){
            this.setValue(9);
        },

        _onExecute(){
            if (this.getBlocked()){
                return;
            }
            if (!this.hasState("flagged")){
                if (this.getMined()){
                    this.setBlasted(true);
                    this.fireEvent("blast");
                } else {
                    this.fireEvent("open");
                }
            }
        },

        _onRightClick(){
            if (this.getBlocked()) {
                return;
            }
            const game = demo.Miner.Game.getInstance();

            if (this.hasState("flagged")){
                this.replaceState("flagged", "questioned");
                game.decreaseSpottedMinesByOne();
            } else if (this.hasState("questioned")){
                this.replaceState("questioned", "cleared");
            } else if (!(demo.Miner.Game.getInstance().getMinesLeft() === 0 && !this.hasState("flagged"))) {
                this.addState("flagged");
                game.increaseSpottedMinesByOne();
            }
        }
    }
});