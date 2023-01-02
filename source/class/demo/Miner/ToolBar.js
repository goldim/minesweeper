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

    events: {
        "changeDifficulty": "qx.event.type.Data"
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
            const newButton = new qx.ui.menu.Button("New");
            menu.add(newButton);

            const difficultyButton = new qx.ui.menu.Button("Difficulty");
            difficultyButton.setMenu(this.__createDifficultyMenu());
            menu.add(difficultyButton);

            return menu;
        },

        __createDifficultyMenu(){
            const menu = new qx.ui.menu.Menu();
            const low = new qx.ui.menu.RadioButton("Low", null);
            const medium = new qx.ui.menu.RadioButton("Medium", null)
            const hard = new qx.ui.menu.RadioButton("Hard", null);
            menu.add(low);
            menu.add(medium);
            menu.add(hard);
            const difficultyGroup = new qx.ui.form.RadioGroup(low, medium, hard);
            difficultyGroup.addListener("changeValue", function(e){
                this.fireDataEvent("changeDifficulty", e.getData().getLabel());
            }, this);
            return menu;
        },

        __createAboutMenu(){
            return new qx.ui.toolbar.MenuButton("Help");
        }
    }
});