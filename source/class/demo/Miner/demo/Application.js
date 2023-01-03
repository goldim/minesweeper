/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

/**
 * This is the main application class of "demo.Miner"
 */
qx.Class.define("demo.Miner.demo.Application", {
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
    main(){
      // Call super class
      super.main();

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug")){
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      qx.theme.iconfont.LoadMaterialIcons;
      const manager = new qx.ui.window.Manager();
      const desktop = new qx.ui.window.Desktop(manager);
      const mainWin = new demo.Miner.window.Main();
      mainWin.open();
      desktop.add(mainWin);
      this.getRoot().add(desktop, {width: "100%", height: "100%"});
      demo.Miner.Game.getInstance().startNew();
    }
  }
});