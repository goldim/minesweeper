/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("minesweeper.OpenedSquare", {
    extend: qx.ui.basic.Atom,

    properties: {
        appearance: {
            init: "square-opened",
            refine: true
        }
    }
});
