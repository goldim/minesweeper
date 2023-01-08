/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

/**
 * This is the main application class of "minesweeper"
 */
qx.Class.define("minesweeper.demo.Application", {
  extend : qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main() {
      // Call super class
      super.main();

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug")) {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      qx.theme.iconfont.LoadMaterialIcons;
      
      const desktop = minesweeper.window.Desktop.getInstance();
      this.getRoot().add(desktop, {width: "100%", height: "100%"});
      minesweeper.Game.getInstance().startNew();
    }
  }
});
