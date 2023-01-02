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

    events: {
        "newGame": "qx.event.type.Event"
    },

    members: {
        refresh(){
            this.__state.setStatus("good");
        },

        __createComponents() {
            const mineCounter = this.__mineCounter = new demo.Miner.status.Counter();
            this.__createComponent("left", "west", mineCounter);

            const state = this.__state = new demo.Miner.status.State();
            state.addListener("execute", function(){
                this.refresh();
                this.fireEvent("newGame");
            }, this);
            this.__createComponent("center", "center", state);

            const flagCounter = this.__flagCounter = new demo.Miner.status.Counter()
            this.__createComponent("right", "east", flagCounter);
        },

        __createComponent(alignX, edge, component){
            const block = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({alignX}));
            block.add(component);
            this.add(block, {edge});
        },

        gameOver(){
            this.__state.setStatus("fail");
        },

        finish(){
            this.__state.setStatus("finished");
        }
    }
});