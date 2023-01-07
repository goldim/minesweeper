/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("minesweeper.ToolBar", {
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
            const newButton = new qx.ui.menu.Button("New");
            newButton.addListener("execute", function(){
                minesweeper.Game.getInstance().startNew();
            }, this);
            menu.add(newButton);

            const difficultyButton = new qx.ui.menu.Button("Difficulty");
            difficultyButton.setMenu(this.__createDifficultyMenu());
            menu.add(difficultyButton);

            return menu;
        },

        __createDifficultyMenu(){
            const menu = new qx.ui.menu.Menu();
            const difficulties = minesweeper.Game.getDifficulties();
            const difficultyGroup = new qx.ui.form.RadioGroup();
            difficulties.forEach(difficulty => {
                const capitalized = qx.lang.String.firstUp(difficulty);
                const button = new qx.ui.menu.RadioButton(capitalized, null);
                menu.add(button);
                difficultyGroup.add(button);
            });
            difficultyGroup.addListener("changeValue", function(e){
                const value = qx.lang.String.firstLow(e.getData().getLabel());
                minesweeper.Game.getInstance().setDifficulty(value);
            }, this);
            return menu;
        },

        __createAboutMenu(){
            return new qx.ui.toolbar.MenuButton("Help");
        }
    }
});