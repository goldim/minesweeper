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

        this.__timer = new qx.event.Timer(1000);
        this.__timer.addListener("interval", this.updateTime, this);
        this.__seconds = -1;
        this.__createComponents();
    },

    properties: {
        time: {
            init: "--:--",
            check: "String",
            event: "changeTime"
        }
    },

    members: {
        __seconds: null,

        refresh(){
            this.__state.setStatus("good");
        },

        updateTime(){
            this.__seconds++;
            const minutes = Math.floor(this.__seconds / 60);
            const minuteTrailingZero = minutes < 10 ? "0" : "";
            const seconds = this.__seconds % 60;
            const secondsTrailingZero = seconds < 10 ? "0" : "";
            console.log(`${minuteTrailingZero}${minutes}:${secondsTrailingZero}${seconds}`, secondsTrailingZero);
            this.setTime(`${minuteTrailingZero}${minutes}:${secondsTrailingZero}${seconds}`);
        },

        __createComponents() {
            const minesLeftLabel = this.__minesLeftLabel = new qx.ui.basic.Atom();
            demo.Miner.Game.getInstance().bind("minesLeft", minesLeftLabel, "label");
            this.__createComponent("left", "west", minesLeftLabel);

            const state = this.__state = new demo.Miner.status.State();
            state.addListener("execute", function(){
                this.refresh();
                demo.Miner.Game.getInstance().startNew();
            }, this);
            this.__createComponent("center", "center", state);

            const timeLabel = this.__timeLabel = new qx.ui.basic.Atom();
            this.bind("time", timeLabel, "label");
            this.__createComponent("right", "east", timeLabel);

            const game = demo.Miner.Game.getInstance();
            game.addListener("changeState", function(e){
                const state = e.getData();
                switch (state){
                    case "start":
                        this.__state.setStatus("good");
                        this.__seconds = -1;
                        this.updateTime();
                        this.__timer.start();
                        break;
                    case "over":
                        this.__timer.stop();
                        this.__state.setStatus("fail");
                        break;
                    case "success":
                        this.__timer.stop();
                        this.__state.setStatus("finished");
                        break;
                }
            }, this)
        },

        __createComponent(alignX, edge, component){
            const block = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({alignX}));
            block.add(component);
            this.add(block, {edge});
        }
    }
});