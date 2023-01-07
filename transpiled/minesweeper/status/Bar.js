(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.container.Composite": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.Dock": {
        "construct": true
      },
      "minesweeper.Game": {},
      "qx.ui.basic.Atom": {},
      "minesweeper.status.State": {},
      "qx.ui.layout.HBox": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     Copyright: 2023 Dmitrii Zolotov
  
     License: MIT license
  
     Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru
  
  ************************************************************************ */
  qx.Class.define("minesweeper.status.Bar", {
    extend: qx.ui.container.Composite,
    construct: function construct() {
      // noinspection JSAnnotator
      qx.ui.container.Composite.constructor.call(this);
      this.setLayout(new qx.ui.layout.Dock());

      this.__createComponents__P_28_0();
    },
    properties: {
      appearance: {
        init: "status-bar",
        refine: true
      },
      time: {
        init: "--:--",
        check: "String",
        event: "changeTime"
      }
    },
    statics: {
      addTrailingZeros: function addTrailingZeros(value) {
        var firstDigit = "";

        if (value < 100) {
          firstDigit = "0";
        }

        var secondDigit = "";

        if (value < 10) {
          secondDigit = "0";
        }

        return "".concat(firstDigit).concat(secondDigit).concat(value);
      },
      convertTime: function convertTime(timeInSeconds) {
        var minutes = Math.floor(timeInSeconds / 60);
        var minuteTrailingZero = minutes < 10 ? "0" : "";
        var seconds = timeInSeconds % 60;
        var secondsTrailingZero = seconds < 10 ? "0" : "";
        return "".concat(minuteTrailingZero).concat(minutes, ":").concat(secondsTrailingZero).concat(seconds);
      }
    },
    members: {
      __createComponents__P_28_0: function __createComponents__P_28_0() {
        var game = minesweeper.Game.getInstance();
        var minesLeftLabel = new qx.ui.basic.Atom();
        minesLeftLabel.setAppearance("status-label");
        game.bind("minesLeft", minesLeftLabel, "label", {
          converter: this.constructor.addTrailingZeros
        });

        this.__createComponent__P_28_1("left", "west", minesLeftLabel);

        var state = new minesweeper.status.State();
        game.bind("state", state, "status");
        state.addListener("execute", function () {
          game.startNew();
        }, this);

        this.__createComponent__P_28_1("center", "center", state);

        var timeLabel = new qx.ui.basic.Atom();
        timeLabel.setAppearance("status-label");
        game.getTimer().bind("time", timeLabel, "label", {
          converter: this.constructor.convertTime
        });

        this.__createComponent__P_28_1("right", "east", timeLabel);
      },
      __createComponent__P_28_1: function __createComponent__P_28_1(alignX, edge, component) {
        var block = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
          alignX: alignX
        }));
        block.add(component);
        this.add(block, {
          edge: edge
        });
      }
    }
  });
  minesweeper.status.Bar.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Bar.js.map?dt=1673131552574