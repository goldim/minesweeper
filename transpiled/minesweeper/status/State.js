(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.Button": {
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
  qx.Class.define("minesweeper.status.State", {
    extend: qx.ui.form.Button,
    properties: {
      status: {
        init: "start",
        check: ["start", "over", "success"],
        event: "changeState",
        apply: "_applyStatus"
      },
      appearance: {
        init: "state-button",
        refine: true
      }
    },
    members: {
      _applyStatus: function _applyStatus(value, oldValue) {
        if (!oldValue) {
          this.addState(value);
        } else {
          this.replaceState(oldValue, value);
        }
      }
    }
  });
  minesweeper.status.State.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=State.js.map?dt=1673131557558