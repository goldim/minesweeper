/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.OpenedSquare", {
    extend: qx.ui.basic.Atom,

    properties: {
        appearance: {
            init: "opened-square",
            refine: true
        }
    }
});
