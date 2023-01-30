qx.Class.define("minesweeper.ThemeChanger", {
    type: "static",

    statics: {
        setTheme(theme){
            const themeAParts = [theme.meta.color, theme.meta.font, theme.meta.decoration, theme.meta.appearance];
            const themeBParts = [minesweeper.theme.Color, minesweeper.theme.Font, minesweeper.theme.Decoration, minesweeper.theme.Appearance];

            for (let i = 0; i < themeAParts.length; i++){
                qx.Theme.include(themeAParts[i],themeBParts[i]);
            }

            qx.theme.manager.Meta.getInstance().setTheme(theme);
        },

        setThemeByStringName(themeName){
            switch (themeName){
                case "indigo":
                    this.setTheme(qx.theme.Indigo);
                    break;
                default:
                    this.setTheme(qx.theme.Classic);
            }
        }
    }
});