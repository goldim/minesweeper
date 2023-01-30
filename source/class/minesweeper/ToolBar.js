/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("minesweeper.ToolBar", {
    extend: qx.ui.toolbar.ToolBar,
    include: qx.locale.MTranslation,

    construct() {
        // noinspection JSAnnotator
        super();
        this.__createComponents();
    },

    members: {
        __createComponents() {
            this.add(this.__createGameMenu());
            this.add(this.__createAboutMenu());
        },

        __createGameMenu() {
            const button = new qx.ui.toolbar.MenuButton(this.tr("Game"));
            button.setMenu(this.getGameMenu());
            return button;
        },

        getGameMenu() {
            const menu = new qx.ui.menu.Menu();
            const newButton = new qx.ui.menu.Button(this.tr("New"));
            newButton.addListener("execute", function() {
                minesweeper.Game.getInstance().startNew();
            }, this);
            menu.add(newButton);

            const difficultyButton = new qx.ui.menu.Button(this.tr("Difficulty"));
            difficultyButton.setMenu(this.__createDifficultyMenu());
            menu.add(difficultyButton);

            const languageButton = new qx.ui.menu.Button(this.tr("Language"));
            languageButton.setMenu(this.__createLanguageMenu());
            menu.add(languageButton);


            const themeButton = new qx.ui.menu.Button(this.tr("Theme"));
            themeButton.setMenu(this.__createThemeMenu());
            menu.add(themeButton);

            return menu;
        },

        __createDifficultyMenu() {
            const menu = new qx.ui.menu.Menu();
            const difficulties = minesweeper.Game.getDifficulties();
            const difficultyGroup = new qx.ui.form.RadioGroup();
            difficulties.forEach(difficulty => {
                const capitalized = qx.lang.String.firstUp(difficulty);
                const button = new qx.ui.menu.RadioButton(capitalized, null);
                menu.add(button);
                difficultyGroup.add(button);
            });
            difficultyGroup.addListener("changeValue", function(e) {
                const value = qx.lang.String.firstLow(e.getData().getLabel());
                minesweeper.Game.getInstance().setDifficulty(value);
            }, this);
            return menu;
        },

        __createLanguageMenu() {
            const menu = new qx.ui.menu.Menu();
            const languages = qx.locale.Manager.getInstance().getAvailableLocales();
            const languageGroup = new qx.ui.form.RadioGroup();
            languages.forEach(language => {
                const capitalized = qx.lang.String.firstUp(language);
                const button = new qx.ui.menu.RadioButton(capitalized, null);
                menu.add(button);
                languageGroup.add(button);
            });
            languageGroup.addListener("changeValue", function(e) {
                const locale = qx.lang.String.firstLow(e.getData().getLabel());
                qx.locale.Manager.getInstance().setLocale(locale);
            }, this);
            qx.locale.Manager.getInstance().setLocale(qx.lang.String.firstLow(languageGroup.getValue().getLabel()));
            return menu;
        },

        __createThemeMenu() {
            const menu = new qx.ui.menu.Menu();
            const themes = ["classic", "indigo"];
            const themeGroup = new qx.ui.form.RadioGroup();
            themes.forEach(language => {
                const capitalized = qx.lang.String.firstUp(language);
                const button = new qx.ui.menu.RadioButton(capitalized, null);
                menu.add(button);
                themeGroup.add(button);
            });
            themeGroup.addListener("changeValue", function(e) {
                const themeName = qx.lang.String.firstLow(e.getData().getLabel());
                minesweeper.ThemeChanger.setThemeByStringName(themeName);
            }, this);
            return menu;
        },


        __createAboutMenu() {
            const menuButton = new qx.ui.toolbar.MenuButton(this.tr("Help"));
            const menu = new qx.ui.menu.Menu();
            menuButton.setMenu(menu);
            const aboutButton = new qx.ui.menu.Button(this.tr("About"));
            aboutButton.addListener("execute", this._onAboutButton, this);
            menu.add(aboutButton);
            return menuButton;
        },

        _onAboutButton() {
            minesweeper.window.Desktop.getInstance().openAboutWindow();
        }
    }
});
