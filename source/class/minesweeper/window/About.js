/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("minesweeper.window.About", {
   extend: qx.ui.window.Window,

   construct() {
      // noinspection JSAnnotator
      super(this.tr("About Minesweeper"));
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
      _createChildControlImpl(name) {
         let control;
         switch (name) {
            case "description":
               control = new qx.ui.basic.Atom(this.__getDescription());
               control.setRich(true);
               this._add(control);
               break;
         }
         return control || super._createChildControlImpl(name);
      },

      __getDescription() {
         return this.tr("The application is based on Qooxdoo framework." +
         "The goal of the application is demonstration of possibilities of the framework." +
         "Any functionality or source code improvement is welcomed.");
      }
   }
});
