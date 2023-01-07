/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

/**
 * This is an example of a contrib library, providing a very special button
 * @asset(minesweeper/*)
 */
qx.Class.define("minesweeper.window.Main", {
    extend: qx.ui.window.Window,
    include: qx.locale.MTranslation,

    properties: {
        appearance: {
            init: "main-window",
            refine: true
        }
    },

    construct(){
        // noinspection JSAnnotator
        super(this.tr("Minesweeper"));
        this.set({
            allowMaximize: false,
            resizable: [false, false, false, false]
        });
        this.setLayout(new qx.ui.layout.Dock());
        const topContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        const toolbar = this.__createToolBar();
        topContainer.add(toolbar);
        const statusBar = new minesweeper.status.Bar();
        topContainer.add(statusBar);
        this.add(topContainer, {edge: "north"});
        this.__createBoard();
    },

    members: {
        __createToolBar(){
            return new minesweeper.ToolBar();
        },

        __createBoard(){
            const board = new minesweeper.Board();
            this.add(board, {edge: "center"});
            return board;
        }
    }
});