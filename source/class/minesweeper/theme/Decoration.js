/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Theme.define("minesweeper.theme.Decoration",
{
  extend : qx.theme.classic.Decoration,

  decorations :
  {
    "opened-square-bordered": {
      style: {
        width: [0, 1, 1, 0],
        style: "solid",
        color: "gray"
      }
    },

    "status-label-bordered": {
      style: {
        width: 2,
        style: "solid",
        color: "red"
      }
    },

    "status-bar-bordered": {
      include: "inset"
    }
  }
});
