(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
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
  qx.Class.define("minesweeper.theme.Image", {
    extend: qx.core.Object,
    statics: {
      /**
       * Holds a map containing all the URL to the images.
       * @internal
       */
      URLS: {
        blank: "qx/static/blank.png",
        "square-flagged": "@MaterialIcons/flag/16",
        "square-question": "@MaterialIcons/question_mark/16",
        "square-mined": "minesweeper/mine.png",
        "state-button-start": "@MaterialIcons/sentiment_satisfied_alt/24",
        "state-button-success": "@MaterialIcons/sentiment_very_satisfied/24",
        "state-button-over": "@MaterialIcons/sentiment_very_dissatisfied/24",
        "main-window-icon": "minesweeper/caption.png",
        "about-window-icon": "@MaterialIcons/info/16"
      }
    }
  });
  minesweeper.theme.Image.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Image.js.map?dt=1673131552958