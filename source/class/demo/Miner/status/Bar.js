/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.status.Bar", {
    extend: qx.ui.container.Composite,

    construct(){
        // noinspection JSAnnotator
        super();
        this.setLayout(new qx.ui.layout.Dock());
        this.__createComponents();
    },

    properties: {
        time: {
            init: "--:--",
            check: "String",
            event: "changeTime"
        }
    },

    statics: {
        addTrailingZeros(value){
            let firstDigit = "";
            if (value < 100){
                firstDigit = "0";
            }
            let secondDigit = "";
            if (value < 10){
                secondDigit = "0";
            }
            return `${firstDigit}${secondDigit}${value}`;
        },

        convertTime(timeInSeconds){
            const minutes = Math.floor(timeInSeconds / 60);
            const minuteTrailingZero = minutes < 10 ? "0" : "";
            const seconds = timeInSeconds % 60;
            const secondsTrailingZero = seconds < 10 ? "0" : "";
            return `${minuteTrailingZero}${minutes}:${secondsTrailingZero}${seconds}`;
        }
    },

    members: {
        __createComponents() {
            const game = demo.Miner.Game.getInstance();

            const minesLeftLabel = new qx.ui.basic.Atom();
            game.bind("minesLeft", minesLeftLabel, "label", {converter: this.constructor.addTrailingZeros});
            this.__createComponent("left", "west", minesLeftLabel);

            const state = new demo.Miner.status.State();
            game.bind("state", state, "status");
            state.addListener("execute", function(){
                game.startNew();
            }, this);
            this.__createComponent("center", "center", state);

            const timeLabel = new qx.ui.basic.Atom();
            game.getTimer().bind("time", timeLabel, "label", {converter: this.constructor.convertTime});
            this.__createComponent("right", "east", timeLabel);
        },

        __createComponent(alignX, edge, component){
            const block = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({alignX}));
            block.add(component);
            this.add(block, {edge});
        }
    }
});