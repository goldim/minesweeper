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

    properties: {
        appearance: {
            init: "main-window",
            refine: true
        }
    },

    construct(){
        // noinspection JSAnnotator
        super("Miner");
        this.set({
            allowMaximize: false,
            resizable: [false, false, false, false],
            centerOnAppear: true,
            centerOnContainerResize: true
        });
        this.setLayout(new qx.ui.layout.Dock());
        const topContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        const toolbar = this.__createToolBar();
        topContainer.add(toolbar);
        const statusBar = new demo.Miner.status.Bar();
        topContainer.add(statusBar);
        this.add(topContainer, {edge: "north"});
        this.__createBoard();
    },

    members: {
        __createToolBar(){
            return new demo.Miner.ToolBar();
        },

        __createBoard(){
            const board = new demo.Miner.Board();
            this.add(board, {edge: "center"});
            return board;
        }
    }
});