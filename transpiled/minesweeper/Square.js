(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.Button": {
        "construct": true,
        "require": true
      },
      "minesweeper.Game": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     Copyright: 2023 Dmitrii Zolotov
  
     License: MIT license
  
     Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru
  
  ************************************************************************ */
  qx.Class.define("minesweeper.Square", {
    extend: qx.ui.form.Button,
    construct: function construct() {
      // noinspection JSAnnotator
      qx.ui.form.Button.constructor.call(this, "");
      this.addListener("contextmenu", this._onRightClick, this);
      this.addListener("execute", this._onExecute, this);
    },
    properties: {
      appearance: {
        init: "square",
        refine: true
      },
      value: {
        init: 0,
        check: "Integer"
      },
      columnNo: {
        init: 0,
        check: "Integer"
      },
      rowNo: {
        init: 0,
        check: "Integer"
      },
      blocked: {
        init: false,
        check: "Boolean"
      }
    },
    events: {
      "open": "qx.event.type.Event",
      "blast": "qx.event.type.Event"
    },
    members: {
      _onExecute: function _onExecute() {
        if (this.getBlocked()) {
          return;
        }

        if (!this.hasState("flagged")) {
          if (this.hasState("mined")) {
            this.addState("blasted");
            this.fireEvent("blast");
          } else {
            this.fireEvent("open");
          }
        }
      },
      _onRightClick: function _onRightClick() {
        if (this.getBlocked()) {
          return;
        }

        var game = minesweeper.Game.getInstance();

        if (this.hasState("flagged")) {
          this.replaceState("flagged", "questioned");
          game.decreaseSpottedMinesByOne();
        } else if (this.hasState("questioned")) {
          this.removeState("questioned");
        } else if (!(minesweeper.Game.getInstance().getMinesLeft() === 0 && !this.hasState("flagged"))) {
          this.addState("flagged");
          game.increaseSpottedMinesByOne();
        }
      }
    }
  });
  minesweeper.Square.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Square.js.map?dt=1673131557929