/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

/**
 * This is an example of a contrib library, providing a very special button
 * @asset(demo/Miner/*)
 */
qx.Class.define("demo.Miner.window.Main", {
    extend: qx.ui.window.Window,

    construct(){
        // noinspection JSAnnotator
        super("Miner");
        this.set({
            allowMaximize: false
        });
        this.setLayout(new qx.ui.layout.Dock());
        const topContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        topContainer.setPadding(10);
        topContainer.add(this.__createToolBar());
        topContainer.add(new demo.Miner.status.Bar());
        this.add(topContainer, {edge: "north"});
        this.__createBoard();
    },

    members: {
        __createToolBar(){
            return new demo.Miner.ToolBar();
        },

        __createBoard(){
            this.add(new demo.Miner.Board().set({width: 250, height: 250}), {edge: "center"});
        }
    }
});