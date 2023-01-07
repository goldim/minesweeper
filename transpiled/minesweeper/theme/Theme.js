(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "minesweeper.theme.Color": {
        "require": true
      },
      "minesweeper.theme.Decoration": {
        "require": true
      },
      "minesweeper.theme.Font": {
        "require": true
      },
      "qx.theme.icon.Tango": {
        "require": true
      },
      "minesweeper.theme.Appearance": {
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
  qx.Theme.define("minesweeper.theme.Theme", {
    meta: {
      color: minesweeper.theme.Color,
      decoration: minesweeper.theme.Decoration,
      font: minesweeper.theme.Font,
      icon: qx.theme.icon.Tango,
      appearance: minesweeper.theme.Appearance
    }
  });
  minesweeper.theme.Theme.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Theme.js.map?dt=1673131549396