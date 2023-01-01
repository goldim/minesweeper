/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.Game", {
    extend: qx.core.Object,

    construct(){
        this.base(arguments);
    },

    properties: {
        difficulty: {
            init: "low",
            check: ["low", "medium", "hard"]
        }
    },

    members: {

    }
});