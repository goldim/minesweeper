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
                demo.Miner.Game.getInstance().startNew();
            }, this);
            this.__createComponent("center", "center", state);

            const flagCounter = this.__flagCounter = new demo.Miner.status.Counter()
            this.__createComponent("right", "east", flagCounter);

            const game = demo.Miner.Game.getInstance();
            game.addListener("changeState", function(e){
                const state = e.getData();
                switch (state){
                    case "start":
                        this.__state.setStatus("good");
                        break;
                    case "over":
                        this.__state.setStatus("fail");
                        break;
                    case "success":
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