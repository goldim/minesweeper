/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.status.State", {
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
        _applyStatus(value, oldValue){
            if (!oldValue){
                this.addState(value);
            } else {
                this.replaceState(oldValue, value);
            }
        }
    }
});