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

    members: {
        __createComponents() {
            this.__createComponent("left", "west", new demo.Miner.status.Counter());
            this.__createComponent("center", "center", new demo.Miner.status.State());
            this.__createComponent("right", "east", new demo.Miner.status.Counter());
        },

        __createComponent(alignX, edge, component){
            const block = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({alignX}));
            block.add(component);
            this.add(block, {edge});
        }
    }
});