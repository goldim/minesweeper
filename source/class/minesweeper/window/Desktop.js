/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("minesweeper.window.Desktop", {
    extend: qx.ui.window.Desktop,
    type: "singleton",

    construct() {
        super(new qx.ui.window.Manager());
        this.__createMainWindow();
        this.__aboutWindow = this.__createAboutWindow();
    },

    members: {
        openAboutWindow(){
            this.__aboutWindow.open();
        },

        __createMainWindow(){
            const mainWin = new minesweeper.window.Main();
            this.add(mainWin);
            mainWin.open();
        },

        __createAboutWindow(){
            const window = new minesweeper.window.About();
            this.add(window);
            return window;
        }
    }
});
