(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "minesweeper.Timer": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     Copyright: 2023 Dmitrii Zolotov
  
     License: MIT license
  
     Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru
  
  ************************************************************************ */
  qx.Class.define("minesweeper.Game", {
    extend: qx.core.Object,
    type: "singleton",
    construct: function construct() {
      // noinspection JSAnnotator
      qx.core.Object.constructor.call(this);
      this.__timer__P_6_0 = new minesweeper.Timer();
    },
    properties: {
      minesLeft: {
        init: 0,
        check: "Integer",
        event: "changeMinesLeft"
      },
      difficulty: {
        init: "low",
        check: function check(value) {
          return minesweeper.Game.getDifficulties().includes(value);
        },
        event: "changeDifficulty",
        apply: "_applyDifficulty"
      },
      state: {
        init: "start",
        check: ["start", "over", "success"],
        event: "changeState",
        apply: "_applyState"
      }
    },
    statics: {
      DIFFICULTY_OPTIONS: {
        low: {
          mineCount: 10,
          colSize: 9,
          rowSize: 9
        },
        medium: {
          mineCount: 40,
          colSize: 16,
          rowSize: 16
        },
        hard: {
          mineCount: 99,
          colSize: 30,
          rowSize: 16
        }
      },
      getDifficulties: function getDifficulties() {
        return Object.keys(minesweeper.Game.DIFFICULTY_OPTIONS);
      }
    },
    members: {
      _applyState: function _applyState(state) {
        switch (state) {
          case "start":
            this.__timer__P_6_0.start();

            break;

          case "over":
          case "success":
            this.setMinesLeft(0);

            this.__timer__P_6_0.stop();

            break;
        }
      },
      _applyDifficulty: function _applyDifficulty() {
        this.setState("start");

        this.__timer__P_6_0.start();

        this.__updateMinesLeft__P_6_1();
      },
      __updateMinesLeft__P_6_1: function __updateMinesLeft__P_6_1() {
        this.setMinesLeft(this.getMineCount());
      },
      startNew: function startNew() {
        this.setState("over");
        this.setState("start");

        this.__updateMinesLeft__P_6_1();
      },
      getMineCount: function getMineCount() {
        return this.__extractFieldFromMap__P_6_2("mineCount");
      },
      getColumnSize: function getColumnSize() {
        return this.__extractFieldFromMap__P_6_2("colSize");
      },
      getRowSize: function getRowSize() {
        return this.__extractFieldFromMap__P_6_2("rowSize");
      },
      __extractFieldFromMap__P_6_2: function __extractFieldFromMap__P_6_2(difficulty) {
        return this.constructor.DIFFICULTY_OPTIONS[this.getDifficulty()][difficulty];
      },
      decreaseSpottedMinesByOne: function decreaseSpottedMinesByOne() {
        this.setMinesLeft(this.getMinesLeft() + 1);
      },
      increaseSpottedMinesByOne: function increaseSpottedMinesByOne() {
        this.setMinesLeft(this.getMinesLeft() - 1);
      },
      getTimer: function getTimer() {
        return this.__timer__P_6_0;
      }
    }
  });
  minesweeper.Game.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Game.js.map?dt=1673131550197