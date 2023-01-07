(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.Desktop": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     Copyright: 2023 Dmitrii Zolotov
  
     License: MIT license
  
     Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru
  
  ************************************************************************ */
  qx.Class.define("minesweeper.window.Desktop", {
    extend: qx.ui.window.Desktop,
    type: "singleton"
  });
  minesweeper.window.Desktop.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Desktop.js.map?dt=1673131550131