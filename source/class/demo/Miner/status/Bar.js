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
        this.setLayout(new qx.ui.layout.HBox());

        this.__createComponents();
    },

    members: {
        __createComponents() {
            this.add(new demo.Miner.status.Counter());
            this.add(new demo.Miner.status.State());
            this.add(new demo.Miner.status.Counter());
        }
    }
});