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
        this.__makeExecutable();
    },

    properties: {
        flagged: {
            init: false,
            check: "Boolean",
            apply: "_applyFlagged"
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
            check: "Boolean",
            apply: "_applyBlocked"
        }
    },

    events: {
        "blast": "qx.event.type.Event",
        "open": "qx.event.type.Event"
    },

    members: {
        _applyBlocked(blocked){
            if (blocked){
                if (this.__executeHandler){
                    this.removeListenerById(this.__executeHandler);
                }
            } else {
                this.__makeExecutable();
            }
        },

        __makeExecutable(){
            this.__executeHandler = this.addListener("execute", this._onExecute, this);
        },

        _applyMined(){
            this.setValue(9);
        },

        _applyFlagged(value){
            if (value){
                this.setIcon("@MaterialIcons/flag/16");
            } else {
                this.setIcon(null);
            }
        },

        _onExecute(){
            if (!this.getFlagged()){
                if (this.getMined()){
                    this.fireEvent("blast");
                } else {
                    this.fireEvent("open");
                }
            }
        },

        _onRightClick(){
            if (!this.getBlocked()){
                this.setFlagged(!this.getFlagged());
            }
        }
    }
});