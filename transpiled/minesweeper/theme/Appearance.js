(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.classic.Appearance": {
        "require": true
      },
      "minesweeper.theme.Image": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     Copyright: 2023 Dmitrii Zolotov
  
     License: MIT license
  
     Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru
  
  ************************************************************************ */
  qx.Theme.define("minesweeper.theme.Appearance", {
    extend: qx.theme.classic.Appearance,
    appearances: {
      "main-window": {
        include: "window",
        alias: "window",
        style: function style() {
          return {
            alignX: "center",
            alignY: "middle",
            icon: minesweeper.theme.Image.URLS["main-window-icon"]
          };
        }
      },
      "about-window": {
        include: "window",
        alias: "window",
        style: function style() {
          return {
            alignX: "center",
            alignY: "middle",
            icon: minesweeper.theme.Image.URLS["about-window-icon"],
            width: 300
          };
        }
      },
      "about-window/maximize-button": {
        style: function style() {
          return {
            opacity: 0
          };
        }
      },
      "about-window/minimize-button": {
        style: function style() {
          return {
            opacity: 0
          };
        }
      },
      "about-window/description": {
        include: "atom",
        alias: "atom",
        style: function style() {
          return {
            icon: minesweeper.theme.Image.URLS["main-window-icon"],
            padding: 5
          };
        }
      },
      "about-window/description/icon": {
        style: function style() {
          return {
            scale: true,
            width: 64,
            height: 64
          };
        }
      },
      "about-window/description/label": {
        include: "label",
        alias: "label",
        style: function style() {
          return {
            textAlign: "left"
          };
        }
      },
      "main-window/icon": {
        style: function style() {
          return {
            scale: true,
            width: 16,
            height: 16
          };
        }
      },
      "status-bar": {
        style: function style() {
          return {
            decorator: "status-bar-bordered",
            padding: 5,
            marginBottom: 10
          };
        }
      },
      "board": {
        style: function style() {
          return {
            decorator: "status-bar-bordered"
          };
        }
      },
      square: {
        include: "button",
        alias: "button",
        style: function style(states) {
          return {
            icon: minesweeper.theme.Image.URLS[states.flagged ? "square-flagged" : states.questioned ? "square-question" : ""],
            width: 32,
            height: 32
          };
        }
      },
      "square/icon": {
        style: function style() {
          return {
            alignX: "center",
            scale: true,
            width: 16,
            height: 16
          };
        }
      },
      "status-label": {
        include: "atom",
        alias: "atom",
        style: function style() {
          return {
            decorator: "status-label-bordered",
            font: "square-danger",
            textColor: "red",
            paddingRight: 5,
            paddingLeft: 5,
            backgroundColor: "black"
          };
        }
      },
      "state-button": {
        include: "button",
        alias: "button",
        style: function style(states) {
          return {
            icon: minesweeper.theme.Image.URLS[states.start ? "state-button-start" : states.over ? "state-button-over" : "state-button-success"]
          };
        }
      },
      "state-button/icon": {
        style: function style() {
          return {
            alignX: "center",
            scale: true,
            width: 24,
            height: 24
          };
        }
      },
      "opened-square": {
        style: function style(states) {
          var icon = null;

          if (states.mined) {
            icon = minesweeper.theme.Image.URLS["square-mined"];
          }

          var textColor;

          for (var i = 1; i < 9; i++) {
            var color = "mines-around-".concat(i);

            if (states[color]) {
              textColor = color;
              break;
            }
          }

          return {
            textColor: textColor,
            backgroundColor: states.blasted ? "red" : undefined,
            icon: icon,
            width: 32,
            height: 32,
            alignX: "center"
          };
        }
      },
      "opened-square/icon": {
        style: function style() {
          return {
            scale: true,
            width: 32,
            height: 32
          };
        }
      },
      "opened-square/label": {
        style: function style() {
          return {
            textAlign: "center",
            font: "square-danger",
            width: 32,
            height: 32
          };
        }
      }
    }
  });
  minesweeper.theme.Appearance.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Appearance.js.map?dt=1673131550411