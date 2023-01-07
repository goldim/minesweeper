(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.Window": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.basic.Atom": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     Copyright: 2023 Dmitrii Zolotov
  
     License: MIT license
  
     Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru
  
  ************************************************************************ */
  qx.Class.define("minesweeper.window.About", {
    extend: qx.ui.window.Window,
    construct: function construct() {
      // noinspection JSAnnotator
      qx.ui.window.Window.constructor.call(this, this.tr("About Minesweeper"));
      this.set({
        allowMinimize: false,
        allowMaximize: false,
        resizable: false
      });
      this.setLayout(new qx.ui.layout.VBox());

      this._createChildControl("description");
    },
    properties: {
      appearance: {
        init: "about-window",
        refine: true
      }
    },
    members: {
      _createChildControlImpl: function _createChildControlImpl(name) {
        var control;

        switch (name) {
          case "description":
            control = new qx.ui.basic.Atom(this.__getDescription__P_83_0());
            control.setRich(true);

            this._add(control);

            break;
        }

        return control || minesweeper.window.About.superclass.prototype._createChildControlImpl.call(this, name);
      },
      __getDescription__P_83_0: function __getDescription__P_83_0() {
        return this.tr("The application is based on Qooxdoo framework.The goal of the application is demonstration of possibilities of the framework.Any functionality or source code improvement is welcomed.");
      }
    }
  });
  minesweeper.window.About.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=About.js.map?dt=1673131557660