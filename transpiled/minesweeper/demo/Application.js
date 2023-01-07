(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.application.Standalone": {
        "require": true
      },
      "qx.log.appender.Native": {},
      "qx.log.appender.Console": {},
      "qx.theme.iconfont.LoadMaterialIcons": {},
      "qx.ui.window.Manager": {},
      "minesweeper.window.Desktop": {},
      "minesweeper.window.Main": {},
      "minesweeper.Game": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     Copyright: 2023 Dmitrii Zolotov
  
     License: MIT license
  
     Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru
  
  ************************************************************************ */

  /**
   * This is the main application class of "minesweeper"
   */
  qx.Class.define("minesweeper.demo.Application", {
    extend: qx.application.Standalone,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * This method contains the initial application code and gets called
       * during startup of the application
       *
       * @lint ignoreDeprecated(alert)
       */
      main: function main() {
        // Call super class
        minesweeper.demo.Application.superclass.prototype.main.call(this); // Enable logging in debug variant

        {
          // support native logging capabilities, e.g. Firebug for Firefox
          qx.log.appender.Native; // support additional cross-browser console. Press F7 to toggle visibility

          qx.log.appender.Console;
        }
        qx.theme.iconfont.LoadMaterialIcons;
        var manager = new qx.ui.window.Manager();
        var desktop = minesweeper.window.Desktop.getInstance();
        desktop.setWindowManager(manager);
        var mainWin = new minesweeper.window.Main();
        mainWin.open();
        desktop.add(mainWin);
        this.getRoot().add(desktop, {
          width: "100%",
          height: "100%"
        });
        minesweeper.Game.getInstance().startNew();
      }
    }
  });
  minesweeper.demo.Application.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Application.js.map?dt=1673131549211