/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.ToolBar", {
    extend: qx.ui.toolbar.ToolBar,

    construct(){
        // noinspection JSAnnotator
        super();

        this.__createComponents();
    },

    members: {
        __createComponents(){
            this.add(this.__createGameMenu());
            this.add(this.__createAboutMenu());
        },

        __createGameMenu(){
            const button = new qx.ui.toolbar.MenuButton("Game");
            button.setMenu(this.getGameMenu());
            return button;
        },

        getGameMenu() {
            const menu = new qx.ui.menu.Menu();

            const newButton = new qx.ui.menu.Button(
                "New"
            );

            menu.add(newButton);

            return menu;
        },

        __createAboutMenu(){
            const menu = new qx.ui.toolbar.MenuButton("Help");
            return menu;
        }
    }
});